import React, { useState, useEffect, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Sun,
  Moon,
  Bot,
  Bell,
  Settings,
  MoreHorizontal,
  LogOut,
  UserRound,
  UserPlus,
  BookOpen,
  Sprout,
  CalendarDays,
} from "lucide-react";
import { BACKEND_URL, BASE_URL } from "./constants";
import SeasonSelector from "./components/SeasonSelector";
import PlantCard from "./components/PlantCardContainer";
import AddPlantForm from "./components/AddPlantForm";
import AuthPanel from "./components/AuthPanel";
import PlantBook from "./components/PlantBook";
import WateringCalendar from "./components/WateringCalendar";
import SettingsModal from "./components/SettingsModal";
import { PixelBot } from "./features/pixelBot/PixelBot";
import { PlantAssistant } from "./features/plantAssistant/PlantAssistant";
import Notifications from "./components/Notifications";
import { useNotifications } from "./hooks/useNotifications";
import {
  MenuContainer,
  MenuItem,
  LanguageMenuItem,
} from "./components/FluidMenu";
import { useTranslation } from "react-i18next";

const plantsQueryKey = ["plants"];
const WEEK_START_STORAGE_KEY = "plantpulse.weekStartsOn";

function readStoredWeekStart() {
  return localStorage.getItem(WEEK_START_STORAGE_KEY) === "0" ? 0 : 1;
}

class UnauthorizedError extends Error {
  constructor() {
    super("Unauthorized");
    this.name = "UnauthorizedError";
  }
}

const fetchPlants = async ({ signal }) => {
  const res = await fetch(`${BACKEND_URL}/plants`, {
    credentials: "include",
    signal,
  });

  if (res.status === 401) {
    throw new UnauthorizedError();
  }

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }

  const data = await res.json();
  return data.plants || [];
};

const App = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [season, setSeason] = useState("summer");
  const [isAdding, setIsAdding] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [showGuestAccount, setShowGuestAccount] = useState(false);
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem("theme") === "dark",
  );
  const [showAssistant, setShowAssistant] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [weekStartsOn, setWeekStartsOn] = useState(readStoredWeekStart);
  const [currentView, setCurrentView] = useState("garden");
  const plantsQuery = useQuery({
    queryKey: plantsQueryKey,
    queryFn: fetchPlants,
    enabled: Boolean(user),
    retry: (failureCount, err) =>
      !(err instanceof UnauthorizedError) && failureCount < 1,
  });
  const plants = user ? plantsQuery.data || [] : [];
  const notifications = useNotifications(plants, season);
  const notificationRef = useRef(null);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem(WEEK_START_STORAGE_KEY, String(weekStartsOn));
  }, [weekStartsOn]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!showNotifications) return undefined;

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        event.preventDefault();
        setShowNotifications(false);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [showNotifications]);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/auth/session`, {
          credentials: "include",
        });

        if (!res.ok) {
          return;
        }

        const data = await res.json();
        setUser(data.user);
      } catch {
        setUser(null);
      } finally {
        setAuthLoading(false);
      }
    };

    fetchSession();
  }, []);

  useEffect(() => {
    if (plantsQuery.error instanceof UnauthorizedError) {
      setUser(null);
      setShowGuestAccount(false);
      queryClient.removeQueries({ queryKey: plantsQueryKey });
    }
  }, [plantsQuery.error, queryClient]);

  const invalidatePlants = () =>
    queryClient.invalidateQueries({ queryKey: plantsQueryKey });

  const startSession = async (endpoint, payload) => {
    const res = await fetch(`${BACKEND_URL}/auth/${endpoint}`, {
      body: payload ? JSON.stringify(payload) : undefined,
      credentials: "include",
      headers: payload ? { "Content-Type": "application/json" } : undefined,
      method: "POST",
    });

    const data = res.status === 204 ? null : await res.json();
    if (!res.ok) {
      throw new Error(data?.message || t("dic.authError"));
    }

    setUser(data.user);
    setShowGuestAccount(false);
    await invalidatePlants();
  };

  const logout = async () => {
    await fetch(`${BACKEND_URL}/auth/logout`, {
      credentials: "include",
      method: "POST",
    });
    setUser(null);
    setShowGuestAccount(false);
    queryClient.removeQueries({ queryKey: plantsQueryKey });
  };

  const addPlantMutation = useMutation({
    mutationFn: async ({ name, type, interval }) => {
      const payload = { name, type };
      if (Number.isFinite(interval) && interval > 0) {
        payload.baseInterval = interval;
      }

      const res = await fetch(`${BACKEND_URL}/plants`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.status === 401) {
        throw new UnauthorizedError();
      }

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
    },
    onSuccess: async () => {
      setIsAdding(false);
      setCurrentView("garden");
      await invalidatePlants();
    },
    onError: (err) => {
      if (err instanceof UnauthorizedError) {
        setUser(null);
        setShowGuestAccount(false);
        queryClient.removeQueries({ queryKey: plantsQueryKey });
        return;
      }

      alert("Fehler beim Speichern");
    },
  });

  const deletePlantMutation = useMutation({
    mutationFn: async (id) => {
      const res = await fetch(`${BACKEND_URL}/plants/${id}`, {
        credentials: "include",
        method: "DELETE",
      });

      if (res.status === 401) {
        throw new UnauthorizedError();
      }

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
    },
    onSuccess: invalidatePlants,
    onError: (err) => {
      if (err instanceof UnauthorizedError) {
        setUser(null);
        setShowGuestAccount(false);
        queryClient.removeQueries({ queryKey: plantsQueryKey });
      }
    },
  });

  const waterPlantMutation = useMutation({
    mutationFn: async (id) => {
      const res = await fetch(`${BACKEND_URL}/water/${id}`, {
        credentials: "include",
        method: "POST",
      });

      if (res.status === 401) {
        throw new UnauthorizedError();
      }

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
    },
    onSuccess: invalidatePlants,
    onError: (err) => {
      if (err instanceof UnauthorizedError) {
        setUser(null);
        setShowGuestAccount(false);
        queryClient.removeQueries({ queryKey: plantsQueryKey });
      }
    },
  });

  const addPlant = (name, type, interval) => {
    addPlantMutation.mutate({ name, type, interval });
  };

  const deletePlant = (id) => {
    deletePlantMutation.mutate(id);
  };

  const waterPlant = (id) => {
    waterPlantMutation.mutate(id);
  };

  const loading = plantsQuery.isLoading;
  const error =
    plantsQuery.isError && !(plantsQuery.error instanceof UnauthorizedError)
      ? "backendOffline"
      : null;

  const isSaving = addPlantMutation.isPending;

  const accountLabel =
    user?.displayName || user?.email || (user?.isGuest ? t("dic.guest") : "");

  return (
    <div className="pp-shell font-plant-body transition-colors duration-300">
      <nav className="pp-header">
        <div className="pp-header-inner">
          <div className="pp-brand">
            <img
              src={`${BASE_URL}/icons/logo.png`}
              alt="PlantPulse Logo"
              className="pp-logo"
            />
            <h1 className="pp-title font-plant-title">
              PlantPulse
            </h1>
          </div>

          <div className="pp-header-actions">
            {/* Dark mode toggle */}
            <button
              aria-label={t(darkMode ? "dic.lightMode" : "dic.darkMode")}
              aria-pressed={darkMode}
              onClick={() => setDarkMode(!darkMode)}
              type="button"
              className="pp-icon-button"
              title={t(darkMode ? "dic.lightMode" : "dic.darkMode")}
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* Notifications */}
            <div className="relative" ref={notificationRef}>
              <button
                aria-expanded={showNotifications}
                aria-label={t("dic.notificationsTitle")}
                aria-haspopup="dialog"
                onClick={() => setShowNotifications(!showNotifications)}
                type="button"
                className="pp-icon-button relative"
                title={t("dic.notificationsTitle")}
              >
                <Bell size={20} />
                {notifications.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white border-2 border-white dark:border-slate-900">
                    {notifications.length}
                  </span>
                )}
              </button>
              {showNotifications && (
                <Notifications notifications={notifications} />
              )}
            </div>

            {/* AI Assistant */}
            <button
              aria-label={t("dic.aiAssistantTitle")}
              onClick={() => setShowAssistant(true)}
              type="button"
              className="pp-icon-button relative"
              title={t("dic.aiAssistantTitle")}
            >
              <Bot size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-emerald-500 rounded-full border border-white dark:border-slate-800"></span>
            </button>

            {user && (
              <>
                {user.isGuest && (
                  <button
                    aria-label={t("dic.signup")}
                    onClick={() => setShowGuestAccount(true)}
                    type="button"
                    className="pp-icon-button"
                    title={t("dic.signup")}
                  >
                    <UserPlus size={20} />
                  </button>
                )}
                <div
                  className="pp-user-chip"
                  title={accountLabel}
                >
                  <UserRound size={16} />
                  <span className="truncate">{accountLabel}</span>
                </div>
              </>
            )}

            {/*
              FluidMenu — stacked action items:
                1. MoreHorizontal  ← always visible trigger
                2. Settings
                3. Language (Globe + DE/EN picker)
                4. Logout / leave guest mode
            */}
            <MenuContainer label={t("dic.moreActions")}>
              {/* Slot 0: Trigger */}
              <MenuItem icon={<MoreHorizontal size={20} />} />

              {/* Slot 1: Settings */}
              <MenuItem
                icon={<Settings size={20} />}
                onClick={() => setShowSettings(true)}
                ariaLabel={t("dic.settingsTitle")}
                title={t("dic.settingsTitle")}
              />

              {/* Slot 2: Language switcher */}
              <LanguageMenuItem />

              {/* Slot 3: Session exit */}
              {user && (
                <MenuItem
                  icon={<LogOut size={20} />}
                  onClick={logout}
                  ariaLabel={t("dic.logout")}
                  title={t("dic.logout")}
                />
              )}
            </MenuContainer>
          </div>
        </div>
      </nav>

      <main className="pp-main relative z-10">
        {(authLoading || (user && loading)) && (
          <div className="flex flex-col items-center justify-center pt-16">
            <PixelBot />
            <p className="mt-4 text-slate-500 dark:text-slate-400">
              {t("dic.wakingPlants")}
            </p>
          </div>
        )}

        {!authLoading && !user && (
          <AuthPanel
            onGuest={() => startSession("guest")}
            onLogin={(payload) => startSession("login", payload)}
            onRegister={(payload) => startSession("register", payload)}
          />
        )}

        {!authLoading && user && showGuestAccount && (
          <AuthPanel
            initialMode="signup"
            onGuest={() => startSession("guest")}
            onLogin={(payload) => startSession("login", payload)}
            onRegister={(payload) => startSession("register", payload)}
          />
        )}

        {!authLoading && user && !showGuestAccount && !loading && error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 rounded-2xl p-4 text-red-700 dark:text-red-300 text-center">
            {t("dic.backendOffline")}
          </div>
        )}

        {!authLoading && user && !showGuestAccount && !loading && !error && (
          <>
            <div className="pp-panel pp-tabs">
              <button
                type="button"
                onClick={() => {
                  setCurrentView("garden");
                  setIsAdding(false);
                }}
                className={`pp-tab ${
                  currentView === "garden"
                    ? "pp-tab-active"
                    : ""
                }`}
              >
                <Sprout size={17} />
                {t("dic.myPlants")}
              </button>
              <button
                type="button"
                onClick={() => {
                  setCurrentView("calendar");
                  setIsAdding(false);
                }}
                className={`pp-tab ${
                  currentView === "calendar"
                    ? "pp-tab-active"
                    : ""
                }`}
              >
                <CalendarDays size={17} />
                {t("dic.calendar")}
              </button>
              <button
                type="button"
                onClick={() => {
                  setCurrentView("plantBook");
                  setIsAdding(false);
                }}
                className={`pp-tab ${
                  currentView === "plantBook"
                    ? "pp-tab-active"
                    : ""
                }`}
              >
                <BookOpen size={17} />
                {t("dic.plantBook")}
              </button>
            </div>

            {currentView === "garden" && (
              <>
                <SeasonSelector
                  currentSeason={season}
                  onSeasonChange={setSeason}
                />
                {!isAdding ? (
                  <button
                    type="button"
                    onClick={() => setIsAdding(true)}
                    className="pp-panel pp-add-card group mb-8"
                  >
                    <img
                      src={`${BASE_URL}/icons/decor-add-new.png`}
                      alt=""
                      aria-hidden="true"
                      className="pp-add-decor pp-add-decor-left"
                    />
                    <img
                      src={`${BASE_URL}/icons/decor-shovel.png`}
                      alt=""
                      aria-hidden="true"
                      className="pp-add-decor pp-add-decor-right"
                    />
                    <div className="pp-add-plus">
                      <Plus size={24} />
                    </div>
                    <span className="pp-add-title">
                      {t("dic.addPlantCta")}
                    </span>
                    <span className="pp-add-subtitle">
                      {t("dic.addPlantSubtitle")}
                    </span>
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

            {currentView === "plantBook" && <PlantBook onAddPlant={addPlant} />}

            {currentView === "calendar" && (
              <>
                <SeasonSelector
                  currentSeason={season}
                  onSeasonChange={setSeason}
                />
                <WateringCalendar
                  plants={plants}
                  season={season}
                  weekStartsOn={weekStartsOn}
                />
              </>
            )}

            {showSettings && (
              <SettingsModal
                onClose={() => setShowSettings(false)}
                onWeekStartChange={setWeekStartsOn}
                weekStartsOn={weekStartsOn}
              />
            )}

            {showAssistant && (
              <PlantAssistant
                onClose={() => setShowAssistant(false)}
                userId={user.id}
              />
            )}
          </>
        )}
      </main>
      <div className="pp-footer-decor" aria-hidden="true">
        <img
          src={`${BASE_URL}/icons/footer_grass.png`}
          alt=""
          className="pp-footer-grass"
        />
        <img
          src={`${BASE_URL}/icons/footer_flowers.png`}
          alt=""
          className="pp-footer-flowers"
        />
        <img
          src={`${BASE_URL}/icons/footer_grean_creature.png`}
          alt=""
          className="pp-footer-creature"
        />
      </div>
    </div>
  );
};

export default App;
