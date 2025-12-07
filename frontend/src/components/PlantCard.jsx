import React, { useState, useMemo } from "react";
import {
  Droplet,
  Trash2,
  Loader2,
  AlertTriangle,
  Zap,
  Sparkles,
} from "lucide-react";
import { PixelBot } from "./PixelBot";
import { BACKEND_URL, BASE_URL } from "../constants";

const PlantCard = ({ plant, season, onWater, onDelete }) => {
  const [tips, setTips] = useState(null);
  const [loadingTips, setLoadingTips] = useState(false);
  const [isWatering, setIsWatering] = useState(false);

  const status = useMemo(() => {
    const multipliers = { spring: 1.0, summer: 0.8, autumn: 1.2, winter: 2.0 };
    const multiplier = multipliers[season] || 1;
    const interval = Math.round(plant.baseInterval * multiplier);

    const last = new Date(plant.lastWatered);
    const next = new Date(last);
    next.setDate(last.getDate() + interval);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diff = Math.ceil(
      (new Date(next).setHours(0, 0, 0, 0) - today) / (1000 * 60 * 60 * 24)
    );
    return {
      days: diff,
      overdue: diff < 0,
      today: diff === 0,
      interval,
      isThirsty: diff <= 0,
    };
  }, [plant, season]);

  const fetchTips = async () => {
    if (tips) {
      setTips(null);
      return;
    }
    setLoadingTips(true);
    try {
      const res = await fetch(
        `${BACKEND_URL}/tips?name=${plant.name}&season=${season}`
      );
      const data = await res.json();
      setTips(data.tips);
    } catch (e) {
      setTips("Konnte keine Tipps laden.");
    } finally {
      setLoadingTips(false);
    }
  };

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
    <div className="group bg-white dark:bg-slate-800 rounded-3xl p-5 shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition-all duration-300">
      <div className="flex justify-between items-start">
        <div className="flex gap-4">
          <div
            className={`w-16 h-16 rounded-2xl flex items-center justify-center overflow-hidden border border-slate-100 dark:border-slate-700 relative transition-colors duration-500 ${
              status.isThirsty
                ? "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800"
                : "bg-slate-50 dark:bg-slate-700"
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
                    e.target.parentNode.classList.add("bg-emerald-100");
                  }
                }}
              />
            ) : (
              <span className="text-2xl font-bold text-slate-400">
                {(plant.name || "?").charAt(0)}
              </span>
            )}
          </div>

          <div>
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
                ? `Überfällig (${Math.abs(status.days)} T.)`
                : status.today
                ? "Heute!"
                : `In ${status.days} Tagen`}
            </div>
          </div>
        </div>
        <button
          onClick={() => onDelete(plant.id)}
          className="text-slate-300 hover:text-red-400 dark:hover:text-red-400 p-2 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Trash2 size={18} />
        </button>
      </div>

      <div className="mt-4 flex justify-between items-center pl-1 gap-2">
        <div className="flex flex-col text-xs text-slate-400 dark:text-slate-500 font-medium">
          <span>
            Intervall: {status.interval} Tage ({season})
          </span>
          <button
            onClick={fetchTips}
            className="mt-1 flex items-center gap-1 text-amber-500 hover:text-amber-400 transition-colors"
          >
            {loadingTips ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <Zap size={12} />
            )}
            {loadingTips ? "Suche..." : tips ? "Tipps verbergen" : "KI-Tipps"}
          </button>
        </div>

        {/* GROSSER GIESS-BUTTON */}
        <button
          onClick={() => onWater(plant.id)}
          onMouseDown={() => setIsWatering(true)}
          onMouseUp={() => setIsWatering(false)}
          onMouseLeave={() => setIsWatering(false)}
          className="relative group/btn flex items-center justify-center p-0 rounded-full transition-all active:scale-95 w-24 h-23 hover:opacity-80"
          title="Gießen"
        >
          <img
            src={`${BASE_URL}/icons/${
              isWatering ? "wateringon.png" : "watering.png"
            }`}
            alt="Watering can icon"
            style={{ mixBlendMode: "multiply" }}
            className="w-full h-full object-contain drop-shadow-sm group-hover/btn:-rotate-12 transition-transform duration-300"
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
        </button>
      </div>

      {loadingTips && (
        <div className="flex flex-col items-center justify-center pt-4">
          <PixelBot />
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Frage den Pflanzen-Bot...
          </p>
        </div>
      )}

      {tips && (
        <div className="mt-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900 p-3 rounded-xl text-sm text-slate-700 dark:text-slate-300 animate-in slide-in-from-top-2 whitespace-pre-line">
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
  );
};

export default PlantCard;
