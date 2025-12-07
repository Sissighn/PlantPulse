import { useMemo } from "react";

const seasonMultipliers = {
  winter: 1.5,
  spring: 1,
  summer: 0.75,
  autumn: 1.25,
};

/**
 * A custom hook to check for plants that need watering.
 * @param {Array} plants - The list of all plants.
 * @param {string} season - The current season.
 * @returns {Array} A list of notification objects for plants that need water.
 */
export const useNotifications = (plants, season) => {
  const notifications = useMemo(() => {
    if (!plants || plants.length === 0) {
      return [];
    }

    return plants
      .map((plant) => {
        const { id, name, lastWatered, baseInterval } = plant;
        const daysSinceWatered = lastWatered
          ? Math.floor(
              (new Date() - new Date(lastWatered)) / (1000 * 60 * 60 * 24)
            )
          : baseInterval;
        const adjustedInterval = Math.round(
          baseInterval * seasonMultipliers[season]
        );

        if (daysSinceWatered >= adjustedInterval) {
          const daysOver = daysSinceWatered - adjustedInterval;
          const message =
            daysOver > 0
              ? `${name} ist seit ${daysOver} Tag${
                  daysOver > 1 ? "en" : ""
                } überfällig.`
              : `${name} hat Durst und sollte heute gegossen werden.`;
          return { id: `notif-${id}`, plantId: id, message };
        }
        return null;
      })
      .filter(Boolean); // Remove null entries
  }, [plants, season]);

  return notifications;
};
