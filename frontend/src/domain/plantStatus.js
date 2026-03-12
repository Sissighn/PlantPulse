import { getAdjustedInterval } from "./wateringSchedule";

const DAY_MS = 1000 * 60 * 60 * 24;

function startOfDay(date) {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
}

function toValidDate(value) {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function calculatePlantStatus(plant, season) {
  const interval = getAdjustedInterval(plant?.baseInterval, season);
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
