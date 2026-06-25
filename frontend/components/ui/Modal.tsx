"use client";

import { useEffect, ReactNode } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  maxWidth?: string;
  noPadding?: boolean;
}

export function Modal({ open, onClose, title, children, maxWidth = "max-w-md", noPadding = false }: ModalProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
      <div className="absolute inset-0 bg-ink/40" onClick={onClose} />
      <div className={`relative bg-white rounded-xl shadow-xl w-full ${maxWidth} flex flex-col max-h-[90vh] overflow-hidden`}>
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-stone/10 shrink-0">
            <h2 className="font-display text-lg text-ink">{title}</h2>
            <button onClick={onClose} className="text-stone hover:text-ink transition-colors">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        {/* Scrollable body */}
        <div className={`overflow-y-auto flex-1 ${noPadding ? "" : "p-6"}`}>
          {children}
        </div>
      </div>
    </div>
  );
}
