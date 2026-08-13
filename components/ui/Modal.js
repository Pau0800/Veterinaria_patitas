"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export function Modal({ isOpen, onClose, title, children, maxWidth = "max-w-2xl" }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-autumn-900/60 backdrop-blur-sm animate-fade-in">
      <div
        className={cn(
          "bg-white w-full rounded-2xl shadow-autumn-lg border border-autumn-200 overflow-hidden flex flex-col max-h-[90vh]",
          maxWidth
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-autumn-100 flex items-center justify-between bg-autumn-50">
          <h2 className="text-xl font-bold text-autumn-900">{title}</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-autumn-800 hover:text-autumn-900 hover:bg-autumn-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">{children}</div>
      </div>
    </div>
  );
}
