"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Icon } from "./icon";

type ToastOptions = {
  title?: string;
  tone?: "info" | "success";
  /** Lama tampil dalam ms */
  duration?: number;
};

type ToastState = ToastOptions & { message: string; id: number };

type ToastContextValue = {
  showToast: (message: string, options?: ToastOptions) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast harus dipakai di dalam <ToastProvider>");
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<ToastState | null>(null);
  const [visible, setVisible] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const showToast = useCallback((message: string, options: ToastOptions = {}) => {
    clearTimeout(timer.current);
    setToast({ message, id: Date.now(), ...options });
    setVisible(true);
    timer.current = setTimeout(() => setVisible(false), options.duration ?? 2600);
  }, []);

  useEffect(() => () => clearTimeout(timer.current), []);

  const success = toast?.tone === "success";

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        role="status"
        aria-live="polite"
        className={`pointer-events-none fixed top-20 left-1/2 z-[60] w-[90%] max-w-[420px] -translate-x-1/2 transition-all duration-300 ${
          visible ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0"
        }`}
      >
        {toast && (
          <div
            className={`flex items-center gap-3 rounded-2xl px-4 py-3 shadow-xl backdrop-blur-md ${
              success
                ? "bg-primary text-on-primary"
                : "bg-inverse-surface text-inverse-on-surface"
            }`}
          >
            <Icon
              name={success ? "check_circle" : "stars"}
              size={20}
              filled={success}
              className={`shrink-0 ${success ? "text-accent-mint" : "text-accent-sunray"}`}
            />
            <div className="flex-1">
              {toast.title && (
                <p className="t-title-sm">{toast.title}</p>
              )}
              <p
                className={`t-body-sm leading-snug ${
                  success && toast.title ? "text-sage-tint" : ""
                }`}
              >
                {toast.message}
              </p>
            </div>
          </div>
        )}
      </div>
    </ToastContext.Provider>
  );
}
