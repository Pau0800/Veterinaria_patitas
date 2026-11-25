import { GoogleGenAI } from "@google/genai";
import { getAuthenticatedProfile } from "@/lib/auth";

export const dynamic = "force-dynamic";

// Límite de caracteres para prevenir ataques de denegación de servicio por longitud
const MAX_MESSAGE_LENGTH = 2000;

const PRIMARY_MODEL = process.env.GEMINI_MODEL?.trim() || "gemini-3.8-flash";
const FALLBACK_MODELS = [
  "gemini-3.7-flash",
  "gemini-3.5-flash",
  "gemini-flash-latest",
];

// Instrucción del sistema centralizada y aislada del contenido de usuario
const SYSTEM_INSTRUCTION = `
Sos Patitas IA, el asistente virtual oficial de Veterinaria Patitas.

Tu función principal es brindar asistencia general e informativa a:
- Clientes y tutores de mascotas
- Veterinarios, recepcionistas y personal administrativo

ÁMBITO DE RESPUESTA:
- Cuidados generales, alimentación, higiene, vacunación y desparasitación de perros, gatos y otras mascotas comunes.
- Orientación general sobre agendamiento de turnos y servicios de la veterinaria.

REGLAS ESTRICTAS:
1. IDIOMA Y TONO: Respondé siempre en español. Sé empático, claro, profesional y conciso.
2. LIMITACIÓN DE DIAGNÓSTICO: No sos un médico veterinario. NUNCA diagnostiques ni recetes medicamentos específicos.
3. URGENCIAS Y EMERGENCIAS: Si el usuario describe síntomas graves (dificultad respiratoria, convulsiones, sangrado, ingesta de tóxicos, apatía severa), indicá INMEDIATAMENTE que acuda a una consulta de urgencia con un profesional veterinario.
4. CONFIDENCIALIDAD Y DATOS PACIENTES: No inventes datos sobre pacientes, historias clínicas, turnos o costos exactos. Si consultan por la ficha de un paciente específico, aclaración de turnos dados o información privada, indicá amablemente que debes derivar la consulta al personal de recepción.
`;

function normalizeHistory(history) {
  if (!Array.isArray(history)) return [];

  return history
    .filter((item) => {
      if (!item || item.isError) return false;
      const rawText = typeof item.text === "string" ? item.text : item.content;
      return typeof rawText === "string" && rawText.trim().length > 0;
    })
    .slice(-12)
    .map((item) => {
      const rawText = (
        typeof item.text === "string" ? item.text : item.content
      ).trim();
      const normalizedRole = item.role === "user" ? "user" : "model";
      return {
        role: normalizedRole,
        parts: [{ text: rawText }],
      };
    });
}

function getClientErrorResponse(error) {
  const status = Number(error?.status) || 500;

  if (status === 401 || status === 403) {
    return {
      status: 502,
      message:
        "No se pudo autenticar la solicitud con el servicio de IA. Revisá la clave GEMINI_API_KEY.",
    };
  }
  if (status === 404) {
    return {
      status: 502,
      message:
        "El modelo de IA configurado no está disponible en este momento.",
    };
  }
  if (status === 429) {
    return {
      status: 429,
      message:
        "Se alcanzó el límite temporal de consultas de Patitas IA. Intentá nuevamente en unos instantes.",
    };
  }
  if (status === 503) {
    return {
      status: 503,
      message:
        "Patitas IA está experimentando alta demanda en este momento. Por favor, reintentá en unos segundos.",
    };
  }

  return {
    status: 500,
    message:
      "Ocurrió un inconveniente al procesar tu consulta con Patitas IA. Por favor, intentalo de nuevo más tarde.",
  };
}

/**
 * Endpoint POST para el chatbot Patitas IA
 */
export async function POST(request) {
  try {
    // 0. Verificar sesión autenticada y perfil activo en servidor
    const profile = await getAuthenticatedProfile();
    if (!profile) {
      return Response.json(
        { error: "No autorizado. Debes iniciar sesión para usar Patitas IA." },
        { status: 401 }
      );
    }

    // 1. Validar el Content-Type de la solicitud
    const contentType = request.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      return Response.json(
        {
          error:
            "Petición no válida. Se requiere Content-Type: application/json.",
        },
        { status: 400 }
      );
    }

    // 2. Parsear el cuerpo de la petición de forma segura
    let body;
    try {
      body = await request.json();
    } catch {
      return Response.json(
        { error: "Formato JSON inválido en la petición." },
        { status: 400 }
      );
    }

    const { message, history = [] } = body;

    // 3. Validación y sanitización de entrada
    if (!message || typeof message !== "string" || !message.trim()) {
      return Response.json(
        { error: "El campo 'message' es obligatorio y debe ser un texto válido." },
        { status: 400 }
      );
    }

    const sanitizedMessage = message.trim();

    if (sanitizedMessage.length > MAX_MESSAGE_LENGTH) {
      return Response.json(
        {
          error: `El mensaje excede el límite máximo de ${MAX_MESSAGE_LENGTH} caracteres.`,
        },
        { status: 400 }
      );
    }

    // 4. Verificación de credenciales de entorno (compatible con claves modernas AQ....)
    const apiKey = process.env.GEMINI_API_KEY?.trim();
    if (!apiKey) {
      console.error(
        "[CRÍTICO] Variable de entorno GEMINI_API_KEY no configurada."
      );
      return Response.json(
        { error: "Falta configurar GEMINI_API_KEY en el servidor." },
        { status: 500 }
      );
    }

    // 5. Inicialización de cliente y ejecución con SDK oficial @google/genai
    const ai = new GoogleGenAI({ apiKey });
    const formattedHistory = normalizeHistory(history);

    // Evitar duplicar el último turno si el cliente ya lo incluyó en history
    const lastHistoryItem = formattedHistory[formattedHistory.length - 1];
    const contents =
      lastHistoryItem?.role === "user" &&
      lastHistoryItem?.parts?.[0]?.text === sanitizedMessage
        ? formattedHistory
        : [
            ...formattedHistory,
            {
              role: "user",
              parts: [{ text: sanitizedMessage }],
            },
          ];

    const modelsToTry = [
      PRIMARY_MODEL,
      ...FALLBACK_MODELS.filter((m) => m !== PRIMARY_MODEL),
    ];

    let response = null;
    let lastError = null;

    for (const modelName of modelsToTry) {
      try {
        response = await ai.models.generateContent({
          model: modelName,
          contents,
          config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            temperature: 0.4,
            maxOutputTokens: 1500,
          },
        });
        break;
      } catch (err) {
        lastError = err;
        const errStatus = Number(err?.status);
        console.error(`[PATITAS IA MODEL ERROR] (${modelName}):`, {
          status: errStatus || undefined,
          name: err?.name,
          message: err?.message,
          cause: err?.cause,
        });
        // Reintentar con otro modelo solo ante modelo no disponible (404) o sobrecarga temporal (503)
        if (errStatus !== 404 && errStatus !== 503) {
          throw err;
        }
      }
    }

    if (!response) {
      throw lastError || new Error("No se obtuvo respuesta de Gemini.");
    }

    const extractedPartsText = response.candidates?.[0]?.content?.parts
      ?.map((part) => part?.text || "")
      .join("")
      .trim();

    const replyText =
      response.text ||
      extractedPartsText ||
      "No fue posible generar una respuesta en este momento.";

    return Response.json(
      {
        response: replyText,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[PATITAS IA ERROR]:", {
      status: error?.status,
      message: error?.message,
      name: error?.name,
      code: error?.code,
      cause: error?.cause,
      stack: error?.stack,
    });

    const clientError = getClientErrorResponse(error);
    return Response.json(
      { error: clientError.message },
      { status: clientError.status }
    );
  }
}
