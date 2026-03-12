// filepath: /Users/setayesh/Desktop/projects/plantpulse/frontend/src/domain/wateringSchedule.js
export const SEASON_MULTIPLIERS = {
  spring: 1.0,
  summer: 0.8,
  autumn: 1.2,
  winter: 2.0,
};

export function getAdjustedInterval(baseInterval, season) {
  const safeBase =
    Number.isFinite(baseInterval) && baseInterval > 0 ? baseInterval : 7;
  const multiplier = SEASON_MULTIPLIERS[season] || 1;

  return Math.max(1, Math.round(safeBase * multiplier));
}
