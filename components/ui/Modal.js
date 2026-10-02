"use client";

import React, { useEffect, useRef, useState, useId } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Hook auxiliar para detectar si el componente está montado en el cliente (SSR Safety)
 */
function useHydrated() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  return hydrated;
}

/**
 * Componente Modal Principal
 */
export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  maxWidth = "max-w-2xl",
  closeOnBackdropClick = true,
  className,
}) {
  const isHydrated = useHydrated();
  const modalRef = useRef(null);
  const previousFocusRef = useRef(null);
  const titleId = useId();
  const descriptionId = useId();

  // 1. Guardar el elemento con foco activo para devolverlo al cerrar
  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement;
    } else if (previousFocusRef.current && typeof previousFocusRef.current.focus === "function") {
      previousFocusRef.current.focus();
      previousFocusRef.current = null;
    }
  }, [isOpen]);

  // 2. Bloqueo de Scroll seguro y prevención de Layout Shift
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;

    // Calcular ancho de la scrollbar para evitar saltos de pantalla
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
    };
  }, [isOpen]);

  // 3. Manejo de Tecla Escape y Atrapado de Foco (Focus Trap)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      // Cierre con Escape
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }

      // Atrapado de Foco (Tab Navigation Trap)
      if (e.key === "Tab" && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll(
          'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );

        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    // Mover automáticamente el foco al modal o al botón de cierre
    const timer = setTimeout(() => {
      if (modalRef.current) {
        const closeBtn = modalRef.current.querySelector('[aria-label="Cerrar modal"]');
        if (closeBtn) {
          closeBtn.focus();
        } else {
          modalRef.current.focus();
        }
      }
    }, 50);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      clearTimeout(timer);
    };
  }, [isOpen, onClose]);

  if (!isHydrated || !isOpen) return null;

  const handleBackdropClick = (e) => {
    if (closeOnBackdropClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-autumn-900/60 backdrop-blur-sm transition-opacity duration-200 animate-in fade-in-0"
      onClick={handleBackdropClick}
      aria-hidden="true"
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        className={cn(
          "bg-white w-full rounded-2xl shadow-autumn-lg border border-autumn-200/80 overflow-hidden flex flex-col max-h-[90vh] transition-all duration-200 animate-in zoom-in-95 focus:outline-none",
          maxWidth,
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera */}
        {(title || onClose) && (
          <div className="px-6 py-4 border-b border-autumn-100/80 flex items-center justify-between bg-autumn-50/50">
            <div>
              {title && (
                <h2 id={titleId} className="text-lg font-bold text-autumn-900 leading-snug">
                  {title}
                </h2>
              )}
              {description && (
                <p id={descriptionId} className="text-xs text-autumn-800/70 mt-0.5">
                  {description}
                </p>
              )}
            </div>

            {onClose && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Cerrar modal"
                className="p-1.5 rounded-lg text-autumn-800/70 hover:text-autumn-900 hover:bg-autumn-200/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-autumn-500 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            )}
          </div>
        )}

        {/* Cuerpo del Modal */}
        <div className="p-6 overflow-y-auto flex-1 text-autumn-900">{children}</div>

        {/* Pie del Modal (Opcional) */}
        {footer && (
          <div className="px-6 py-3.5 border-t border-autumn-100/80 bg-autumn-50/30 flex items-center justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

/**
 * Subcomponentes Modulares para Casos Complejos (Compound Components)
 */
export function ModalHeader({ children, className }) {
  return (
    <div className={cn("px-6 py-4 border-b border-autumn-100/80 bg-autumn-50/50", className)}>
      {children}
    </div>
  );
}

export function ModalBody({ children, className }) {
  return <div className={cn("p-6 overflow-y-auto flex-1", className)}>{children}</div>;
}

export function ModalFooter({ children, className }) {
  return (
    <div
      className={cn(
        "px-6 py-3.5 border-t border-autumn-100/80 bg-autumn-50/30 flex items-center justify-end gap-3",
        className
      )}
    >
      {children}
    </div>
  );
}

Modal.Header = ModalHeader;
Modal.Body = ModalBody;
Modal.Footer = ModalFooter;

export default Modal;