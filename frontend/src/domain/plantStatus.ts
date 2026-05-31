import { getAdjustedInterval } from "./wateringSchedule";
import type { PlantLike, Season } from "./wateringProfiles";

const DAY_MS = 1000 * 60 * 60 * 24;

export type PlantStatus = {
  days: number;
  overdue: boolean;
  today: boolean;
  interval: number;
  isThirsty: boolean;
};

function startOfDay(date: Date) {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
}

function toValidDate(value: string | null | undefined) {
  if (!value) return null;

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function calculatePlantStatus(
  plant: PlantLike | null | undefined,
  season: Season,
): PlantStatus {
  const interval = getAdjustedInterval(plant?.baseInterval, season, plant);
  const today = startOfDay(new Date());
  const last = toValidDate(plant?.lastWatered);

  if (!last) {
    return {
      days: 0,
      overdue: false,
      today: true,
      interval,
      isThirsty: true,
    };
  }

  const next = startOfDay(last);
  next.setDate(next.getDate() + interval);

  const diff = Math.round((next.getTime() - today.getTime()) / DAY_MS);

  return {
    days: diff,
    overdue: diff < 0,
    today: diff === 0,
    interval,
    isThirsty: diff <= 0,
  };
}
