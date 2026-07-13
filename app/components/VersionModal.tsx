"use client";

import { useEffect, useRef } from "react";

interface VersionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const BUILD_DATE = new Date().toLocaleDateString("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

export default function VersionModal({ isOpen, onClose }: VersionModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== "Tab" || !modalRef.current) return;

      const focusableElements = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[
        focusableElements.length - 1
      ] as HTMLElement;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement?.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement?.focus();
          e.preventDefault();
        }
      }
    };

    document.addEventListener("keydown", handleEscape);
    document.addEventListener("keydown", handleTab);

    const closeButton = modalRef.current?.querySelector("button");
    closeButton?.focus();

    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.removeEventListener("keydown", handleTab);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
      onClick={onClose}
      aria-hidden="true"
      aria-label="Overlay"
    >
      <div
        ref={modalRef}
        className="w-full max-w-md rounded-lg border border-black/8 bg-white px-6 py-8 shadow-lg dark:bg-zinc-900 dark:border-white/[.145]"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="version-title"
      >
        <h2
          id="version-title"
          className="mb-6 text-center text-2xl font-semibold tracking-tight text-black dark:text-zinc-50"
        >
          Version Information
        </h2>

        <div className="space-y-4 text-black dark:text-zinc-50">
          <div className="flex justify-between border-b border-black/8 pb-3 dark:border-white/[.145]">
            <span className="font-medium">Frontend:</span>
            <span className="text-zinc-600 dark:text-zinc-400">v0.1.0</span>
          </div>

          <div className="flex justify-between border-b border-black/8 pb-3 dark:border-white/[.145]">
            <span className="font-medium">Backend:</span>
            <span className="text-zinc-600 dark:text-zinc-400">v0.0.1-SNAPSHOT</span>
          </div>

          <div className="flex justify-between">
            <span className="font-medium">Build date:</span>
            <span className="text-zinc-600 dark:text-zinc-400">{BUILD_DATE}</span>
          </div>
        </div>

        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-foreground px-6 py-2 font-medium text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]"
            aria-label="Close version information"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
