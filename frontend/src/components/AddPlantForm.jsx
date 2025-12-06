import React, { useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { PLANT_TYPES } from "../constants";
import PlantSelect from "./PlantSelect";

const AddPlantForm = ({ onAdd, onCancel, isSaving }) => {
  const [selectedType, setSelectedType] = useState(PLANT_TYPES[0].id);
  const [days, setDays] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const plantInfo = PLANT_TYPES.find((p) => p.id === selectedType);
    onAdd(
      plantInfo ? plantInfo.label : "Pflanze",
      selectedType,
      days ? parseInt(days) : null
    );
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 animate-in fade-in zoom-in-95">
      <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-4">
        Neue Pflanze
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <PlantSelect selectedId={selectedType} onChange={setSelectedType} />
        <div className="relative">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">
            Gießintervall (Tage)
          </label>
          <input
            type="number"
            min="1"
            placeholder="Automatisch (KI schätzt)"
            className="w-full mt-1 p-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
            value={days}
            onChange={(e) => setDays(e.target.value)}
          />
          {!days && (
            <div className="absolute right-3 top-9 text-slate-400 pointer-events-none flex items-center gap-1 text-xs">
              <Sparkles size={14} /> KI Auto
            </div>
          )}
        </div>
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-3 bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl font-medium border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600"
          >
            Abbrechen
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-medium shadow-lg hover:bg-emerald-700 flex justify-center items-center gap-2"
          >
            {isSaving ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              "Hinzufügen"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddPlantForm;
