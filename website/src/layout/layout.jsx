// import React
import React,{ useState, useEffect } from 'react';
import {Outlet} from 'react-router-dom';
import { Toaster } from "react-hot-toast";

// Socket
import { connectSocket, disconnectSocket } from "../services/socket";

// API
import api from '../api/axiosInstance';

// AuthContext
import { useAuth } from '../context/authContext';

import Aside from './aside';
import Header from './header'; 
export default  function Layout () {

  const { user, token, loading, logout } = useAuth();
  const [onlineUsers, setOnlineUsers] = useState([]);

  // SOCKET
  useEffect(() => {

    if (!token || !user) return;

    const expiry = Number(
      localStorage.getItem("tokenExpiry")
    );

    if (!expiry || Date.now() > expiry) {
      return;
    }

    const socket = connectSocket({
      token,
      userId: user.id,
      username: user.username,
      avatar_url: user.avatar_url
    });

    socket.on("online-users", (users) => {
      setOnlineUsers(users);
    });

    return () => {

      socket.off("online-users");

      disconnectSocket();
    };

  }, [token, user]);

  useEffect(() => {
    if (!token) return;
    const handleTrackLogin = async () => {
      try {
        await api.post('/api/record-login');
      } catch (err) {
        console.error(err);
      }
    };
    handleTrackLogin();
  }, [token]);

  // ASIDE
  const [showMaxAside, setMaxAside] = useState(() => {
    return localStorage.getItem("maxAside") === "true";
  });

  useEffect(() => {
    localStorage.setItem(
      "maxAside",
      showMaxAside
    );
  }, [showMaxAside]);

  const toggleAside = () => {
    setMaxAside(prev => !prev);
  };


  // THEME
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("darkMode") === "true";
  });

  useEffect(() => {

    document.body.classList.toggle(
      "dark-theme",
      darkMode
    );

    localStorage.setItem(
      "darkMode",
      darkMode
    );

  }, [darkMode]);

  const toggleTheme = () => {
    setDarkMode(prev => !prev);
  };

  useEffect(() => {
    document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // ONLINE
  const isOnline = user?.id ? onlineUsers.includes(String(user.id)) : false;
  
  return (
    <>
      <Header onToggleAside={toggleAside} onToggleTheme={toggleTheme} currentTheme={darkMode} />
      <Toaster position="top-right" 
               toastOptions={{
                  style: {
                    background: darkMode ? "#1f1f1f" : "#ffffff",
                    color: darkMode ? "#ffffff" : "#1f1f1f",
                  },
               }}
      />
      {/* <main aria-hidden={isBlocked} style={{ position: "relative",   pointerEvents: isBlocked ? "none" : "auto",
                    filter: isBlocked ? "blur(4px)" : "none",
                    userSelect: isBlocked ? "none" : "auto",}}> */}
        <main >
        <Aside append={showMaxAside} />
        <section>
          <Outlet
            context={{
              user,
              isOnline,
              onlineUsers
            }}
          />
        </section>
      </main>
      {/* {!loading && (!token || !user) && <AuthRequiredModal />}
      {!isBlockedByAuth && isBlockedByBan && (
        <BannedModal reason={banInfo.reason} bannedAt={banInfo.banned_at} />
      )} */}
    </>
  );

};