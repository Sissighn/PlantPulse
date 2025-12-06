import React from "react";
import { Sprout, Sun, Wind, Snowflake } from "lucide-react";

const SeasonSelector = ({ currentSeason, onSeasonChange }) => {
  const seasons = [
    { id: "spring", label: "Frühling", icon: Sprout, color: "text-green-500" },
    { id: "summer", label: "Sommer", icon: Sun, color: "text-amber-500" },
    { id: "autumn", label: "Herbst", icon: Wind, color: "text-orange-500" },
    { id: "winter", label: "Winter", icon: Snowflake, color: "text-blue-400" },
  ];

  return (
    <div className="bg-white dark:bg-slate-800 p-2 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex justify-between mb-6 transition-colors duration-300">
      {seasons.map((s) => {
        const isActive = currentSeason === s.id;
        const Icon = s.icon;
        return (
          <button
            key={s.id}
            onClick={() => onSeasonChange(s.id)}
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-200 ${
              isActive
                ? "bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 shadow-md transform scale-105"
                : "text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700"
            }`}
          >
            <Icon size={18} className={isActive ? "text-current" : s.color} />
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
