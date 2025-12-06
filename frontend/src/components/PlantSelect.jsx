import React, { useState, useEffect, useRef } from "react";
import { ChevronDown, Check } from "lucide-react";
import { PLANT_TYPES, BASE_URL } from "../constants";

const PlantSelect = ({ selectedId, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target))
        setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedPlant =
    PLANT_TYPES.find((p) => p.id === selectedId) || PLANT_TYPES[0];

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1 mb-1 block">
        Pflanzenart
      </label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-between hover:border-emerald-400 transition-colors focus:ring-2 focus:ring-emerald-500 outline-none"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-50 dark:bg-slate-700 rounded-lg border border-slate-100 dark:border-slate-600 overflow-hidden flex items-center justify-center">
            <img
              src={`${BASE_URL}/images/${selectedPlant.id}.png`}
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
          size={20}
          className={`text-slate-400 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl shadow-xl max-h-60 overflow-y-auto animate-in fade-in zoom-in-95">
          {PLANT_TYPES.map((plant) => (
            <button
              key={plant.id}
              type="button"
              onClick={() => {
                onChange(plant.id);
                setIsOpen(false);
              }}
              className="w-full p-2 flex items-center gap-3 hover:bg-emerald-50 dark:hover:bg-slate-700 transition-colors first:rounded-t-xl last:rounded-b-xl"
            >
              <div className="w-10 h-10 bg-slate-50 dark:bg-slate-700 rounded-lg border border-slate-100 dark:border-slate-600 overflow-hidden flex items-center justify-center">
                <img
                  src={`${BASE_URL}/images/${plant.id}.png`}
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

export default PlantSelect;
