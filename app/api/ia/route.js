import { GoogleGenAI } from "@google/genai";

export async function POST(request) {
  try {
    const { message } = await request.json();

    if (!message || !message.trim()) {
      return Response.json(
        {
          error: "No se recibió ningún mensaje.",
        },
        {
          status: 400,
        }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return Response.json(
        {
          error: "Falta configurar GEMINI_API_KEY.",
        },
        {
          status: 500,
        }
      );
    }

    const ai = new GoogleGenAI({
      apiKey: apiKey,
    });

    const prompt = `
Sos Patitas IA, el asistente virtual de Veterinaria Patitas.

Tu función es ayudar a:
- Clientes
- Veterinarios
- Recepcionistas
- Administradores

Podés responder preguntas sobre:
- Perros
- Gatos
- Otras mascotas
- Cuidados
- Alimentación
- Vacunas
- Higiene
- Medicamentos
- Turnos
- Atención veterinaria
- Información general de veterinaria

REGLAS:
- Respondé siempre en español.
- Sé claro, amable y breve.
- No inventes información sobre pacientes.
- No inventes nombres, vacunas, medicamentos, turnos ni datos de la veterinaria.
- Si el usuario pregunta por un paciente específico y no recibiste sus datos, indicá que necesitás consultar la información del paciente.
- No reemplaces a un veterinario.
- Ante una situación urgente, recomendá consultar rápidamente con un veterinario.

Mensaje del usuario:
${message}
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
    });

    return Response.json({
      response: response.text,
    });

  } catch (error) {
    console.error("=================================");
    console.error("ERROR COMPLETO DE PATITAS IA");
    console.error("Mensaje:", error?.message);
    console.error("Nombre:", error?.name);
    console.error("Código:", error?.code);
    console.error("Stack:", error?.stack);
    console.error("=================================");

    return Response.json(
      {
        error: "Error de Gemini",
        details: error?.message || "Error desconocido",
      },
      {
        status: 500,
      }
    );
  }
}