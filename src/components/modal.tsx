"use client";

import { useEffect } from "react";
import { IconX } from "@tabler/icons-react";

export function Modal({
  open,
  onClose,
  title,
  children,
  overlayClassName = "bg-black/60",
  contentClassName = "max-w-md rounded-[10px] p-6",
  titleClassName = "font-display text-lg font-semibold text-ink",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  overlayClassName?: string;
  contentClassName?: string;
  titleClassName?: string;
}) {
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center px-4 py-8 ${overlayClassName}`}
      onClick={onClose}
    >
      <div
        className={`flex max-h-full w-full flex-col overflow-y-auto border border-line bg-card ${contentClassName}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className={titleClassName}>{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="text-ink-muted hover:text-ink"
          >
            <IconX size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
