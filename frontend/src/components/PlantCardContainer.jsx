import { usePlantStatus } from "../hooks/usePlantStatus";
import { usePlantTips } from "../hooks/usePlantTips";
import { useTranslation } from "react-i18next";
import PlantCardView from "./PlantCardView";

const PlantCardContainer = ({ plant, season, onWater, onDelete }) => {
  const { t } = useTranslation();
  const status = usePlantStatus(plant, season);
  const { tips, loading, fetchTips } = usePlantTips(plant.name, season, t);

  return (
    <PlantCardView
      plant={plant}
      status={status}
      tips={tips}
      loadingTips={loading}
      fetchTips={fetchTips}
      onWater={onWater}
      onDelete={onDelete}
      t={t}
    />
  );
};

export default PlantCardContainer;
