import { useMemo } from "react";
import {
  type PlantStatus,
  calculatePlantStatus,
} from "../domain/plantStatus";
import type { PlantLike, Season } from "../domain/wateringProfiles";

export function usePlantStatus(
  plant: PlantLike | null | undefined,
  season: Season,
): PlantStatus {
  return useMemo(() => {
    return calculatePlantStatus(plant, season);
  }, [plant, season]);
}
