import React, { createContext, useContext, useState, useCallback, useRef } from "react";
import api from "../api/axiosInstance";

const RankingContext = createContext(null);

export const RankingProvider = ({ children }) => {
  // cache: { [userId]: { rank, score, badgeTier, loading, error } }
  const [cache, setCache] = useState({});
  const inFlightRef = useRef(new Set()); // prevents duplicate simultaneous fetches for the same userId

  const fetchRankingFor = useCallback(async (userId) => {
    if (!userId) return;
    const id = userId.toString();

    // Already cached (and not stale) or already being fetched — skip
    if (cache[id] && !cache[id].loading) return;
    if (inFlightRef.current.has(id)) return;

    inFlightRef.current.add(id);
    setCache((prev) => ({
      ...prev,
      [id]: { rank: null, score: 0, badgeTier: null, loading: true, error: null },
    }));

    try {
      const { data } = await api.get(`/api/ranking/user/${id}`);
      setCache((prev) => ({
        ...prev,
        [id]: {
          rank: data.rank,
          score: data.score,
          badgeTier: data.badgeTier,
          loadings: false,
          error: null,
        },
      }));
    } catch (err) {
      setCache((prev) => ({
        ...prev,
        [id]: { rank: null, score: 0, badgeTier: null, loadings: false, error: "Failed to load" },
      }));
    } finally {
      inFlightRef.current.delete(id);
    }
  }, [cache]);

  return (
    <RankingContext.Provider value={{ cache, fetchRankingFor }}>
      {children}
    </RankingContext.Provider>
  );
};

export const useRankingContext = () => {
  const ctx = useContext(RankingContext);
  if (!ctx) throw new Error("useRankingContext must be used within a RankingProvider");
  return ctx;
};