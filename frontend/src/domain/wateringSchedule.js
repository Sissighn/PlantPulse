import {
  DEFAULT_BASE_INTERVAL,
  PROFILE_TYPES,
  getPlantProfile,
} from "./wateringProfiles";

export function getAdjustedInterval(baseInterval, season, plant) {
  const safeBase =
    Number.isFinite(baseInterval) && baseInterval > 0
      ? baseInterval
      : DEFAULT_BASE_INTERVAL;
  const profile = getPlantProfile(plant);
  const profileType = profile?.profileType || "tropical";
  const multiplier = PROFILE_TYPES[profileType]?.[season] || 1;

  return Math.max(1, Math.round(safeBase * multiplier));
}
