import React, { useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Droplets,
  Leaf,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { BASE_URL } from "../constants";
import {
  buildWateringEventsForMonth,
  getMonthGridDates,
  getNextWateringDate,
  toDateKey,
} from "../domain/wateringCalendar";

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addMonths(date, months) {
  return new Date(date.getFullYear(), date.getMonth() + months, 1);
}

function formatDate(date, language, options) {
  return new Intl.DateTimeFormat(language, options).format(date);
}

function getImageUrl(imageUrl) {
  if (!imageUrl) return null;
  return imageUrl.startsWith("http") ? imageUrl : `${BASE_URL}${imageUrl}`;
}

function EventPill({ event }) {
  return (
    <div
      className={`flex items-center gap-1 rounded-md px-1.5 py-1 text-[10px] font-bold leading-none ${
        event.isToday
          ? "bg-emerald-600 text-white"
          : event.isOverdue
            ? "bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-200"
            : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-200"
      }`}
      title={event.plant.name}
    >
      <Droplets size={11} />
      <span className="truncate">{event.plant.name}</span>
    </div>
  );
}

function PlantAvatar({ plant }) {
  const imageUrl = getImageUrl(plant.imageUrl);

  if (!imageUrl) {
    return (
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
        <Leaf size={18} />
      </div>
    );
  }

  return (
    <img
      src={imageUrl}
      alt={plant.name}
      className="h-10 w-10 shrink-0 rounded-xl object-cover"
    />
  );
}

export default function WateringCalendar({ plants, season }) {
  const { i18n, t } = useTranslation();
  const [visibleMonth, setVisibleMonth] = useState(() => startOfMonth(new Date()));
  const todayKey = toDateKey(new Date());
  const monthDates = useMemo(
    () => getMonthGridDates(visibleMonth),
    [visibleMonth],
  );
  const events = useMemo(
    () => buildWateringEventsForMonth(plants, season, visibleMonth),
    [plants, season, visibleMonth],
  );
  const eventsByDate = useMemo(() => {
    return events.reduce((map, event) => {
      const current = map.get(event.dateKey) || [];
      current.push(event);
      map.set(event.dateKey, current);
      return map;
    }, new Map());
  }, [events]);
  const upcomingPlants = useMemo(() => {
    return plants
      .map((plant) => {
        const nextDate = getNextWateringDate(plant, season);
        return {
          date: nextDate,
          dateKey: toDateKey(nextDate),
          plant,
        };
      })
      .sort((a, b) => {
        const dateDiff = a.date.getTime() - b.date.getTime();
        return dateDiff || a.plant.name.localeCompare(b.plant.name);
      })
      .slice(0, 5);
  }, [plants, season]);
  const weekdayLabels = useMemo(() => {
    return Array.from({ length: 7 }, (_, index) =>
      formatDate(new Date(2026, 5, 1 + index), i18n.language, {
        weekday: "short",
      }),
    );
  }, [i18n.language]);

  const monthLabel = formatDate(visibleMonth, i18n.language, {
    month: "long",
    year: "numeric",
  });

  const currentMonth = visibleMonth.getMonth();

  return (
    <section className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-300">
            {t("dic.calendarEyebrow")}
          </p>
          <h2 className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
            {t("dic.calendarTitle")}
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
            {t("dic.calendarSubtitle")}
          </p>
        </div>
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200">
          <CalendarDays size={22} />
        </div>
      </div>

      <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <div className="mb-4 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setVisibleMonth((month) => addMonths(month, -1))}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-colors hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
            aria-label={t("dic.calendarPreviousMonth")}
            title={t("dic.calendarPreviousMonth")}
          >
            <ChevronLeft size={19} />
          </button>
          <div className="text-center">
            <h3 className="text-lg font-bold capitalize text-slate-900 dark:text-white">
              {monthLabel}
            </h3>
            <p className="text-xs font-semibold text-slate-400">
              {t(`dic.season.${season}`)}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setVisibleMonth((month) => addMonths(month, 1))}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-colors hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
            aria-label={t("dic.calendarNextMonth")}
            title={t("dic.calendarNextMonth")}
          >
            <ChevronRight size={19} />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold uppercase tracking-wider text-slate-400">
          {weekdayLabels.map((label) => (
            <div key={label} className="py-1">
              {label}
            </div>
          ))}
        </div>

        <div className="mt-1 grid grid-cols-7 gap-1">
          {monthDates.map((date) => {
            const dateKey = toDateKey(date);
            const dayEvents = eventsByDate.get(dateKey) || [];
            const isCurrentMonth = date.getMonth() === currentMonth;
            const isToday = dateKey === todayKey;

            return (
              <div
                key={dateKey}
                className={`min-h-24 rounded-xl border p-1.5 transition-colors ${
                  isToday
                    ? "border-emerald-400 bg-emerald-50 dark:border-emerald-600 dark:bg-emerald-950/30"
                    : "border-slate-100 bg-slate-50 dark:border-slate-700 dark:bg-slate-900/40"
                } ${isCurrentMonth ? "" : "opacity-45"}`}
              >
                <div className="mb-1 flex items-center justify-between">
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                      isToday
                        ? "bg-emerald-600 text-white"
                        : "text-slate-500 dark:text-slate-300"
                    }`}
                  >
                    {date.getDate()}
                  </span>
                  {dayEvents.length > 2 && (
                    <span className="text-[10px] font-bold text-slate-400">
                      +{dayEvents.length - 2}
                    </span>
                  )}
                </div>
                <div className="space-y-1">
                  {dayEvents.slice(0, 2).map((event) => (
                    <EventPill
                      key={`${event.plant.id}-${event.dateKey}`}
                      event={event}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-slate-400">
          {t("dic.calendarUpcoming")}
        </h3>
        {upcomingPlants.length === 0 ? (
          <p className="rounded-xl bg-slate-50 p-4 text-center text-sm text-slate-500 dark:bg-slate-900/50 dark:text-slate-300">
            {t("dic.calendarEmpty")}
          </p>
        ) : (
          <div className="space-y-3">
            {upcomingPlants.map(({ date, dateKey, plant }) => (
              <div
                key={plant.id}
                className="flex items-center gap-3 rounded-xl bg-slate-50 p-3 dark:bg-slate-900/50"
              >
                <PlantAvatar plant={plant} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold text-slate-900 dark:text-white">
                    {plant.name}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {dateKey === todayKey
                      ? t("dic.calendarDueToday")
                      : formatDate(date, i18n.language, {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                  </p>
                </div>
                <Droplets className="shrink-0 text-emerald-500" size={19} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
