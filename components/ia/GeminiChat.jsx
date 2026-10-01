"use client";

import { useState } from "react";

export default function GeminiChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "¡Hola! 🐾 Soy Patitas IA, el asistente de Veterinaria Patitas. ¿En qué puedo ayudarte?",
    },
  ]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    const text = message.trim();

    if (!text || loading) {
      return;
    }

    // Agregar mensaje del usuario
    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: text,
      },
    ]);

    setMessage("");
    setLoading(true);

    try {
      const response = await fetch("/api/ia", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: text,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.details ||
            data?.error ||
            "No se pudo obtener una respuesta."
        );
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            data.response ||
            "No recibí una respuesta de la inteligencia artificial.",
        },
      ]);
    } catch (error) {
  console.error("ERROR DEL CHAT:", error);

  setMessages((prev) => [
    ...prev,
    {
      role: "assistant",
      content:
        `⚠️ Error de Patitas IA:\n\n${error.message}`,
    },
  ]);
} finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* BOTÓN FLOTANTE */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="fixed bottom-6 right-6 z-[99999] flex h-16 w-16 items-center justify-center rounded-full bg-emerald-600 text-3xl text-white shadow-2xl transition hover:scale-105"
        title="Abrir Patitas IA"
      >
        {isOpen ? "✕" : "🐾"}
      </button>

      {/* VENTANA DEL CHAT */}
      {isOpen && (
        <div className="fixed bottom-28 right-6 z-[99998] flex h-[520px] w-[360px] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">

          {/* ENCABEZADO */}
          <div className="flex items-center gap-3 bg-emerald-600 p-4 text-white">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-2xl">
              🐾
            </div>

            <div>
              <h2 className="font-bold text-lg">
                Patitas IA
              </h2>

              <p className="text-xs opacity-90">
                Asistente veterinario virtual
              </p>
            </div>
          </div>

          {/* MENSAJES */}
          <div className="flex-1 overflow-y-auto bg-gray-50 p-4">

            <div className="space-y-3">
              {messages.map((item, index) => (
                <div
                  key={index}
                  className={`flex ${
                    item.role === "user"
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm ${
                      item.role === "user"
                        ? "rounded-br-none bg-emerald-600 text-white"
                        : "rounded-bl-none bg-white text-gray-700 shadow"
                    }`}
                  >
                    {item.content}
                  </div>
                </div>
              ))}

              {/* CARGANDO */}
              {loading && (
                <div className="flex justify-start">
                  <div className="rounded-2xl rounded-bl-none bg-white px-4 py-3 text-sm text-gray-500 shadow">
                    Patitas IA está escribiendo... 🐾
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* INPUT */}
          <div className="border-t bg-white p-3">

            <div className="flex items-center gap-2">

              <input
                type="text"
                value={message}
                onChange={(event) =>
                  setMessage(event.target.value)
                }
                onKeyDown={handleKeyDown}
                disabled={loading}
                placeholder="Escribí tu consulta..."
                className="min-w-0 flex-1 rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 disabled:bg-gray-100"
              />

              <button
                type="button"
                onClick={sendMessage}
                disabled={loading || !message.trim()}
                className="rounded-xl bg-emerald-600 px-4 py-2 text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                ➤
              </button>

            </div>

            <p className="mt-2 text-center text-[11px] text-gray-400">
              Presioná Enter para enviar
            </p>

          </div>

        </div>
      )}
    </>
  );
}