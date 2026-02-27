import { PLANT_TYPES, BASE_URL } from "../constants";
import PlantSelectView from "./PlantSelectView";

const PlantSelectContainer = ({ selectedId, onChange }) => {
  const selectedPlant =
    PLANT_TYPES.find((p) => p.id === selectedId) || PLANT_TYPES[0];

  return (
    <PlantSelectView
      plants={PLANT_TYPES}
      selectedPlant={selectedPlant}
      selectedId={selectedId}
      baseUrl={BASE_URL}
      onChange={onChange}
    />
  );
};

export default PlantSelectContainer;
