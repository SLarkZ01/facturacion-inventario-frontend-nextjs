"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

type Variant = "success" | "error" | "info";

type Toast = { id: string; title?: string; description?: string; variant?: Variant };

type Context = {
  push: (t: Omit<Toast, "id"> & { variant?: Variant }) => void;
};

const ToastContext = createContext<Context | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push = useCallback((t: Omit<Toast, "id"> & { variant?: Variant }) => {
    const id = Math.random().toString(36).slice(2, 9);
    const toast = { id, ...t };
    setToasts((s) => [...s, toast]);
    setTimeout(() => {
      setToasts((s) => s.filter((x) => x.id !== id));
    }, 4000);
  }, []);

  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <div className="fixed top-6 right-6 z-50 flex flex-col gap-3 items-end">
        {toasts.map((t) => {
          const bg = t.variant === "success" ? "bg-green-600/90" : t.variant === "error" ? "bg-red-600/90" : "bg-blue-600/90";
          const icon =
            t.variant === "success" ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 00-1.414-1.414L8 11.172 4.707 7.879a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l8-8z" clipRule="evenodd" />
              </svg>
            ) : t.variant === "error" ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.72-1.36 3.485 0l5.454 9.683c.75 1.332-.213 2.985-1.742 2.985H4.545c-1.53 0-2.492-1.653-1.742-2.985L8.257 3.1zM11 13a1 1 0 10-2 0 1 1 0 002 0zm-1-8a1 1 0 00-.993.883L9 6v4a1 1 0 001.993.117L11 10V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2 10a8 8 0 1116 0A8 8 0 012 10zm8-4a1 1 0 100 2 1 1 0 000-2zm1 7a1 1 0 10-2 0v1a1 1 0 102 0v-1z" />
              </svg>
            );

          return (
            <div key={t.id} role="status" aria-live="polite" className={`toast-enter ${bg} text-white p-3 rounded-lg shadow-xl max-w-sm w-full transform backdrop-blur-sm/0`}>
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center text-white/95">{icon}</div>
                <div className="flex-1">
                  {t.title && <div className="font-semibold">{t.title}</div>}
                  {t.description && <div className="text-sm mt-1">{t.description}</div>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
