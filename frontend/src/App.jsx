import React, { useState, useEffect, useMemo } from "react";
import {
  Plus,
  Droplet,
  Sun,
  Snowflake,
  CloudRain,
  Trash2,
  Sprout,
  Loader2,
  Server,
  Wind,
  AlertTriangle,
} from "lucide-react";

const BACKEND_URL = "http://localhost:3000/api";

const SeasonSelector = ({ currentSeason, onSeasonChange }) => {
  const seasons = [
    { id: "spring", label: "Frühling", icon: Sprout, color: "text-green-500" },
    { id: "summer", label: "Sommer", icon: Sun, color: "text-amber-500" },
    { id: "autumn", label: "Herbst", icon: Wind, color: "text-orange-500" },
    { id: "winter", label: "Winter", icon: Snowflake, color: "text-blue-400" },
  ];

  return (
    <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-100 flex justify-between mb-6">
      {seasons.map((s) => {
        const isActive = currentSeason === s.id;
        const Icon = s.icon;
        return (
          <button
            key={s.id}
            onClick={() => onSeasonChange(s.id)}
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-200 ${
              isActive
                ? "bg-slate-800 text-white shadow-md transform scale-105"
                : "text-slate-400 hover:bg-slate-50"
            }`}
          >
            <Icon size={18} className={isActive ? "text-white" : s.color} />
            <span className="text-[10px] font-medium uppercase tracking-wider">
              {s.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};

// --- KOMPONENTE: PFLANZEN KARTE ---
const PlantCard = ({ plant, season, onWater, onDelete }) => {
  // Logik für Gieß-Berechnung
  const status = useMemo(() => {
    const multipliers = { spring: 1.0, summer: 0.7, autumn: 1.2, winter: 2.0 };
    const multiplier = multipliers[season] || 1;
    const interval = Math.round(plant.baseInterval * multiplier);

    const last = new Date(plant.lastWatered);
    const next = new Date(last);
    next.setDate(last.getDate() + interval);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const nextMidnight = new Date(next);
    nextMidnight.setHours(0, 0, 0, 0);

    const diff = Math.ceil((nextMidnight - today) / (1000 * 60 * 60 * 24));
    return { days: diff, overdue: diff < 0, today: diff === 0 };
  }, [plant, season]);

  // Icons je nach Typ
  const getIcon = (type) => {
    if (type === "cactus") return { emoji: "🌵", bg: "bg-emerald-100" };
    if (type === "flower") return { emoji: "🌸", bg: "bg-pink-100" };
    if (type === "palm") return { emoji: "🌴", bg: "bg-yellow-100" };
    return { emoji: "🌿", bg: "bg-green-100" };
  };
  const visual = getIcon(plant.type);

  // Status Farben
  let badgeStyle = "bg-green-50 text-green-700 border-green-200";
  let badgeText = `In ${status.days} Tagen`;
  if (status.overdue) {
    badgeStyle = "bg-red-50 text-red-600 border-red-200 animate-pulse";
    badgeText = `Überfällig (${Math.abs(status.days)} Tage)`;
  } else if (status.today) {
    badgeStyle = "bg-amber-50 text-amber-600 border-amber-200";
    badgeText = "Heute gießen!";
  }

  return (
    <div className="group bg-white rounded-3xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-all">
      <div className="flex justify-between items-start">
        <div className="flex gap-4">
          <div
            className={`w-14 h-14 ${visual.bg} rounded-2xl flex items-center justify-center text-3xl`}
          >
            {visual.emoji}
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-lg">{plant.name}</h3>
            <div
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border mt-1 ${badgeStyle}`}
            >
              {status.overdue ? (
                <AlertTriangle size={12} />
              ) : (
                <Droplet size={12} />
              )}
              {badgeText}
            </div>
          </div>
        </div>
        <button
          onClick={() => onDelete(plant.id)}
          className="text-slate-300 hover:text-red-400 p-2 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Trash2 size={18} />
        </button>
      </div>

      <div className="mt-4 flex justify-between items-center pl-1">
        <span className="text-xs text-slate-400 font-medium">
          Intervall: {plant.baseInterval} Tage
        </span>
        <button
          onClick={() => onWater(plant.id)}
          className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-xl hover:bg-emerald-700 active:scale-95 transition-all shadow-lg shadow-emerald-200"
        >
          <Droplet size={16} className="fill-current" />
          Gießen
        </button>
      </div>
    </div>
  );
};

// --- KOMPONENTE: PFLANZE HINZUFÜGEN ---
const AddPlantForm = ({ onAdd, onCancel }) => {
  const [name, setName] = useState("");
  const [type, setType] = useState("leaf");
  const [days, setDays] = useState(7);

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd(name, type, days);
  };

  return (
    <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 animate-in fade-in zoom-in-95">
      <h3 className="font-bold text-slate-800 mb-4">Neue Pflanze</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          autoFocus
          type="text"
          placeholder="Name (z.B. Ficus)"
          className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <div className="grid grid-cols-2 gap-4">
          <select
            className="w-full p-3 rounded-xl border border-slate-200 bg-white"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="leaf">Grünpflanze</option>
            <option value="cactus">Kaktus</option>
            <option value="palm">Palme</option>
            <option value="flower">Blume</option>
          </select>
          <input
            type="number"
            min="1"
            placeholder="Tage"
            className="w-full p-3 rounded-xl border border-slate-200"
            value={days}
            onChange={(e) => setDays(e.target.value)}
            required
          />
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-3 bg-white text-slate-600 rounded-xl font-medium border border-slate-200"
          >
            Abbrechen
          </button>
          <button
            type="submit"
            className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-medium shadow-lg hover:bg-emerald-700"
          >
            Speichern
          </button>
        </div>
      </form>
    </div>
  );
};

// --- HAUPT APP ---
const App = () => {
  const [season, setSeason] = useState("summer");
  const [plants, setPlants] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 1. Laden
  const fetchPlants = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/plants`);
      const data = await res.json();
      setPlants(data.plants);
      setError(null);
    } catch (e) {
      setError("Backend nicht erreichbar");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlants();
  }, []);

  // 2. Aktionen (API Calls)
  const addPlant = async (name, type, interval) => {
    const res = await fetch(`${BACKEND_URL}/plants`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, type, baseInterval: interval }),
    });
    if (res.ok) {
      setIsAdding(false);
      fetchPlants(); // Liste neu laden
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
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans pb-32">
      {/* Navbar */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-emerald-600 text-white p-2 rounded-lg">
              <Sprout size={20} />
            </div>
            <h1 className="text-xl font-bold text-slate-800">Botanico</h1>
          </div>
          <div
            className={`text-xs px-3 py-1 rounded-full border flex items-center gap-2 ${
              error ? "bg-red-50 text-red-600" : "bg-green-50 text-green-700"
            }`}
          >
            <Server size={12} /> {error ? "Offline" : "Online"}
          </div>
        </div>
      </nav>

      <main className="max-w-xl mx-auto px-6 py-8">
        {/* Error / Loading */}
        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-xl mb-4">
            Fehler: Node.js Backend läuft nicht! (Port 3000)
          </div>
        )}
        {loading && (
          <div className="text-center p-10 text-slate-400">
            <Loader2 className="animate-spin inline" /> Lade...
          </div>
        )}

        {/* Content */}
        {!loading && !error && (
          <>
            <SeasonSelector currentSeason={season} onSeasonChange={setSeason} />

            {!isAdding ? (
              <button
                onClick={() => setIsAdding(true)}
                className="w-full bg-white border-2 border-dashed border-slate-200 rounded-3xl p-6 flex flex-col items-center justify-center gap-2 text-slate-400 hover:border-emerald-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all group mb-8"
              >
                <div className="bg-slate-100 p-3 rounded-full group-hover:bg-emerald-200 transition-colors">
                  <Plus size={24} />
                </div>
                <span className="font-medium">Neue Pflanze hinzufügen</span>
              </button>
            ) : (
              <div className="mb-8">
                <AddPlantForm
                  onAdd={addPlant}
                  onCancel={() => setIsAdding(false)}
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
              {plants.length === 0 && !isAdding && (
                <p className="text-center text-slate-400">Keine Pflanzen da.</p>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default App;
