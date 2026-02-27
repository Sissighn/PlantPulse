import { useState } from "react";
import { BACKEND_URL } from "../constants";

export function usePlantTips(plantName, season, t) {
  const [tips, setTips] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchTips = async () => {
    if (tips) {
      setTips(null);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `${BACKEND_URL}/tips?name=${plantName}&season=${season}`,
      );
      const data = await res.json();
      setTips(data.tips);
    } catch {
      setTips(t("dic.couldNotLoadTips"));
    } finally {
      setLoading(false);
    }
  };

  return { tips, loading, fetchTips };
}
