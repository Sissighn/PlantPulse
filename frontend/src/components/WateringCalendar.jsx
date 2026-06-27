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
      className={`pp-event-pill ${
        event.isToday
          ? "pp-event-pill-today"
          : event.isOverdue
            ? "pp-event-pill-overdue"
            : "pp-event-pill-normal"
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
      <div className="pp-book-thumb h-10 w-10">
        <Leaf size={18} />
      </div>
    );
  }

  return (
    <img
      src={imageUrl}
      alt={plant.name}
      className="pp-book-thumb h-10 w-10 object-cover"
    />
  );
}

function MiniPlantAvatar({ plant }) {
  const imageUrl = getImageUrl(plant.imageUrl);

  if (!imageUrl) {
    return (
      <div className="pp-book-thumb h-8 w-8">
        <Leaf size={14} />
      </div>
    );
  }

  return (
    <img
      src={imageUrl}
      alt={plant.name}
      className="pp-book-thumb h-8 w-8 object-cover"
    />
  );
}

function DayDetailsPopover({ align, date, events, language, t }) {
  if (events.length === 0) return null;

  const alignClasses = {
    center: "left-1/2 -translate-x-1/2",
    left: "left-0",
    right: "right-0",
  }[align];

  return (
    <div
      className={`pp-popover ${alignClasses}`}
      role="tooltip"
    >
      <p className="pp-eyebrow">
        {formatDate(date, language, {
          day: "numeric",
          month: "long",
          year: "numeric",
        })}
      </p>
      <p className="mt-1 text-sm font-bold text-[var(--text)]">
        {t("dic.calendarWateringCount", { count: events.length })}
      </p>
      <div className="mt-3 space-y-2">
        {events.map((event) => (
          <div
            key={`${event.plant.id}-${event.dateKey}-detail`}
            className="pp-card-soft flex items-center gap-2 p-2"
          >
            <MiniPlantAvatar plant={event.plant} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-[var(--text)]">
                {event.plant.name}
              </p>
              <p className="text-xs text-[var(--text-muted)]">
                {event.isToday
                  ? t("dic.calendarDueToday")
                  : t("dic.calendarIntervalLabel", {
                      count: event.interval,
                    })}
              </p>
            </div>
            <Droplets
              className={
                event.isToday
                  ? "shrink-0 text-emerald-500"
                  : event.isOverdue
                    ? "shrink-0 text-rose-500"
                    : "shrink-0 text-[var(--text-muted)]"
              }
              size={16}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function WateringCalendar({ plants, season, weekStartsOn = 1 }) {
  const { i18n, t } = useTranslation();
  const [visibleMonth, setVisibleMonth] = useState(() => startOfMonth(new Date()));
  const todayKey = toDateKey(new Date());
  const monthDates = useMemo(
    () => getMonthGridDates(visibleMonth, weekStartsOn),
    [visibleMonth, weekStartsOn],
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
    const firstMonday = new Date(2026, 5, 1);
    const firstVisibleWeekday = new Date(firstMonday);
    firstVisibleWeekday.setDate(firstMonday.getDate() + (weekStartsOn === 0 ? -1 : 0));

    return Array.from({ length: 7 }, (_, index) =>
      formatDate(
        new Date(
          firstVisibleWeekday.getFullYear(),
          firstVisibleWeekday.getMonth(),
          firstVisibleWeekday.getDate() + index,
        ),
        i18n.language,
        {
        weekday: "short",
        },
      ),
    );
  }, [i18n.language, weekStartsOn]);

  const monthLabel = formatDate(visibleMonth, i18n.language, {
    month: "long",
    year: "numeric",
  });

  const currentMonth = visibleMonth.getMonth();

  return (
    <section className="pp-section">
      <div className="pp-section-header">
        <div>
          <p className="pp-eyebrow">
            {t("dic.calendarEyebrow")}
          </p>
          <h2 className="pp-heading">
            {t("dic.calendarTitle")}
          </h2>
          <p className="pp-muted mt-1 text-sm leading-relaxed">
            {t("dic.calendarSubtitle")}
          </p>
        </div>
        <div className="pp-section-icon">
          <CalendarDays size={22} />
        </div>
      </div>

      <div className="pp-card p-4">
        <div className="mb-4 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setVisibleMonth((month) => addMonths(month, -1))}
            className="pp-round-button"
            aria-label={t("dic.calendarPreviousMonth")}
            title={t("dic.calendarPreviousMonth")}
          >
            <ChevronLeft size={19} />
          </button>
          <div className="text-center">
            <h3 className="text-lg font-bold capitalize text-[var(--text)]">
              {monthLabel}
            </h3>
            <p className="text-xs font-semibold text-[var(--text-muted)]">
              {t(`dic.season.${season}`)}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setVisibleMonth((month) => addMonths(month, 1))}
            className="pp-round-button"
            aria-label={t("dic.calendarNextMonth")}
            title={t("dic.calendarNextMonth")}
          >
            <ChevronRight size={19} />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
          {weekdayLabels.map((label) => (
            <div key={label} className="py-1">
              {label}
            </div>
          ))}
        </div>

        <div className="mt-1 grid grid-cols-7 gap-1">
          {monthDates.map((date, index) => {
            const dateKey = toDateKey(date);
            const dayEvents = eventsByDate.get(dateKey) || [];
            const isCurrentMonth = date.getMonth() === currentMonth;
            const isToday = dateKey === todayKey;
            const column = index % 7;
            const popoverAlign =
              column <= 1 ? "left" : column >= 5 ? "right" : "center";

            return (
              <div
                key={dateKey}
                tabIndex={dayEvents.length > 0 ? 0 : undefined}
                aria-label={
                  dayEvents.length > 0
                    ? t("dic.calendarDayAriaLabel", {
                        count: dayEvents.length,
                        date: formatDate(date, i18n.language, {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        }),
                      })
                    : undefined
                }
                className={`pp-calendar-day group relative ${
                  isToday ? "pp-calendar-day-today" : ""
                } ${isCurrentMonth ? "" : "opacity-45"}`}
              >
                <div className="mb-1 flex items-center justify-between">
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                      isToday
                        ? "bg-[var(--green)] text-[#fff7e6]"
                        : "text-[var(--text-muted)]"
                    }`}
                  >
                    {date.getDate()}
                  </span>
                  {dayEvents.length > 2 && (
                    <span className="text-[10px] font-bold text-[var(--text-muted)]">
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
                <DayDetailsPopover
                  align={popoverAlign}
                  date={date}
                  events={dayEvents}
                  language={i18n.language}
                  t={t}
                />
              </div>
            );
          })}
        </div>
      </div>

      <div className="pp-card p-4">
        <h3 className="pp-eyebrow mb-3">
          {t("dic.calendarUpcoming")}
        </h3>
        {upcomingPlants.length === 0 ? (
          <p className="pp-card-soft p-4 text-center text-sm text-[var(--text-muted)]">
            {t("dic.calendarEmpty")}
          </p>
        ) : (
          <div className="space-y-3">
            {upcomingPlants.map(({ date, dateKey, plant }) => (
              <div
                key={plant.id}
                className="pp-card-soft flex items-center gap-3 p-3"
              >
                <PlantAvatar plant={plant} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold text-[var(--text)]">
                    {plant.name}
                  </p>
                  <p className="text-sm text-[var(--text-muted)]">
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
