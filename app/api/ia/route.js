import { GoogleGenAI } from "@google/genai";

// Límite de caracteres para prevenir ataques de denegación de servicio por longitud
const MAX_MESSAGE_LENGTH = 2000;

// Instrucción del sistema centralizada y aislada del contenido de usuario
const SYSTEM_INSTRUCTION = `
Sos Patitas IA, el asistente virtual oficial de Veterinaria Patitas.

Tu función principal es brindar asistencia general e informativa a:
- Clientes y tutores de mascotas
- Veterinarios, recepcionistas y personal administrativo

ÁMBITO DE RESPUESTA:
- Cuidados generales, alimentación, higiene, vacunación y desparasitación de perros, gatos y otras mascotas comunes.
- Orientación general sobre agendamiento de turnos y servicios de la veterinaria.

REGLAS STRICTAS:
1. IDIOMA Y TONO: Respondé siempre en español. Sé empático, claro, profesional y conciso.
2. LIMITACIÓN DE DIAGNÓSTICO: No sos un médico veterinario. NUNCA diagnostiques ni recetes medicamentos específicos.
3. URGENCIAS Y EMERGENCIAS: Si el usuario describe síntomas graves (dificultad respiratoria, convulsiones, sangrado, ingesta de tóxicos, apatía severa), indicá INMEDIATAMENTE que acuda a una consulta de urgencia con un profesional veterinario.
4. CONFIDENCIALIDAD Y DATOS PACIENTES: No inventes datos sobre pacientes, historias clínicas, turnos o costos exactos. Si consultan por la ficha de un paciente específico, aclaración de turnos dados o información privada, indicá amablemente que debes derivar la consulta al personal de recepción.
`;

/**
 * Endpoint POST para el chatbot Patitas IA
 */
export async function POST(request) {
  try {
    // 1. Validar el Content-Type de la solicitud
    const contentType = request.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      return Response.json(
        { error: "Petición no válida. Se requiere Content-Type: application/json." },
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
        { error: `El mensaje excede el límite máximo de ${MAX_MESSAGE_LENGTH} caracteres.` },
        { status: 400 }
      );
    }

    // 4. Verificación de credenciales de entorno
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("[CRÍTICO] Variable de entorno GEMINI_API_KEY no configurada.");
      return Response.json(
        { error: "Error de configuración interna del servidor." },
        { status: 500 }
      );
    }

    // 5. Inicialización de cliente y ejecución con SDK oficial @google/genai
    const ai = new GoogleGenAI({ apiKey });

    // Normalización del historial previo si está presente
    const formattedHistory = Array.isArray(history)
      ? history
          .filter((item) => item && typeof item.text === "string" && (item.role === "user" || item.role === "model"))
          .map((item) => ({
            role: item.role,
            parts: [{ text: item.text.trim() }],
          }))
      : [];

    // Llamada al modelo Gemini Flash
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        ...formattedHistory,
        {
          role: "user",
          parts: [{ text: sanitizedMessage }],
        },
      ],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.4, // Temperatura moderada para respuestas precisas y consistentes
        maxOutputTokens: 800,
      },
    });

    const replyText = response.text || "No fue posible generar una respuesta en este momento.";

    return Response.json(
      {
        response: replyText,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );

  } catch (error) {
    // Registro detallado en logs de servidor (para monitoreo interno)
    console.error("[PATITAS IA ERROR]:", {
      message: error?.message,
      name: error?.name,
      code: error?.code,
      stack: process.env.NODE_ENV === "development" ? error?.stack : undefined,
    });

    // Respuesta genérica de seguridad al cliente (evita Information Disclosure)
    return Response.json(
      {
        error: "Ocurrió un inconveniente al procesar tu consulta con Patitas IA. Por favor, intentalo de nuevo más tarde.",
      },
      { status: 500 }
    );
  }
}