"use client";

import { useState } from "react";

export default function GeminiChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");

  return (
    <>
      {/* BOTÓN FLOTANTE */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-[99999] flex h-16 w-16 items-center justify-center rounded-full bg-emerald-600 text-3xl text-white shadow-2xl transition hover:scale-105"
        title="Abrir Patitas IA"
      >
        {isOpen ? "✕" : "🐾"}
      </button>

      {/* VENTANA DEL CHAT */}
      {isOpen && (
        <div className="fixed bottom-28 right-6 z-[99998] flex h-[500px] w-[360px] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">

          {/* ENCABEZADO */}
          <div className="flex items-center gap-3 bg-emerald-600 p-4 text-white">
            <div className="text-3xl">🐾</div>

            <div>
              <h2 className="font-bold">
                Patitas IA
              </h2>

              <p className="text-xs opacity-90">
                Asistente de Veterinaria Patitas
              </p>
            </div>
          </div>

          {/* MENSAJE INICIAL */}
          <div className="flex-1 overflow-y-auto bg-gray-50 p-4">
            <div className="max-w-[85%] rounded-2xl rounded-tl-none bg-white p-3 shadow">
              <p className="text-sm text-gray-700">
                ¡Hola! 🐾 Soy Patitas IA, el asistente de Veterinaria
                Patitas. ¿En qué puedo ayudarte?
              </p>
            </div>
          </div>

          {/* ESCRIBIR MENSAJE */}
          <div className="border-t bg-white p-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Escribí tu consulta..."
                className="flex-1 rounded-xl border px-3 py-2 text-sm outline-none focus:border-emerald-500"
              />

              <button
                className="rounded-xl bg-emerald-600 px-4 py-2 text-white"
              >
                ➤
              </button>
            </div>
          </div>

        </div>
      )}
    </>
  );
}