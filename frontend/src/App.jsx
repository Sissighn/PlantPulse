import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Plus,
  Droplet,
  Sun,
  Snowflake,
  Trash2,
  Sprout,
  Loader2,
  Server,
  Wind,
  AlertTriangle,
  Zap,
  Sparkles,
  ChevronDown,
  Check,
  Moon, // Wichtig für den Dark Mode Button
} from "lucide-react";

const BACKEND_URL = "http://localhost:3000/api";

const PLANT_TYPES = [
  { id: "monstra", label: "Monstera" },
  { id: "anthurium", label: "Anthurium" },
  { id: "orchid", label: "Orchidee" },
  { id: "philodendronmccolleysfinale", label: "Philodendron" },
  { id: "usambaraveilchen", label: "Usambara-Veilchen" },
  { id: "yucca", label: "Yucca" },
  { id: "kalanchoe", label: "Kalanchoe" },
  { id: "peperomiaobtusifolia", label: "Peperomia Obtusifolia" },
  { id: "peperomiarotundifolia", label: "Peperomia Rotundifolia" },
  { id: "iddleleaffig", label: "Fiddle Leaf Fig" },
  { id: "dieffenbachia", label: "Dieffenbachia" },
  { id: "schlumbergera", label: "Schlumbergera" },
  { id: "aloevera", label: "Aloe Vera" },
  { id: "Chlorophytum", label: "Chlorophytum" },
  { id: "calatheaorbifolia", label: "Calathea Orbifolia" },
  { id: "ficuselastica", label: "Ficus elastica" },
  { id: "epipremnumaureum", label: "Epipremnum Aureum" },
  { id: "zamioculcas", label: "Zamioculcas" },
  { id: "sansevieria", label: "Sansevieria" },
  { id: "echinopsissubdenudata", label: "Echinopsis Subdenudata" },
  { id: "mammillariaelongata", label: "Mammillaria Elongata" },
  { id: "opuntiamicrodasys", label: "Opuntia Microdasys" },
  { id: "rebutiaheliosa", label: "Rebutia Heliosa" },
  { id: "sedummorganianum", label: "Sedum Morganianum" },
  { id: "spathiphyllum", label: "Spathiphyllum / Peace Lily" },
  { id: "hibiscusrosasinensis", label: "Hibiscus Rosa-Sinensis" },
  { id: "bromeliaguzmania", label: "Bromelia Guzmania" },
  { id: "cliviaminiata", label: "Clivia Miniata" },
  { id: "gardeniajasminoides", label: "Gardenia Jasminoides " },
];

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

const PlantCard = ({ plant, season, onWater, onDelete }) => {
  const [tips, setTips] = useState(null);
  const [loadingTips, setLoadingTips] = useState(false);

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
      : `http://localhost:3000${plant.imageUrl}`;
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
            {tips ? "Tipps verbergen" : "KI-Tipps"}
          </button>
        </div>

        {/* GROSSER GIESS-BUTTON */}
        <button
          onClick={() => onWater(plant.id)}
          className="relative group/btn flex items-center justify-center p-0 rounded-full transition-all active:scale-95 w-20 h-20 hover:opacity-80"
          title="Gießen"
        >
          <img
            src="http://localhost:3000/icons/watering.png"
            alt="Gießen"
            style={{ mixBlendMode: "multiply" }}
            className="w-full h-full object-contain drop-shadow-sm group-hover/btn:-rotate-12 transition-transform duration-300"
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
        </button>
      </div>

      {tips && (
        <div className="mt-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900 p-3 rounded-xl text-sm text-slate-700 dark:text-slate-300 animate-in slide-in-from-top-2">
          <Sparkles
            size={14}
            className="inline mr-1 text-amber-600 dark:text-amber-500"
          />
          {tips}
        </div>
      )}
    </div>
  );
};

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
              src={`http://localhost:3000/images/${selectedPlant.id}.png`}
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
                  src={`http://localhost:3000/images/${plant.id}.png`}
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

const App = () => {
  const [season, setSeason] = useState("summer");
  const [plants, setPlants] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- DARK MODE LOGIC ---
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem("theme") === "dark"
  );

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);
  // ---------------------

  const fetchPlants = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/plants`);
      const data = await res.json();
      setPlants(data.plants);
      setError(null);
    } catch (e) {
      setError("Backend Offline");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlants();
  }, []);

  const addPlant = async (name, type, interval) => {
    setIsSaving(true);
    try {
      const res = await fetch(`${BACKEND_URL}/plants`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, type, baseInterval: interval }),
      });
      if (res.ok) {
        setIsAdding(false);
        fetchPlants();
      }
    } catch (e) {
      alert("Fehler beim Speichern");
    } finally {
      setIsSaving(false);
    }
  };

  const deletePlant = async (id) => {
    await fetch(`${BACKEND_URL}/plants/${id}`, { method: "DELETE" });
    fetchPlants();
  };
  const waterPlant = async (id) => {
    await fetch(`${BACKEND_URL}/water/${id}`, { method: "POST" });
    fetchPlants();
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-plant-body pb-32 transition-colors duration-300">
      <nav className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-20 transition-colors duration-300">
        <div className="max-w-xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-3">
              <img
                src="http://localhost:3000/icons/logo.png"
                alt="PlantPulse Logo"
                className="h-10 w-auto object-contain"
                style={{ mixBlendMode: "multiply" }}
              />
            </div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white font-plant-title tracking-wide">
              PlantPulse
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* DARK MODE BUTTON */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </div>
      </nav>
      <main className="max-w-xl mx-auto px-6 py-8">
        {loading && (
          <div className="text-center p-10 text-slate-400">
            <Loader2 className="animate-spin inline" /> Lade...
          </div>
        )}

        {!loading && !error && (
          <>
            <SeasonSelector currentSeason={season} onSeasonChange={setSeason} />
            {!isAdding ? (
              <button
                onClick={() => setIsAdding(true)}
                className="w-full bg-white dark:bg-slate-800 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-3xl p-6 flex flex-col items-center justify-center gap-2 text-slate-400 hover:border-emerald-400 dark:hover:border-emerald-600 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-all group mb-8"
              >
                <div className="bg-slate-100 dark:bg-slate-700 p-3 rounded-full group-hover:bg-emerald-200 dark:group-hover:bg-emerald-800 transition-colors">
                  <Plus size={24} />
                </div>
                <span className="font-medium">Neue Pflanze hinzufügen</span>
              </button>
            ) : (
              <div className="mb-8">
                <AddPlantForm
                  onAdd={addPlant}
                  onCancel={() => setIsAdding(false)}
                  isSaving={isSaving}
                />
              </div>
            )}
            <div className="space-y-4">
              {plants.map((p) => (
                <PlantCard
                  key={p.id}
                  plant={p}
                  season={season}
                  onWater={waterPlant}
                  onDelete={deletePlant}
                />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default App;
