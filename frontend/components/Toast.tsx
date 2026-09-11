"use client";

import {
  AlertCircle,
  CheckCircle2,
  Info,
  TriangleAlert,
  X,
} from "lucide-react";
import { useEffect } from "react";

export type ToastType =
  | "success"
  | "error"
  | "warning"
  | "info";

type ToastProps = {
  message: string;
  type?: ToastType;
  onClose: () => void;
  duration?: number;
};

export default function Toast({
  message,
  type = "success",
  onClose,
  duration = 2500,
}: ToastProps) {
  useEffect(() => {
    if (!message) return;

    const timer = window.setTimeout(() => {
      onClose();
    }, duration);

    return () => {
      window.clearTimeout(timer);
    };
  }, [message, duration, onClose]);

  if (!message) {
    return null;
  }

  const Icon =
    type === "success"
      ? CheckCircle2
      : type === "error"
      ? AlertCircle
      : type === "warning"
      ? TriangleAlert
      : Info;

  return (
    <div
      className="gb-toast-wrap"
      role="status"
      aria-live="polite"
    >
      <div
        className={`gb-toast gb-toast-${type}`}
      >
        <div className="gb-toast-content">
          <span className="gb-toast-icon">
            <Icon
              size={19}
              strokeWidth={2}
            />
          </span>

          <span className="gb-toast-message">
            {message}
          </span>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close notification"
        >
          <X size={15} />
        </button>
      </div>
    </div>
  );
}
