"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  RefreshCw,
  AlertCircle,
  Clock,
  ChevronDown,
  Bot,
  User,
} from "lucide-react";

// Sugerencias rápidas para iniciar la conversación
const QUICK_PROMPTS = [
  "🐶 ¿Cuáles son los síntomas de una emergencia?",
  "🐱 ¿Cada cuánto debo vacunar a mi gato?",
  "📋 ¿Qué requisitos necesito para una consulta?",
  "⏰ ¿Cuáles son los horarios de atención?",
];

// Mensaje inicial por defecto
const INITIAL_MESSAGE = {
  id: "welcome-msg",
  role: "assistant",
  content:
    "¡Hola! 🐾 Soy **Patitas IA**, el asistente virtual de Veterinaria Patitas. ¿En qué puedo ayudarte con la salud de tu mascota hoy?",
  timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
};

export default function GeminiChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [loading, setLoading] = useState(false);
  const [errorStatus, setErrorStatus] = useState(null);

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Scroll automático al último mensaje
  const scrollToBottom = useCallback((behavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  }, []);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom("auto");
      textareaRef.current?.focus();
    }
  }, [isOpen, scrollToBottom]);

  useEffect(() => {
    scrollToBottom("smooth");
  }, [messages, loading, scrollToBottom]);

  // Cierre de ventana con tecla Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Ajuste automático de la altura del textarea
  const handleTextareaInput = (e) => {
    setMessage(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  };

  // Enviar mensaje a la API con historial de contexto
  const sendMessage = async (textToSend) => {
    const queryText = (textToSend || message).trim();
    if (!queryText || loading) return;

    const userMessageId = `user-${Date.now()}`;
    const userMessage = {
      id: userMessageId,
      role: "user",
      content: queryText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    // Actualización optimista de la UI
    setMessages((prev) => [...prev, userMessage]);
    setMessage("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
    setLoading(true);
    setErrorStatus(null);

    // Formatear conversación para enviar a la API
    const payloadHistory = [...messages, userMessage].map((m) => ({
      role: m.role,
      content: m.content,
    }));

    try {
      const response = await fetch("/api/ia", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: queryText,
          history: payloadHistory,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.details || data?.error || "Ocurrió un problema de comunicación con el servicio."
        );
      }

      const assistantMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content:
          data.response ||
          "No he podido procesar una respuesta adecuada en este momento. Por favor reintenta.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error("Error en Patitas IA Chat:", err);
      setErrorStatus(err.message);

      const errorMessage = {
        id: `error-${Date.now()}`,
        role: "assistant",
        isError: true,
        content: `⚠️ **Aviso de Patitas IA:**\n\nNo fue posible responder a tu solicitud. (${err.message})`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, errorMessage]);
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

  const clearChat = () => {
    setMessages([INITIAL_MESSAGE]);
    setErrorStatus(null);
  };

  return (
    <>
      {/* BOTÓN FLOTANTE */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-label={isOpen ? "Cerrar asistente Patitas IA" : "Abrir asistente Patitas IA"}
        className={`fixed bottom-5 right-5 z-[99999] flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-emerald-600 text-white shadow-xl hover:shadow-emerald-600/30 transition-all duration-300 hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-emerald-400/50 ${
          isOpen ? "rotate-90 bg-slate-800" : ""
        }`}
      >
        {isOpen ? (
          <X className="h-6 w-6 sm:h-7 sm:w-7 transition-transform duration-200" />
        ) : (
          <div className="relative flex items-center justify-center">
            <span className="text-2xl sm:text-3xl">🐾</span>
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-400 border-2 border-white"></span>
            </span>
          </div>
        )}
      </button>

      {/* VENTANA DE CHAT */}
      <div
        className={`fixed bottom-22 right-4 sm:right-6 z-[99998] flex w-[calc(100vw-2rem)] sm:w-[390px] h-[540px] max-h-[80vh] flex-col overflow-hidden rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl transition-all duration-300 ease-in-out ${
          isOpen
            ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
            : "opacity-0 scale-95 translate-y-4 pointer-events-none"
        }`}
        role="dialog"
        aria-label="Chat con Patitas IA"
      >
        {/* ENCABEZADO */}
        <header className="flex items-center justify-between bg-emerald-600 dark:bg-emerald-700 px-4 py-3.5 text-white shadow-md">
          <div className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-md text-xl border border-white/30">
              🐾
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="font-bold text-base leading-tight">Patitas IA</h2>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/80 px-2 py-0.5 text-[10px] font-semibold text-white border border-emerald-400/30">
                  <Sparkles className="h-2.5 w-2.5" /> Online
                </span>
              </div>
              <p className="text-xs text-emerald-100/90 leading-tight">
                Asistente veterinario 24/7
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={clearChat}
              title="Reiniciar conversación"
              className="p-1.5 rounded-lg hover:bg-white/10 text-emerald-100 hover:text-white transition-colors focus:outline-none"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              title="Minimizar chat"
              className="p-1.5 rounded-lg hover:bg-white/10 text-emerald-100 hover:text-white transition-colors focus:outline-none"
            >
              <ChevronDown className="h-5 w-5" />
            </button>
          </div>
        </header>

        {/* ÁREA DE MENSAJES */}
        <div
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950 p-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800"
        >
          {messages.map((item) => {
            const isUser = item.role === "user";
            return (
              <div
                key={item.id}
                className={`flex gap-2.5 ${isUser ? "justify-end" : "justify-start"}`}
              >
                {!isUser && (
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-bold mt-1">
                    <Bot className="h-4 w-4" />
                  </div>
                )}

                <div className={`group flex flex-col ${isUser ? "items-end" : "items-start"}`}>
                  <div
                    className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed shadow-sm transition-all ${
                      isUser
                        ? "rounded-tr-xs bg-emerald-600 text-white"
                        : item.isError
                        ? "rounded-tl-xs bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900/50"
                        : "rounded-tl-xs bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-100 dark:border-slate-700/60"
                    }`}
                  >
                    {item.content}
                  </div>

                  <span className="mt-1 text-[10px] text-slate-400 dark:text-slate-500 px-1 flex items-center gap-1">
                    <Clock className="h-2.5 w-2.5" />
                    {item.timestamp}
                  </span>
                </div>

                {isUser && (
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-200 text-xs font-bold mt-1">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </div>
            );
          })}

          {/* INDICADOR DE CARGA */}
          {loading && (
            <div className="flex items-center gap-2.5 justify-start">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                <Bot className="h-4 w-4" />
              </div>
              <div className="rounded-2xl rounded-tl-xs bg-white dark:bg-slate-800 px-4 py-3 border border-slate-100 dark:border-slate-700/60 shadow-sm flex items-center gap-1.5">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Escribiendo
                </span>
                <span className="flex gap-1 items-center">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-bounce"></span>
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.2s]"></span>
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.4s]"></span>
                </span>
              </div>
            </div>
          )}

          {/* CHIPS DE SUGERENCIAS RÁPIDAS (Solo si hay 1 mensaje) */}
          {messages.length === 1 && !loading && (
            <div className="pt-2 space-y-2">
              <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Preguntas frecuentes:
              </p>
              <div className="flex flex-col gap-1.5">
                {QUICK_PROMPTS.map((promptText, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => sendMessage(promptText)}
                    className="text-left text-xs bg-white dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-300 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-700/80 transition-colors duration-150 flex items-center justify-between group"
                  >
                    <span>{promptText}</span>
                    <Sparkles className="h-3 w-3 text-slate-400 group-hover:text-emerald-500 transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* ÁREA DE INPUT */}
        <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 space-y-2">
          <div className="flex items-end gap-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl border border-transparent focus-within:border-emerald-500 focus-within:bg-white dark:focus-within:bg-slate-950 transition-all">
            <textarea
              ref={textareaRef}
              rows={1}
              value={message}
              onChange={handleTextareaInput}
              onKeyDown={handleKeyDown}
              disabled={loading}
              placeholder="Escribe tu consulta médica o inquietud..."
              className="flex-1 bg-transparent px-2.5 py-1 text-xs sm:text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none resize-none max-h-28 disabled:opacity-50"
            />

            <button
              type="button"
              onClick={() => sendMessage()}
              disabled={loading || !message.trim()}
              aria-label="Enviar mensaje"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white transition-all hover:bg-emerald-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-400 px-1">
            <span>Presiona Enter para enviar</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">
              Veterinaria Patitas 🐾
            </span>
          </div>
        </footer>
      </div>
    </>
  );
}