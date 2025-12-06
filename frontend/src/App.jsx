import React, { useState, useEffect } from "react";
import { Plus, Sun, Loader2, Moon } from "lucide-react";
import { BACKEND_URL, BASE_URL } from "./constants";
import SeasonSelector from "./components/SeasonSelector";
import PlantCard from "./components/PlantCard";
import AddPlantForm from "./components/AddPlantForm";
import { PixelBot } from "./components/PixelBot";
import { PlantAssistant } from "./components/PlantAssistant";

const App = () => {
  const [season, setSeason] = useState("summer");
  const [plants, setPlants] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem("theme") === "dark"
  );
  const [showAssistant, setShowAssistant] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

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
                src={`${BASE_URL}/icons/logo.png`}
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
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button
              onClick={() => setShowAssistant(true)}
              style={{
                background: "#333",
                color: "#76ff03",
                border: "2px solid #76ff03",
                padding: "8px 15px",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "bold",
                fontFamily: "monospace",
              }}
            >
              AI HELP
            </button>
          </div>
        </div>
      </nav>
      <main className="max-w-xl mx-auto px-6 py-8">
        {loading && (
          <div className="flex flex-col items-center justify-center pt-16">
            <PixelBot />
            <p className="mt-4 text-slate-500 dark:text-slate-400">
              Wecke die Pflanzen auf...
            </p>
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
              {showAssistant && (
                <PlantAssistant onClose={() => setShowAssistant(false)} />
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default App;
