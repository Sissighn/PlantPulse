import React, { useState, useEffect, useRef } from "react";
import {
  Droplet,
  Trash2,
  Loader2,
  AlertTriangle,
  Zap,
  Sparkles,
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
      <div className="group bg-white dark:bg-slate-800 rounded-3xl p-5 shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition-all duration-300">
        <div className="flex justify-between items-start">
          <div className="flex gap-4">
            <div
              className={`w-20 h-20 shrink-0 rounded-2xl flex items-center justify-center overflow-hidden border relative transition-colors duration-500 ${
                status.isThirsty
                  ? "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800"
                  : "bg-slate-50 dark:bg-slate-700 border-slate-100 dark:border-slate-700"
              }`}
            >
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={plant.name}
                  className={`w-full h-full object-cover transition-all duration-500 ${
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

            <div className="pt-1">
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg">
                {plant.name}
              </h3>

              <div
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border mt-1 ${
                  status.overdue
                    ? "bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800"
                    : "bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800"
                }`}
              >
                {status.overdue ? (
                  <AlertTriangle size={12} />
                ) : (
                  <Droplet size={12} />
                )}

                {status.overdue
                  ? t("dic.overdue", { count: Math.abs(status.days) })
                  : status.today
                    ? t("dic.today")
                    : t("dic.inDays", { count: status.days })}
              </div>
            </div>
          </div>

          <button
            aria-label={t("dic.deleteTitle")}
            onClick={() => setShowDeleteModal(true)}
            ref={deleteButtonRef}
            type="button"
            className="text-slate-300 hover:text-red-400 p-2 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
            title={t("dic.deleteTitle")}
          >
            <Trash2 aria-hidden="true" size={18} />
          </button>
        </div>

        <div className="mt-4 flex justify-between items-center pl-1 gap-2">
          <div className="flex flex-col text-xs text-slate-400 dark:text-slate-500 font-medium">
            <span>
              {t("dic.interval")}: {status.interval} {t("dic.days")}
            </span>

            <button
              aria-expanded={Boolean(tips)}
              onClick={fetchTips}
              type="button"
              className="mt-1 flex items-center gap-1 text-amber-500 hover:text-amber-400 transition-colors"
            >
              {loadingTips ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <Zap size={12} />
              )}

              {loadingTips
                ? t("dic.searching")
                : tips
                  ? t("dic.hideTips")
                  : t("dic.aiTips")}
            </button>
          </div>

          <button
            aria-label={t("dic.waterTitle")}
            onClick={() => onWater(plant.id)}
            onMouseDown={() => setIsWatering(true)}
            onMouseUp={() => setIsWatering(false)}
            onMouseLeave={() => setIsWatering(false)}
            type="button"
            className="relative flex items-center justify-center rounded-full active:scale-95 w-24 h-23 transition-all"
            title={t("dic.waterTitle")}
          >
            <img
              src={`${BASE_URL}/icons/${
                isWatering ? "wateringon.png" : "watering.png"
              }`}
              alt=""
              aria-hidden="true"
              className="w-full h-full object-contain transition-transform duration-300"
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
          <div className="mt-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900 p-3 rounded-xl text-sm text-slate-700 dark:text-slate-300 whitespace-pre-line">
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
