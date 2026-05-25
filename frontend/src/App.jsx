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
} from "lucide-react";
import { BACKEND_URL, BASE_URL } from "./constants";
import SeasonSelector from "./components/SeasonSelector";
import PlantCard from "./components/PlantCardContainer";
import AddPlantForm from "./components/AddPlantForm";
import AuthPanel from "./components/AuthPanel";
import PlantBook from "./components/PlantBook";
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
      const res = await fetch(`${BACKEND_URL}/plants`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, type, baseInterval: interval }),
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
            {/* Dark mode toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* Notifications */}
            <div className="relative" ref={notificationRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
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
              onClick={() => setShowAssistant(true)}
              className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors relative"
              title={t("dic.aiAssistantTitle")}
            >
              <Bot size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-emerald-500 rounded-full border border-white dark:border-slate-800"></span>
            </button>

            {user && (
              <>
                {user.isGuest && (
                  <button
                    onClick={() => setShowGuestAccount(true)}
                    className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    title={t("dic.signup")}
                  >
                    <UserPlus size={20} />
                  </button>
                )}
                <div
                  className="hidden max-w-32 items-center gap-2 truncate rounded-full bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-200 sm:flex"
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
            <MenuContainer>
              {/* Slot 0: Trigger */}
              <MenuItem icon={<MoreHorizontal size={20} />} />

              {/* Slot 1: Settings */}
              <MenuItem
                icon={<Settings size={20} />}
                onClick={() => alert("Settings clicked!")}
              />

              {/* Slot 2: Language switcher */}
              <LanguageMenuItem />

              {/* Slot 3: Session exit */}
              {user && (
                <MenuItem
                  icon={<LogOut size={20} />}
                  onClick={logout}
                  title={t("dic.logout")}
                />
              )}
            </MenuContainer>
          </div>
        </div>
      </nav>

      <main className="max-w-xl mx-auto px-6 py-8">
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
            <div className="mb-6 grid grid-cols-2 gap-2 rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
              <button
                type="button"
                onClick={() => setCurrentView("garden")}
                className={`flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-bold transition-colors ${
                  currentView === "garden"
                    ? "bg-white text-emerald-700 shadow-sm dark:bg-slate-700 dark:text-emerald-300"
                    : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
                }`}
              >
                <Sprout size={17} />
                Meine Pflanzen
              </button>
              <button
                type="button"
                onClick={() => {
                  setCurrentView("plantBook");
                  setIsAdding(false);
                }}
                className={`flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-bold transition-colors ${
                  currentView === "plantBook"
                    ? "bg-white text-emerald-700 shadow-sm dark:bg-slate-700 dark:text-emerald-300"
                    : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
                }`}
              >
                <BookOpen size={17} />
                Plant Book
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
                    onClick={() => setIsAdding(true)}
                    className="w-full bg-white dark:bg-slate-800 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-3xl p-6 flex flex-col items-center justify-center gap-2 text-slate-400 hover:border-emerald-400 dark:hover:border-emerald-600 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-all group mb-8"
                  >
                    <div className="bg-slate-100 dark:bg-slate-700 p-3 rounded-full group-hover:bg-emerald-200 dark:group-hover:bg-emerald-800 transition-colors">
                      <Plus size={24} />
                    </div>
                    <span className="font-medium">{t("dic.addPlantCta")}</span>
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

            {showAssistant && (
              <PlantAssistant
                onClose={() => setShowAssistant(false)}
                userId={user.id}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default App;
