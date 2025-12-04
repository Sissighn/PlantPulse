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
  Zap,
  Sparkles,
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

// --- PFLANZEN KARTE (MIT KI TIPPS) ---
const PlantCard = ({ plant, season, onWater, onDelete }) => {
  const [tips, setTips] = useState(null);
  const [loadingTips, setLoadingTips] = useState(false);

  // Status Berechnung
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

  // Funktion: KI Tipps holen
  const fetchTips = async () => {
    if (tips) {
      setTips(null);
      return;
    } // Zuklappen wenn schon offen
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

  // Icons
  const getIcon = (type) => {
    if (type === "cactus") return { emoji: "🌵", bg: "bg-emerald-100" };
    if (type === "flower") return { emoji: "🌸", bg: "bg-pink-100" };
    if (type === "palm") return { emoji: "🌴", bg: "bg-yellow-100" };
    return { emoji: "🌿", bg: "bg-green-100" };
  };
  const visual = getIcon(plant.type);

  // Farben für Status
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

      <div className="mt-4 flex justify-between items-center pl-1 gap-2">
        <div className="flex flex-col text-xs text-slate-400 font-medium">
          <span>Intervall: {plant.baseInterval} Tage</span>

          {/* KI TIPPS BUTTON */}
          <button
            onClick={fetchTips}
            className="mt-1 flex items-center gap-1 text-amber-500 hover:text-amber-600 transition-colors"
          >
            {loadingTips ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <Zap size={12} />
            )}
            {tips ? "Tipps verbergen" : "KI-Tipps"}
          </button>
        </div>

        <button
          onClick={() => onWater(plant.id)}
          className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-xl hover:bg-emerald-700 active:scale-95 transition-all shadow-lg shadow-emerald-200"
        >
          <Droplet size={16} className="fill-current" />
          Gießen
        </button>
      </div>

      {/* ANZEIGE DER KI TIPPS */}
      {tips && (
        <div className="mt-4 bg-amber-50 border border-amber-100 p-3 rounded-xl text-sm text-slate-700 animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2 font-bold text-amber-700 mb-1">
            <Sparkles size={14} /> Gemini Ratgeber:
          </div>
          {tips}
        </div>
      )}
    </div>
  );
};

// --- NEUE PFLANZE (MIT KI VORSCHLAG) ---
const AddPlantForm = ({ onAdd, onCancel, isSaving }) => {
  const [name, setName] = useState("");
  const [type, setType] = useState("leaf");
  const [days, setDays] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    // Wenn days leer ist, senden wir null -> Backend fragt Gemini
    onAdd(name, type, days ? parseInt(days) : null);
  };

  return (
    <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 animate-in fade-in zoom-in-95">
      <h3 className="font-bold text-slate-800 mb-4">Neue Pflanze</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          autoFocus
          type="text"
          placeholder="Name (z.B. Monstera)"
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
          <div className="relative">
            <input
              type="number"
              min="1"
              placeholder="Auto (KI)"
              className="w-full p-3 rounded-xl border border-slate-200"
              value={days}
              onChange={(e) => setDays(e.target.value)}
            />
            {!days && (
              <div className="absolute right-3 top-3.5 text-slate-400 pointer-events-none">
                <Sparkles size={16} />
              </div>
            )}
          </div>
        </div>
        <p className="text-xs text-slate-400 px-1">
          *Lass das Feld "Tage" leer, damit Gemini das ideale Intervall für dich
          schätzt.
        </p>
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
            disabled={isSaving}
            className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-medium shadow-lg hover:bg-emerald-700 flex justify-center items-center gap-2"
          >
            {isSaving && <Loader2 className="animate-spin" size={18} />}
            {isSaving ? "KI denkt..." : "Speichern"}
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
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans pb-32">
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-emerald-600 text-white p-2 rounded-lg">
              <Sprout size={20} />
            </div>
            <h1 className="text-xl font-bold text-slate-800">PlantPulse</h1>
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
