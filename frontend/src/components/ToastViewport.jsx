import React from "react";
import {
  AlertCircle,
  CheckCircle2,
  Info,
  RotateCcw,
  X,
} from "lucide-react";
import { useTranslation } from "react-i18next";

const toneClasses = {
  error:
    "border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-100",
  info:
    "border-sky-200 bg-sky-50 text-sky-800 dark:border-sky-900 dark:bg-sky-950 dark:text-sky-100",
  success:
    "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-100",
};

const icons = {
  error: AlertCircle,
  info: Info,
  success: CheckCircle2,
};

export default function ToastViewport({ onDismiss, toasts }) {
  const { t } = useTranslation();

  if (toasts.length === 0) return null;

  return (
    <div
      aria-label={t("dic.toastRegion")}
      aria-live="polite"
      className="fixed right-4 top-24 z-[80] flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-3"
      role="status"
    >
      {toasts.map((toast) => {
        const Icon = icons[toast.type] || Info;

        return (
          <div
            className={`rounded-xl border-2 p-3 shadow-[0_4px_0_rgba(111,85,44,0.18),0_14px_32px_rgba(24,39,16,0.16)] ${toneClasses[toast.type] || toneClasses.info}`}
            key={toast.id}
          >
            <div className="flex items-start gap-3">
              <Icon className="mt-0.5 shrink-0" size={18} />
              <p className="min-w-0 flex-1 text-sm font-semibold leading-relaxed">
                {toast.message}
              </p>
              <button
                aria-label={t("dic.toastDismiss")}
                className="shrink-0 rounded-lg p-1 opacity-70 transition hover:bg-black/5 hover:opacity-100 dark:hover:bg-white/10"
                onClick={() => onDismiss(toast.id)}
                type="button"
              >
                <X size={16} />
              </button>
            </div>
            {toast.action && (
              <button
                className="mt-3 inline-flex items-center gap-2 rounded-lg border border-current/20 px-3 py-1.5 text-xs font-bold transition hover:bg-black/5 dark:hover:bg-white/10"
                onClick={() => {
                  toast.action.onClick();
                  onDismiss(toast.id);
                }}
                type="button"
              >
                <RotateCcw size={14} />
                {toast.action.label}
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
