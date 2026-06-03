import React, { useEffect, useState, useRef } from "react";
import { ChevronDown, Check } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useClickOutside } from "../hooks/useClickOutside";

const PlantSelectView = ({
  plants,
  selectedPlant,
  selectedId,
  baseUrl,
  onChange,
}) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const listboxId = "plant-select-listbox";

  useClickOutside(dropdownRef, () => setIsOpen(false));

  useEffect(() => {
    if (!isOpen) return undefined;

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        event.preventDefault();
        setIsOpen(false);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1 mb-1 block">
        {t("dic.plantSpecies")}
      </label>

      <button
        aria-controls={listboxId}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-between hover:border-emerald-400 transition-colors focus:ring-2 focus:ring-emerald-500 outline-none"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-50 dark:bg-slate-700 rounded-lg border border-slate-100 dark:border-slate-600 overflow-hidden flex items-center justify-center">
            <img
              src={`${baseUrl}/images/${selectedPlant.id}.png`}
              alt=""
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          </div>

          <span className="font-medium text-slate-700 dark:text-slate-200">
            {selectedPlant.label}
          </span>
        </div>

        <ChevronDown
          aria-hidden="true"
          size={20}
          className={`text-slate-400 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div
          className="absolute z-50 w-full mt-2 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl shadow-xl max-h-60 overflow-y-auto"
          id={listboxId}
          role="listbox"
        >
          {plants.map((plant) => (
            <button
              key={plant.id}
              aria-selected={selectedId === plant.id}
              type="button"
              onClick={() => {
                onChange(plant.id);
                setIsOpen(false);
              }}
              className="w-full p-2 flex items-center gap-3 hover:bg-emerald-50 dark:hover:bg-slate-700 transition-colors"
              role="option"
            >
              <div className="w-10 h-10 bg-slate-50 dark:bg-slate-700 rounded-lg border border-slate-100 dark:border-slate-600 overflow-hidden flex items-center justify-center">
                <img
                  src={`${baseUrl}/images/${plant.id}.png`}
                  alt=""
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              </div>

              <span
                className={`font-medium ${
                  selectedId === plant.id
                    ? "text-emerald-700 dark:text-emerald-400"
                    : "text-slate-600 dark:text-slate-300"
                }`}
              >
                {plant.label}
              </span>

              {selectedId === plant.id && (
                <Check
                  aria-hidden="true"
                  size={16}
                  className="ml-auto text-emerald-600 dark:text-emerald-400"
                />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default PlantSelectView;
