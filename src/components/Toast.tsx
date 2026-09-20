"use client";

import { useEffect, useRef, useState } from "react";

export function Toast({
  message,
  onClose,
  duration = 3000,
}: {
  message: string;
  onClose: () => void;
  duration?: number;
}) {
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const id = window.setTimeout(() => onCloseRef.current(), duration);
    return () => window.clearTimeout(id);
  }, [duration]);

  return (
    <div
      role="status"
      className="pointer-events-auto fixed bottom-4 right-4 z-50 animate-slide-up rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 shadow-lg dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
    >
      {message}
    </div>
  );
}

export function useToast() {
  const [message, setMessage] = useState<string | null>(null);
  return {
    toast: message,
    showToast: (msg: string) => setMessage(msg),
    closeToast: () => setMessage(null),
  };
}