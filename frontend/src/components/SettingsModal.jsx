import React, { useEffect, useRef } from "react";
import { CalendarDays, Settings, X } from "lucide-react";
import { useTranslation } from "react-i18next";

const weekStartOptions = [
  { id: 1, labelKey: "dic.settingsWeekStartMonday" },
  { id: 0, labelKey: "dic.settingsWeekStartSunday" },
];

export default function SettingsModal({ onClose, onWeekStartChange, weekStartsOn }) {
  const { t } = useTranslation();
  const dialogRef = useRef(null);
  const closeButtonRef = useRef(null);
  const previousFocusRef = useRef(null);

  useEffect(() => {
    previousFocusRef.current = document.activeElement;
    closeButtonRef.current?.focus();

    return () => {
      previousFocusRef.current?.focus?.();
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab" || !dialogRef.current) return;

      const focusable = Array.from(
        dialogRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((element) => !element.disabled && element.offsetParent !== null);

      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
      onMouseDown={onClose}
    >
      <section
        aria-labelledby="settings-title"
        aria-modal="true"
        className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-700 dark:bg-slate-900"
        onMouseDown={(event) => event.stopPropagation()}
        ref={dialogRef}
        role="dialog"
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200">
              <Settings size={21} />
            </div>
            <div>
              <h2
                className="text-xl font-bold text-slate-900 dark:text-white"
                id="settings-title"
              >
                {t("dic.settingsTitle")}
              </h2>
              <p className="mt-1 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                {t("dic.settingsSubtitle")}
              </p>
            </div>
          </div>
          <button
            aria-label={t("dic.settingsClose")}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-900 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white"
            onClick={onClose}
            ref={closeButtonRef}
            title={t("dic.settingsClose")}
            type="button"
          >
            <X size={20} />
          </button>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
          <div className="mb-3 flex items-center gap-2">
            <CalendarDays className="text-emerald-600" size={18} />
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-300">
              {t("dic.settingsCalendar")}
            </h3>
          </div>
          <p className="mb-3 text-sm text-slate-500 dark:text-slate-400">
            {t("dic.settingsWeekStartDescription")}
          </p>
          <div className="grid grid-cols-2 gap-2">
            {weekStartOptions.map((option) => {
              const isActive = weekStartsOn === option.id;

              return (
                <button
                  key={option.id}
                  aria-pressed={isActive}
                  className={`rounded-xl border px-3 py-3 text-sm font-bold transition-colors ${
                    isActive
                      ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-200"
                      : "border-slate-200 bg-white text-slate-500 hover:border-emerald-300 hover:text-emerald-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-emerald-700"
                  }`}
                  onClick={() => onWeekStartChange(option.id)}
                  type="button"
                >
                  {t(option.labelKey)}
                </button>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
