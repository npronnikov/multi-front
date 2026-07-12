"use client";

import { useEffect } from "react";
import { FRONTEND_VERSION, BACKEND_VERSION } from "../lib/version";

interface VersionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function VersionModal({ isOpen, onClose }: VersionModalProps) {
  // Закрытие по Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // Предотвращаем рендеринг если modal закрыт
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg dark:bg-zinc-900"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="version-modal-title"
      >
        {/* Header with close button */}
        <div className="mb-4 flex items-center justify-between">
          <h2
            id="version-modal-title"
            className="text-xl font-semibold text-black dark:text-zinc-50"
          >
            Application Version
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-zinc-500 transition-colors hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
            aria-label="Close modal"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        {/* Version information */}
        <div className="space-y-3">
          <div className="border-b border-black/8 pb-3 dark:border-white/[.145]">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Frontend:{" "}
              <span className="font-medium text-black dark:text-zinc-50">
                {FRONTEND_VERSION}
              </span>
            </p>
          </div>
          <div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Backend:{" "}
              <span className="font-medium text-black dark:text-zinc-50">
                {BACKEND_VERSION}
              </span>
            </p>
          </div>
        </div>

        {/* Close button at bottom */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-lg bg-blue-500 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
