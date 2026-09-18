import { useState, useEffect } from "react";
import api from "../api/axiosInstance";

export function useBanStatus(token) {
  const [banInfo, setBanInfo] = useState({ checked: false, banned: false });

  useEffect(() => {
    if (!token) return;
    const checkBan = async () => {
      try {
        const res = await api.get("/api/ban-status");
        setBanInfo({ checked: true, ...res.data });
      } catch (err) {
        // fail open — don't block the user if the check itself errors out
        setBanInfo({ checked: true, banned: false });
      }
    };
    checkBan();
  }, [token]);

  return banInfo;
}