import { GoogleGenAI } from "@google/genai";

export async function POST(request) {
  try {
    const { message } = await request.json();

    if (!message || !message.trim()) {
      return Response.json(
        { error: "No se recibió ningún mensaje." },
        { status: 400 }
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      return Response.json(
        { error: "Falta configurar GEMINI_API_KEY." },
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `
Sos Patitas IA, el asistente virtual de una veterinaria llamada Veterinaria Patitas.

Tu función es ayudar a clientes, recepcionistas, veterinarios y administradores.

Podés responder:
- preguntas generales;
- preguntas sobre animales y cuidados veterinarios;
- vacunas;
- alimentación;
- turnos;
- cuidados de mascotas;
- información de la veterinaria.

Respondé siempre en español, de manera clara, amable y rápida.

Si una consulta requiere un diagnóstico veterinario profesional, aclaralo y recomendá consultar con un veterinario.

IMPORTANTE:
Por ahora solamente tenés acceso a la información que aparece en el mensaje del usuario. No inventes datos de pacientes.

Mensaje del usuario:
${message}
      `,
    });

    return Response.json({
      response: response.text,
    });
  } catch (error) {
    console.error("Error en Patitas IA:", error);

    return Response.json(
      {
        error: "No pude conectarme con la inteligencia artificial.",
      },
      { status: 500 }
    );
  }
}