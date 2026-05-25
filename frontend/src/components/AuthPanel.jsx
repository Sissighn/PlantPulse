import { useState } from "react";
import { Eye, EyeOff, LogIn, Sprout, UserPlus } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  getPasswordStrength,
  PASSWORD_MIN_LENGTH,
} from "../domain/passwordStrength";

const initialForm = {
  displayName: "",
  email: "",
  password: "",
};

export default function AuthPanel({
  initialMode = "login",
  onGuest,
  onLogin,
  onRegister,
}) {
  const { t } = useTranslation();
  const [mode, setMode] = useState(initialMode);
  const [form, setForm] = useState(initialForm);
  const [pendingAction, setPendingAction] = useState(null);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const passwordStrength = getPasswordStrength(form.password);

  const strengthTone = {
    empty: "bg-slate-200 dark:bg-slate-700",
    fair: "bg-amber-400",
    good: "bg-lime-500",
    strong: "bg-emerald-600",
    tooShort: "bg-rose-500",
  }[passwordStrength.level];

  const ruleTone = (matched) =>
    matched
      ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200"
      : "border-slate-200 bg-slate-50 text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400";

  const updateField = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const runAction = async (action, callback) => {
    setPendingAction(action);
    setError(null);

    try {
      await callback();
    } catch (caughtError) {
      setError(caughtError.message || t("dic.authError"));
    } finally {
      setPendingAction(null);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    runAction(mode, () =>
      mode === "login"
        ? onLogin({ email: form.email, password: form.password })
        : onRegister(form),
    );
  };

  return (
    <section className="min-h-[calc(100vh-92px)] flex items-center">
      <div className="w-full border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-200">
            <Sprout size={22} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              {t("dic.authTitle")}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {t("dic.authSubtitle")}
            </p>
          </div>
        </div>

        <div
          className="mb-5 grid grid-cols-2 rounded-xl bg-slate-100 p-1 dark:bg-slate-800"
          role="tablist"
        >
          <button
            type="button"
            onClick={() => setMode("login")}
            className={`flex min-h-11 items-center justify-center gap-2 rounded-lg px-3 text-sm font-semibold transition-colors ${
              mode === "login"
                ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white"
                : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
            }`}
          >
            <LogIn size={17} />
            {t("dic.login")}
          </button>
          <button
            type="button"
            onClick={() => setMode("signup")}
            className={`flex min-h-11 items-center justify-center gap-2 rounded-lg px-3 text-sm font-semibold transition-colors ${
              mode === "signup"
                ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white"
                : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
            }`}
          >
            <UserPlus size={17} />
            {t("dic.signup")}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "signup" && (
            <label className="block">
              <span className="mb-1 block text-xs font-bold uppercase text-slate-400">
                {t("dic.displayName")}
              </span>
              <input
                autoComplete="name"
                maxLength="60"
                value={form.displayName}
                onChange={updateField("displayName")}
                className="w-full rounded-xl border border-slate-200 bg-white p-3 outline-none focus:ring-2 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
            </label>
          )}

          <label className="block">
            <span className="mb-1 block text-xs font-bold uppercase text-slate-400">
              {t("dic.email")}
            </span>
            <input
              autoComplete="email"
              inputMode="email"
              required
              type="email"
              value={form.email}
              onChange={updateField("email")}
              className="w-full rounded-xl border border-slate-200 bg-white p-3 outline-none focus:ring-2 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
          </label>

          <div className="block">
            <span className="mb-1 block text-xs font-bold uppercase text-slate-400">
              {t("dic.password")}
            </span>
            <div className="relative">
              <input
                autoComplete={
                  mode === "login" ? "current-password" : "new-password"
                }
                maxLength="128"
                minLength={
                  mode === "signup" ? PASSWORD_MIN_LENGTH : undefined
                }
                required
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={updateField("password")}
                className="w-full rounded-xl border border-slate-200 bg-white p-3 pr-12 outline-none focus:ring-2 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
              <button
                aria-label={t(
                  showPassword ? "dic.hidePassword" : "dic.showPassword",
                )}
                aria-pressed={showPassword}
                className="absolute right-1.5 top-1.5 flex h-10 w-10 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white"
                onClick={() => setShowPassword((current) => !current)}
                title={t(
                  showPassword ? "dic.hidePassword" : "dic.showPassword",
                )}
                type="button"
              >
                {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
              </button>
            </div>

            {mode === "signup" && (
              <div className="mt-2 space-y-2">
                <div
                  aria-label={t("dic.passwordStrength.empty")}
                  aria-valuemax="5"
                  aria-valuemin="0"
                  aria-valuenow={passwordStrength.score}
                  className="h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700"
                  role="meter"
                >
                  <div
                    className={`h-full rounded-full transition-all ${strengthTone}`}
                    style={{ width: `${passwordStrength.width}%` }}
                  />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-300">
                    {t(`dic.passwordStrength.${passwordStrength.level}`)}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    <span
                      className={`rounded-md border px-1.5 py-0.5 text-[11px] font-semibold ${ruleTone(
                        passwordStrength.rules.minLength,
                      )}`}
                    >
                      {t("dic.passwordMin", { count: PASSWORD_MIN_LENGTH })}
                    </span>
                    <span
                      className={`rounded-md border px-1.5 py-0.5 text-[11px] font-semibold ${ruleTone(
                        passwordStrength.rules.lower,
                      )}`}
                    >
                      a-z
                    </span>
                    <span
                      className={`rounded-md border px-1.5 py-0.5 text-[11px] font-semibold ${ruleTone(
                        passwordStrength.rules.upper,
                      )}`}
                    >
                      A-Z
                    </span>
                    <span
                      className={`rounded-md border px-1.5 py-0.5 text-[11px] font-semibold ${ruleTone(
                        passwordStrength.rules.number,
                      )}`}
                    >
                      0-9
                    </span>
                    <span
                      className={`rounded-md border px-1.5 py-0.5 text-[11px] font-semibold ${ruleTone(
                        passwordStrength.rules.symbol,
                      )}`}
                    >
                      #!
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {error && (
            <p
              className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200"
              role="alert"
            >
              {error}
            </p>
          )}

          <button
            disabled={Boolean(pendingAction)}
            type="submit"
            className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 font-semibold text-white transition-colors hover:bg-emerald-700 disabled:cursor-wait disabled:bg-emerald-400"
          >
            {mode === "login" ? <LogIn size={18} /> : <UserPlus size={18} />}
            {t(mode === "login" ? "dic.login" : "dic.signup")}
          </button>
        </form>

        <div className="my-5 h-px bg-slate-200 dark:bg-slate-800" />

        <button
          disabled={Boolean(pendingAction)}
          type="button"
          onClick={() => runAction("guest", onGuest)}
          className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 font-semibold text-slate-700 transition-colors hover:bg-slate-100 disabled:cursor-wait dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
        >
          <Sprout size={18} />
          {t("dic.guestMode")}
        </button>
      </div>
    </section>
  );
}
