import { getAdjustedInterval } from "./wateringSchedule";
import type { PlantLike, Season } from "./wateringProfiles";

const DAY_MS = 1000 * 60 * 60 * 24;

export type CalendarPlant = PlantLike & {
  id: string | number;
  name: string;
  imageUrl?: string | null;
};

export type WateringEvent = {
  date: Date;
  dateKey: string;
  daysFromToday: number;
  interval: number;
  isOverdue: boolean;
  isToday: boolean;
  plant: CalendarPlant;
};

export type WeekStartsOn = 0 | 1;

function startOfDay(date: Date) {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return startOfDay(next);
}

function daysBetween(from: Date, to: Date) {
  return Math.round(
    (startOfDay(to).getTime() - startOfDay(from).getTime()) / DAY_MS,
  );
}

function toValidDate(value: string | null | undefined) {
  if (!value) return null;

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getMonthGridDates(
  monthDate: Date,
  weekStartsOn: WeekStartsOn = 1,
) {
  const firstOfMonth = startOfDay(
    new Date(monthDate.getFullYear(), monthDate.getMonth(), 1),
  );
  const weekdayOffset = (firstOfMonth.getDay() - weekStartsOn + 7) % 7;
  const gridStart = addDays(firstOfMonth, -weekdayOffset);

  return Array.from({ length: 42 }, (_, index) => addDays(gridStart, index));
}

export function getNextWateringDate(
  plant: CalendarPlant,
  season: Season,
  fromDate = new Date(),
) {
  const interval = getAdjustedInterval(plant.baseInterval, season, plant);
  const today = startOfDay(fromDate);
  const lastWatered = toValidDate(plant.lastWatered);
  let next = lastWatered ? addDays(startOfDay(lastWatered), interval) : today;

  while (next < today) {
    next = addDays(next, interval);
  }

  return next;
}

export function buildWateringEventsForMonth(
  plants: CalendarPlant[],
  season: Season,
  monthDate: Date,
  todayDate = new Date(),
) {
  const monthStart = startOfDay(
    new Date(monthDate.getFullYear(), monthDate.getMonth(), 1),
  );
  const monthEnd = startOfDay(
    new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0),
  );
  const today = startOfDay(todayDate);
  const events: WateringEvent[] = [];

  for (const plant of plants) {
    const interval = getAdjustedInterval(plant.baseInterval, season, plant);
    const lastWatered = toValidDate(plant.lastWatered);
    let dueDate = lastWatered ? addDays(startOfDay(lastWatered), interval) : today;

    while (dueDate < monthStart) {
      dueDate = addDays(dueDate, interval);
    }

    while (dueDate <= monthEnd) {
      const daysFromToday = daysBetween(today, dueDate);
      events.push({
        date: dueDate,
        dateKey: toDateKey(dueDate),
        daysFromToday,
        interval,
        isOverdue: daysFromToday < 0,
        isToday: daysFromToday === 0,
        plant,
      });
      dueDate = addDays(dueDate, interval);
    }
  }

  return events.sort((a, b) => {
    const dateDiff = a.date.getTime() - b.date.getTime();
    return dateDiff || a.plant.name.localeCompare(b.plant.name);
  });
}
