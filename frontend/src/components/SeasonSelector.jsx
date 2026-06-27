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
    <div className="pp-panel pp-season-selector">
      <img
        src={`${BASE_URL}/icons/season-frame.png`}
        alt=""
        aria-hidden="true"
        className="pp-season-frame"
      />
      {seasons.map((s) => {
        const isActive = currentSeason === s.id;
        return (
          <button
            key={s.id}
            type="button"
            onClick={() => onSeasonChange(s.id)}
            aria-label={s.label}
            aria-pressed={isActive}
            className={`pp-season-button ${
              isActive ? "pp-season-button-active" : ""
            }`}
          >
            <img
              src={`${BASE_URL}/icons/${s.icon}`}
              alt=""
              className={`pp-season-icon transition-transform duration-200 ${
                isActive ? "scale-110" : "opacity-85"
              }`}
              aria-hidden="true"
            />
            <span className="text-[10px] uppercase tracking-wider">
              {s.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default SeasonSelector;
