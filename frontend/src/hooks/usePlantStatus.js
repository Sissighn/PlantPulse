import { useMemo } from "react";
import { calculatePlantStatus } from "../domain/plantStatus";

export function usePlantStatus(plant, season) {
  return useMemo(() => {
    return calculatePlantStatus(plant, season);
  }, [plant, season]);
}
