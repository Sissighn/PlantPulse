import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Droplets,
  ArrowLeft,
  Flower2,
  Leaf,
  Plus,
  Scissors,
  Search,
  Sprout,
  Sun,
  Thermometer,
  Wind,
} from "lucide-react";
import { BACKEND_URL } from "../constants";

const quickSearches = ["Monstera", "Orchidee", "Aloe Vera", "Calathea"];

async function fetchPlantBookSearch(query, signal) {
  const res = await fetch(
    `${BACKEND_URL}/plant-book/search?q=${encodeURIComponent(query)}&lang=de`,
    {
      credentials: "include",
      signal,
    },
  );

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.message || `HTTP ${res.status}`);
  }

  return data.plants || [];
}

async function fetchPlantBookDetail(pid, signal) {
  const res = await fetch(
    `${BACKEND_URL}/plant-book/${encodeURIComponent(pid)}?lang=de`,
    {
      credentials: "include",
      signal,
    },
  );

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.message || `HTTP ${res.status}`);
  }

  return data.plant;
}

function InfoTile({ icon, label, value }) {
  if (!value) return null;

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-800">
      <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase text-slate-400">
        {icon}
        <span>{label}</span>
      </div>
      <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-200">
        {value}
      </p>
    </div>
  );
}

function PlantBookDetail({ plant, loading, onAdd, onBack }) {
  if (loading) {
    return (
      <section className="space-y-3">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-emerald-700 dark:text-slate-400 dark:hover:text-emerald-300"
        >
          <ArrowLeft size={17} />
          Zurück
        </button>
        <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
          Pflegeprofil wird geladen...
        </div>
      </section>
    );
  }

  if (!plant) return null;

  const name = plant.alias || plant.scientificName || plant.displayPid;

  return (
    <section className="space-y-4">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-emerald-700 dark:text-slate-400 dark:hover:text-emerald-300"
      >
        <ArrowLeft size={17} />
        Zurück
      </button>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
        {plant.imageUrl && (
          <img
            src={plant.imageUrl}
            alt={name}
            className="h-56 w-full object-cover"
          />
        )}
        <div className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="truncate text-xl font-bold text-slate-900 dark:text-white">
                {name}
              </h3>
              {plant.scientificName && (
                <p className="mt-1 text-sm italic text-slate-500 dark:text-slate-400">
                  {plant.scientificName}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() =>
                onAdd(name || "Pflanze", plant.displayPid || plant.pid, null)
              }
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white hover:bg-emerald-700"
              title="Zu meinen Pflanzen hinzufügen"
            >
              <Plus size={18} />
            </button>
          </div>

          {plant.origin && (
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
              Herkunft: {plant.origin}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <InfoTile
          icon={<Thermometer size={15} />}
          label="Temperatur"
          value={plant.environment?.temperature}
        />
        <InfoTile
          icon={<Sun size={15} />}
          label="Licht"
          value={plant.environment?.light}
        />
        <InfoTile
          icon={<Droplets size={15} />}
          label="Bodenfeuchte"
          value={plant.environment?.soilMoisture}
        />
        <InfoTile
          icon={<Wind size={15} />}
          label="Luftfeuchte"
          value={plant.environment?.airHumidity}
        />
      </div>

      <div className="grid grid-cols-1 gap-3">
        <InfoTile
          icon={<Droplets size={15} />}
          label="Gießen"
          value={plant.care?.watering}
        />
        <InfoTile
          icon={<Sun size={15} />}
          label="Sonnenlicht"
          value={plant.care?.sunlight}
        />
        <InfoTile
          icon={<Sprout size={15} />}
          label="Erde"
          value={plant.care?.soil}
        />
        <InfoTile
          icon={<Flower2 size={15} />}
          label="Düngen"
          value={plant.care?.fertilization}
        />
        <InfoTile
          icon={<Scissors size={15} />}
          label="Schnitt"
          value={plant.care?.pruning}
        />
      </div>
    </section>
  );
}

export default function PlantBook({ onAddPlant }) {
  const [query, setQuery] = useState("");
  const [selectedPid, setSelectedPid] = useState(null);
  const trimmedQuery = query.trim();

  const searchQuery = useQuery({
    queryKey: ["plant-book-search", trimmedQuery],
    queryFn: ({ signal }) => fetchPlantBookSearch(trimmedQuery, signal),
    enabled: trimmedQuery.length >= 2,
    staleTime: 1000 * 60 * 10,
  });

  const detailQuery = useQuery({
    queryKey: ["plant-book-detail", selectedPid],
    queryFn: ({ signal }) => fetchPlantBookDetail(selectedPid, signal),
    enabled: Boolean(selectedPid),
    staleTime: 1000 * 60 * 20,
  });

  const results = searchQuery.data || [];

  return (
    <div className="space-y-5">
      <div className="relative">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setSelectedPid(null);
          }}
          placeholder="Pflanze suchen"
          className="w-full rounded-lg border border-slate-200 bg-white py-3 pl-10 pr-4 text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {quickSearches.map((term) => (
          <button
            key={term}
            type="button"
            onClick={() => {
              setQuery(term);
              setSelectedPid(null);
            }}
            className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-600 hover:border-emerald-300 hover:text-emerald-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-emerald-700"
          >
            {term}
          </button>
        ))}
      </div>

      {searchQuery.isError && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
          {searchQuery.error.message}
        </div>
      )}

      {searchQuery.isLoading && (
        <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
          Pflanzen werden gesucht...
        </div>
      )}

      {results.length > 0 && !selectedPid && (
        <div className="space-y-3">
          {results.map((plant) => (
            <button
              key={plant.pid}
              type="button"
              onClick={() => setSelectedPid(plant.pid)}
              className="flex w-full items-center gap-3 rounded-lg border border-slate-200 bg-white p-3 text-left hover:border-emerald-300 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-emerald-700"
            >
              {plant.imageUrl ? (
                <img
                  src={plant.imageUrl}
                  alt={plant.alias || plant.displayPid}
                  className="h-14 w-14 shrink-0 rounded-lg object-cover"
                />
              ) : (
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                  <Leaf size={22} />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate font-bold text-slate-800 dark:text-white">
                  {plant.alias || plant.scientificName || plant.displayPid}
                </p>
                {plant.scientificName && (
                  <p className="truncate text-sm italic text-slate-500 dark:text-slate-400">
                    {plant.scientificName}
                  </p>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {results.length === 0 &&
        trimmedQuery.length >= 2 &&
        !searchQuery.isLoading &&
        !searchQuery.isError && (
          <div className="rounded-lg border border-slate-200 bg-white p-4 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
            Keine Pflanzen gefunden.
          </div>
        )}

      <PlantBookDetail
        plant={detailQuery.data}
        loading={detailQuery.isLoading}
        onAdd={onAddPlant}
        onBack={() => setSelectedPid(null)}
      />
    </div>
  );
}
