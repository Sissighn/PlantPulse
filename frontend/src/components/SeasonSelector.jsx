import React from "react";
import { useTranslation } from "react-i18next";
import { BASE_URL } from "../constants";

const SeasonSelector = ({ currentSeason, onSeasonChange }) => {
  const { t } = useTranslation();

  const seasons = [
    {
      id: "spring",
      label: t("dic.season.spring"),
      icon: "season-spring.png",
    },
    {
      id: "summer",
      label: t("dic.season.summer"),
      icon: "season-summer.png",
    },
    {
      id: "autumn",
      label: t("dic.season.autumn"),
      icon: "season-autumn.png",
    },
    {
      id: "winter",
      label: t("dic.season.winter"),
      icon: "season-winter.png",
    },
  ];

  return (
    <div className="bg-white dark:bg-slate-800 p-2 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex justify-between mb-6 transition-colors duration-300">
      {seasons.map((s) => {
        const isActive = currentSeason === s.id;
        return (
          <button
            key={s.id}
            type="button"
            onClick={() => onSeasonChange(s.id)}
            aria-label={s.label}
            aria-pressed={isActive}
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-200 ${
              isActive
                ? "bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 shadow-md transform scale-105"
                : "text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700"
            }`}
          >
            <img
              src={`${BASE_URL}/icons/${s.icon}`}
              alt=""
              className={`h-8 w-8 object-contain drop-shadow-sm transition-transform duration-200 ${
                isActive ? "scale-110" : "opacity-85"
              }`}
              aria-hidden="true"
            />
            <span className="text-[10px] font-medium uppercase tracking-wider">
              {s.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default SeasonSelector;
