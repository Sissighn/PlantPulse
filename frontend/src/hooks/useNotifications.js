import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { calculatePlantStatus } from "../domain/plantStatus";

/**
 * A custom hook to check for plants that need watering.
 * @param {Array} plants - The list of all plants.
 * @param {string} season - The current season.
 * @returns {Array} A list of notification objects for plants that need water.
 */
export const useNotifications = (plants, season) => {
  const { t } = useTranslation();

  const notifications = useMemo(() => {
    if (!plants || plants.length === 0) {
      return [];
    }

    return plants
      .map((plant) => {
        const { id, name } = plant;
        const status = calculatePlantStatus(plant, season);

        if (status.isThirsty) {
          const daysOver = Math.abs(status.days);
          const message = status.overdue
            ? t("dic.notificationOverdue", { name, count: daysOver })
            : t("dic.notificationToday", { name });

          return { id: `notif-${id}`, plantId: id, message };
        }

        return null;
      })
      .filter(Boolean); // Remove null entries
  }, [plants, season, t]);

  return notifications;
};
