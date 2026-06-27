import React, { useState, useEffect, useRef } from "react";
import {
  Droplet,
  Trash2,
  Loader2,
  AlertTriangle,
  Zap,
  Sparkles,
  CalendarDays,
} from "lucide-react";
import { PixelBot } from "../features/pixelBot/PixelBot";
import { BASE_URL } from "../constants";

const PlantCardView = ({
  plant,
  status,
  tips,
  loadingTips,
  fetchTips,
  onWater,
  onDelete,
  t,
}) => {
  const [isWatering, setIsWatering] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const deleteButtonRef = useRef(null);
  const deleteDialogRef = useRef(null);
  const cancelDeleteRef = useRef(null);

  useEffect(() => {
    if (!showDeleteModal) return;

    const triggerButton = deleteButtonRef.current;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setShowDeleteModal(false);
        return;
      }

      if (e.key !== "Tab" || !deleteDialogRef.current) return;

      const focusable = Array.from(
        deleteDialogRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((element) => !element.disabled && element.offsetParent !== null);

      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    cancelDeleteRef.current?.focus();
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      triggerButton?.focus();
    };
  }, [showDeleteModal]);

  const getImageUrl = () => {
    if (!plant.imageUrl) return null;

    let url = plant.imageUrl.startsWith("http")
      ? plant.imageUrl
      : `${BASE_URL}${plant.imageUrl}`;

    if (status.isThirsty) {
      return url.replace("/images/", "/images/thirsty/");
    }

    return url;
  };

  const imageUrl = getImageUrl();

  return (
    <>
      <div className="pp-panel pp-plant-card group">
          <button
            aria-label={t("dic.deleteTitle")}
            onClick={() => setShowDeleteModal(true)}
            ref={deleteButtonRef}
            type="button"
            className="pp-delete-button"
            title={t("dic.deleteTitle")}
          >
            <Trash2 aria-hidden="true" size={18} />
          </button>

        <div className="pp-plant-layout">
          <div className="pp-plant-thumb">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={plant.name}
                className={`h-full w-full object-cover transition-all duration-500 ${
                  status.isThirsty ? "grayscale-[0.1]" : ""
                }`}
                onError={(e) => {
                  if (e.target.src.includes("/thirsty/")) {
                    e.target.src = e.target.src.replace("/thirsty/", "/");
                  } else {
                    e.target.onerror = null;
                    e.target.style.display = "none";
                  }
                }}
              />
            ) : (
              <span className="text-2xl font-bold text-slate-400">
                {(plant.name || "?").charAt(0)}
              </span>
            )}
          </div>

          <div className="min-w-0">
            <h3 className="pp-plant-title truncate">{plant.name}</h3>

            <div
              className={`pp-status ${
                status.overdue ? "pp-status-danger" : ""
              }`}
            >
              {status.overdue ? (
                <AlertTriangle size={13} />
              ) : (
                <Droplet size={13} />
              )}

              {status.overdue
                ? t("dic.overdue", { count: Math.abs(status.days) })
                : status.today
                  ? t("dic.today")
                  : t("dic.inDays", { count: status.days })}
            </div>

            <div className="pp-detail-list">
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays size={14} />
                {t("dic.interval")}: {status.interval} {t("dic.days")}
              </span>

              <button
                aria-expanded={Boolean(tips)}
                onClick={fetchTips}
                type="button"
                className="pp-ai-button"
              >
                {loadingTips ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Zap size={14} />
                )}

                {loadingTips
                  ? t("dic.searching")
                  : tips
                    ? t("dic.hideTips")
                    : t("dic.aiTips")}
              </button>
            </div>
          </div>

          <button
            aria-label={t("dic.waterTitle")}
            onClick={() => onWater(plant.id)}
            onMouseDown={() => setIsWatering(true)}
            onMouseUp={() => setIsWatering(false)}
            onMouseLeave={() => setIsWatering(false)}
            type="button"
            className="pp-water-button"
            title={t("dic.waterTitle")}
          >
            <img
              src={`${BASE_URL}/icons/${
                isWatering ? "wateringon.png" : "watering.png"
              }`}
              alt=""
              aria-hidden="true"
              className="h-full w-full object-contain transition-transform duration-300"
            />
          </button>
        </div>

        {loadingTips && (
          <div className="flex flex-col items-center justify-center pt-4">
            <PixelBot />
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              {t("dic.askBot")}
            </p>
          </div>
        )}

        {tips && (
          <div className="pp-tips-panel">
            <div className="flex gap-2">
              <Sparkles
                size={16}
                className="shrink-0 text-amber-600 dark:text-amber-500 mt-0.5"
              />
              <span>{tips}</span>
            </div>
          </div>
        )}
      </div>

      {showDeleteModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
          onClick={() => setShowDeleteModal(false)}
        >
          <div
            aria-describedby={`delete-plant-description-${plant.id}`}
            aria-labelledby={`delete-plant-title-${plant.id}`}
            aria-modal="true"
            className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl border border-slate-100 dark:border-slate-700"
            onClick={(e) => e.stopPropagation()}
            ref={deleteDialogRef}
            role="dialog"
          >
            <div className="flex flex-col items-center text-center mb-6">
              <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-500 rounded-full mb-4">
                <Trash2 size={28} />
              </div>

              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                <span id={`delete-plant-title-${plant.id}`}>
                  {t("dic.deleteQuestion")}
                </span>
              </h3>

              <p
                className="text-slate-500 dark:text-slate-400 text-sm"
                id={`delete-plant-description-${plant.id}`}
              >
                {t("dic.deleteConfirmStart")} <strong>{plant.name}</strong>{" "}
                {t("dic.deleteConfirmEnd")}
              </p>
              <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">
                {t("dic.deleteWarning")}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                ref={cancelDeleteRef}
                type="button"
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold bg-slate-100 dark:bg-slate-700"
              >
                {t("dic.cancel")}
              </button>

              <button
                onClick={() => {
                  onDelete(plant.id);
                  setShowDeleteModal(false);
                }}
                type="button"
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-red-500 hover:bg-red-600"
              >
                {t("dic.deleteBtn")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PlantCardView;
