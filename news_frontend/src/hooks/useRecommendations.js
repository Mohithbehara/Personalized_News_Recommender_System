import { useEffect, useState } from "react";
import { getHybridRecommendation } from "../api/recommendationApi";
import { useUserStore } from "../state/userStore";

export function useRecommendations() {
  const user = useUserStore((state) => state.user);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRecommendations = async () => {
    const userId =
      user?.user_id || localStorage.getItem("user_id") || "guest_user";

    try {
      setLoading(true);
      setError(null);
      const res = await getHybridRecommendation(userId);
      setData(res.data);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      setError(
        err.response?.data?.detail ||
          "Unable to load recommendations right now."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    data,
    loading,
    error,
    refresh: fetchRecommendations,
  };
}


