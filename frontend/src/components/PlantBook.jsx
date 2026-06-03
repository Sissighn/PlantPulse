import React, { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Droplets,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Flower2,
  Leaf,
  Plus,
  RotateCcw,
  Scissors,
  Search,
  Sprout,
  Sun,
  Thermometer,
  Wind,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { BACKEND_URL } from "../constants";
import {
  careEffortSummary,
  careRiskSummary,
  interpretCareData,
} from "../domain/careInterpretation";

const quickSearches = ["Monstera", "Orchidee", "Aloe Vera", "Calathea"];
const SEARCH_DEBOUNCE_MS = 350;

function useDebouncedValue(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timeout = window.setTimeout(() => setDebouncedValue(value), delay);
    return () => window.clearTimeout(timeout);
  }, [delay, value]);

  return debouncedValue;
}

async function fetchPlantBookSearch(query, language, signal) {
  const res = await fetch(
    `${BACKEND_URL}/plant-book/search?q=${encodeURIComponent(
      query,
    )}&lang=${encodeURIComponent(language)}`,
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

async function fetchPlantBookDetail(pid, language, signal) {
  const res = await fetch(
    `${BACKEND_URL}/plant-book/${encodeURIComponent(
      pid,
    )}?lang=${encodeURIComponent(language)}`,
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

function ErrorPanel({ message, onRetry }) {
  const { t } = useTranslation();

  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
      <div className="flex items-start gap-3">
        <AlertCircle className="mt-0.5 shrink-0" size={18} />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold">{t("dic.plantBookErrorTitle")}</p>
          <p className="mt-1 text-sm leading-relaxed">{message}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={onRetry}
        className="mt-3 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-sm font-bold text-amber-800 shadow-sm hover:bg-amber-100 dark:bg-slate-900 dark:text-amber-100 dark:hover:bg-slate-800"
      >
        <RotateCcw size={14} />
        {t("dic.plantBookRetry")}
      </button>
    </div>
  );
}

function SearchSkeleton() {
  return (
    <div className="space-y-3" aria-hidden="true">
      {[0, 1, 2].map((item) => (
        <div
          key={item}
          className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-800"
        >
          <div className="h-14 w-14 shrink-0 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-700" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="h-4 w-2/3 animate-pulse rounded bg-slate-100 dark:bg-slate-700" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-slate-100 dark:bg-slate-700" />
          </div>
        </div>
      ))}
    </div>
  );
}

function DetailSkeleton({ onBack }) {
  const { t } = useTranslation();

  return (
    <section className="space-y-3">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-emerald-700 dark:text-slate-400 dark:hover:text-emerald-300"
      >
        <ArrowLeft size={17} />
        {t("dic.plantBookBack")}
      </button>
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
        <div className="h-56 animate-pulse bg-slate-100 dark:bg-slate-700" />
        <div className="space-y-3 p-4">
          <div className="h-5 w-2/3 animate-pulse rounded bg-slate-100 dark:bg-slate-700" />
          <div className="h-4 w-1/2 animate-pulse rounded bg-slate-100 dark:bg-slate-700" />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3">
        {[0, 1, 2].map((item) => (
          <div
            key={item}
            className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800"
          >
            <div className="mb-3 h-3 w-24 animate-pulse rounded bg-slate-100 dark:bg-slate-700" />
            <div className="h-4 w-3/4 animate-pulse rounded bg-slate-100 dark:bg-slate-700" />
          </div>
        ))}
      </div>
    </section>
  );
}

function EmptySearchState({ title, message }) {
  return (
    <div className="rounded-lg border border-dashed border-slate-200 bg-white p-6 text-center dark:border-slate-700 dark:bg-slate-800">
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
        <Search size={20} />
      </div>
      <p className="font-bold text-slate-800 dark:text-white">{title}</p>
      <p className="mt-1 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
        {message}
      </p>
    </div>
  );
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

function effortClasses(level) {
  if (level === "demanding") {
    return "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-200";
  }
  if (level === "medium") {
    return "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200";
  }
  return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-200";
}

function InterpretationTile({ icon, label, interpretation }) {
  const { t } = useTranslation();

  if (!interpretation?.rawValue) return null;

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
      <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase text-slate-400">
        {icon}
        <span>{label}</span>
      </div>
      <p className="mb-1 text-base font-bold text-slate-900 dark:text-white">
        {t(interpretation.interpretedLabelKey)}
      </p>
      <p className="mb-3 text-xs font-semibold text-slate-400">
        {t("dic.plantBookTechnicalValue")}: {interpretation.rawValue}
      </p>
      <p className="mb-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
        {t(interpretation.simpleExplanationKey)}
      </p>
      <p className="text-sm leading-relaxed text-slate-800 dark:text-slate-100">
        <span className="font-bold">{t("dic.plantBookAdvice")}:</span>{" "}
        {t(interpretation.actionAdviceKey)}
      </p>
    </div>
  );
}

function CareEffortPanel({ effort }) {
  const { t } = useTranslation();

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase text-slate-400">
            {t("dic.plantBookCareEffort")}
          </p>
          <p className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
            {t(effort.labelKey)}
          </p>
        </div>
        <span
          className={`shrink-0 rounded-full border px-3 py-1 text-xs font-bold ${effortClasses(
            effort.level,
          )}`}
        >
          {t(`dic.plantBookCareEffort.${effort.level}`)}
        </span>
      </div>
      <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
        {t(effort.explanationKey)}
      </p>
      {effort.reasons.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {effort.reasons.map((reason) => (
            <span
              key={reason.key}
              className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-700 dark:text-slate-200"
            >
              {t(reason.reasonKey)}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function PlantBookDetail({ error, loading, onAdd, onBack, onRetry, plant }) {
  const { i18n, t } = useTranslation();
  const interpretedCare = useMemo(
    () => interpretCareData(plant?.raw, i18n.language),
    [i18n.language, plant?.raw],
  );
  const riskSummary = useMemo(
    () => careRiskSummary(interpretedCare),
    [interpretedCare],
  );
  const careEffort = useMemo(
    () => careEffortSummary(interpretedCare, plant?.raw),
    [interpretedCare, plant?.raw],
  );

  if (loading) return <DetailSkeleton onBack={onBack} />;

  if (error) {
    return (
      <section className="space-y-3">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-emerald-700 dark:text-slate-400 dark:hover:text-emerald-300"
        >
          <ArrowLeft size={17} />
          {t("dic.plantBookBack")}
        </button>
        <ErrorPanel message={error.message} onRetry={onRetry} />
      </section>
    );
  }

  if (!plant) return null;

  const name = plant.alias || plant.scientificName || plant.displayPid;
  const interpretationItems = [
    {
      icon: <Thermometer size={15} />,
      label: t("dic.plantBookTemperature"),
      value: interpretedCare.temperature,
    },
    {
      icon: <Sun size={15} />,
      label: t("dic.plantBookLight"),
      value: interpretedCare.light,
    },
    {
      icon: <Droplets size={15} />,
      label: t("dic.plantBookSoilMoisture"),
      value: interpretedCare.soilMoisture,
    },
    {
      icon: <Wind size={15} />,
      label: t("dic.plantBookAirHumidity"),
      value: interpretedCare.airHumidity,
    },
  ].filter((item) => item.value?.rawValue);
  const careTiles = [
    {
      icon: <Droplets size={15} />,
      label: t("dic.plantBookWatering"),
      value: plant.care?.watering,
    },
    {
      icon: <Sun size={15} />,
      label: t("dic.plantBookSunlight"),
      value: plant.care?.sunlight,
    },
    {
      icon: <Sprout size={15} />,
      label: t("dic.plantBookSoil"),
      value: plant.care?.soil,
    },
    {
      icon: <Flower2 size={15} />,
      label: t("dic.plantBookFertilization"),
      value: plant.care?.fertilization,
    },
    {
      icon: <Scissors size={15} />,
      label: t("dic.plantBookPruning"),
      value: plant.care?.pruning,
    },
  ].filter((item) => item.value);
  const hasDetailData = interpretationItems.length > 0 || careTiles.length > 0;

  return (
    <section className="space-y-4">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-emerald-700 dark:text-slate-400 dark:hover:text-emerald-300"
      >
        <ArrowLeft size={17} />
        {t("dic.plantBookBack")}
      </button>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
        {plant.imageUrl ? (
          <img
            src={plant.imageUrl}
            alt={name}
            className="h-56 w-full object-cover"
          />
        ) : (
          <div className="flex h-56 w-full items-center justify-center bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-200">
            <Leaf size={42} />
          </div>
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
              aria-label={t("dic.plantBookAddTitle")}
              type="button"
              onClick={() =>
                onAdd(name || "Pflanze", plant.displayPid || plant.pid, null)
              }
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white hover:bg-emerald-700"
              title={t("dic.plantBookAddTitle")}
            >
              <Plus aria-hidden="true" size={18} />
            </button>
          </div>

          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
            {plant.origin
              ? t("dic.plantBookOrigin", { origin: plant.origin })
              : t("dic.plantBookOriginUnknown")}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <CareEffortPanel effort={careEffort} />

        <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
          <p className="mb-2 text-xs font-bold uppercase text-slate-400">
            {t("dic.plantBookRiskOverview")}
          </p>
          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            {riskSummary.summaryKey
              ? t(riskSummary.summaryKey)
              : riskSummary.items
                  .map((risk, index) =>
                    t("dic.careInterpretation.riskSummaryItem", {
                      label: t(`dic.careInterpretation.riskSummaryLead.${index}`),
                      message: t(risk.messageKey),
                    }),
                  )
                  .join(" ")}
          </p>
        </div>
      </div>

      {interpretationItems.length > 0 && (
        <div className="grid grid-cols-1 gap-3">
          {interpretationItems.map((item) => (
            <InterpretationTile
              key={item.label}
              icon={item.icon}
              label={item.label}
              interpretation={item.value}
            />
          ))}
        </div>
      )}

      {careTiles.length > 0 && (
        <div className="grid grid-cols-1 gap-3">
          {careTiles.map((item) => (
            <InfoTile
              key={item.label}
              icon={item.icon}
              label={item.label}
              value={item.value}
            />
          ))}
        </div>
      )}

      {!hasDetailData && (
        <div className="rounded-lg border border-dashed border-slate-200 bg-white p-5 text-center dark:border-slate-700 dark:bg-slate-800">
          <p className="font-bold text-slate-800 dark:text-white">
            {t("dic.plantBookMissingDataTitle")}
          </p>
          <p className="mt-1 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
            {t("dic.plantBookMissingDataMessage")}
          </p>
        </div>
      )}
    </section>
  );
}

export default function PlantBook({ onAddPlant }) {
  const { i18n, t } = useTranslation();
  const [query, setQuery] = useState("");
  const [selectedPid, setSelectedPid] = useState(null);
  const [toast, setToast] = useState(null);
  const trimmedQuery = query.trim();
  const debouncedQuery = useDebouncedValue(trimmedQuery, SEARCH_DEBOUNCE_MS);
  const plantBookLanguage = i18n.language?.startsWith("de") ? "de" : "en";

  useEffect(() => {
    if (!toast) return undefined;

    const timeout = window.setTimeout(() => setToast(null), 2800);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const searchQuery = useQuery({
    queryKey: ["plant-book-search", plantBookLanguage, debouncedQuery],
    queryFn: ({ signal }) =>
      fetchPlantBookSearch(debouncedQuery, plantBookLanguage, signal),
    enabled: debouncedQuery.length >= 2,
    staleTime: 1000 * 60 * 10,
  });

  const detailQuery = useQuery({
    queryKey: ["plant-book-detail", plantBookLanguage, selectedPid],
    queryFn: ({ signal }) =>
      fetchPlantBookDetail(selectedPid, plantBookLanguage, signal),
    enabled: Boolean(selectedPid),
    staleTime: 1000 * 60 * 20,
  });

  const results = searchQuery.data || [];
  const searchIsDebouncing = trimmedQuery !== debouncedQuery;
  const showSearchLoading =
    trimmedQuery.length >= 2 && (searchIsDebouncing || searchQuery.isLoading);

  const handleAddPlant = (name, type, interval) => {
    onAddPlant(name, type, interval);
    setToast(t("dic.plantBookAddedToast", { name }));
  };

  return (
    <div className="relative space-y-5">
      {toast && (
        <div
          className="sticky top-20 z-20 flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-800 shadow-sm dark:border-emerald-900 dark:bg-emerald-950/70 dark:text-emerald-100"
          role="status"
        >
          <CheckCircle2 size={18} />
          <span>{toast}</span>
        </div>
      )}

      <div className="relative">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          aria-label={t("dic.plantBookSearchPlaceholder")}
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setSelectedPid(null);
          }}
          placeholder={t("dic.plantBookSearchPlaceholder")}
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
        <ErrorPanel
          message={searchQuery.error.message}
          onRetry={() => searchQuery.refetch()}
        />
      )}

      {showSearchLoading && <SearchSkeleton />}

      {trimmedQuery.length === 0 && !selectedPid && (
        <EmptySearchState
          title={t("dic.plantBookEmptyTitle")}
          message={t("dic.plantBookEmptyMessage")}
        />
      )}

      {results.length > 0 && !selectedPid && !showSearchLoading && (
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
        debouncedQuery.length >= 2 &&
        !showSearchLoading &&
        !searchQuery.isError && (
          <EmptySearchState
            title={t("dic.plantBookNoResults")}
            message={t("dic.plantBookNoResultsMessage")}
          />
        )}

      {trimmedQuery.length === 1 && !selectedPid && (
        <EmptySearchState
          title={t("dic.plantBookKeepTypingTitle")}
          message={t("dic.plantBookKeepTypingMessage")}
        />
      )}

      <PlantBookDetail
        error={detailQuery.error}
        plant={detailQuery.data}
        loading={detailQuery.isLoading}
        onAdd={handleAddPlant}
        onBack={() => setSelectedPid(null)}
        onRetry={() => detailQuery.refetch()}
      />
    </div>
  );
}
