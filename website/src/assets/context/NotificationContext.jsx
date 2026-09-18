import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import api from "../api/axiosInstance";
import { useAuth } from "./AuthContext";

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const { token, user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const intervalRef = useRef(null);

  const refreshUnreadCount = useCallback(async () => {
    try {
      const res = await api.get("/api/notifications/unread-count");
      setUnreadCount(res.data.unreadCount);
    } catch (err) {
      console.error("Failed to fetch unread count:", err);
    }
  }, []);

  useEffect(() => {
    // Not logged in — don't fetch, don't poll, and reset to 0
    if (!token || !user) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setUnreadCount(0);
      return;
    }

    refreshUnreadCount();
    intervalRef.current = setInterval(refreshUnreadCount, 180000);

    const handleVisibility = () => {
      if (!document.hidden) refreshUnreadCount();
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      clearInterval(intervalRef.current);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [token, user?.id, refreshUnreadCount]); // re-runs on login/logout

  return (
    <NotificationContext.Provider value={{ unreadCount, setUnreadCount, refreshUnreadCount }}>
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotifications = () => useContext(NotificationContext);