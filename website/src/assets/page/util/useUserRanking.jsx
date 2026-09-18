import { useEffect } from "react";
import { useRankingContext } from "../../context/RankContext";

export const useUserRanking = (userId) => {
  const { cache, fetchRankingFor } = useRankingContext();

  useEffect(() => {
    if (userId) fetchRankingFor(userId);
  }, [userId, fetchRankingFor]);

  const id = userId?.toString();
  return cache[id] || { rank: null, score: 0, badgeTier: null, loadings: !!userId, error: null };
};