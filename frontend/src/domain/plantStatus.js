export function calculatePlantStatus(plant, season) {
  const multipliers = { spring: 1.0, summer: 0.8, autumn: 1.2, winter: 2.0 };
  const multiplier = multipliers[season] || 1;
  const interval = Math.round(plant.baseInterval * multiplier);

  const last = new Date(plant.lastWatered);
  const next = new Date(last);
  next.setDate(last.getDate() + interval);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diff = Math.ceil(
    (new Date(next).setHours(0, 0, 0, 0) - today) / (1000 * 60 * 60 * 24),
  );

  return {
    days: diff,
    overdue: diff < 0,
    today: diff === 0,
    interval,
    isThirsty: diff <= 0,
  };
}
