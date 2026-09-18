import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserSecret, faMask} from "@fortawesome/free-solid-svg-icons";

  import nahIdeaAuth from "../img/nahIdeaAuth.png";

const STORAGE_TOKENS = "AnnoymousUsed";
const STORAGE_RESET = "AnnoymousResetDate";

import React from "react";
import { useState, useEffect, useRef, useMemo } from 'react';
// Compute next local midnight
 function getNextLocalMidnight() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0);
}

// Read tokens from localStorage
 function readTokens() {
  const raw = localStorage.getItem(STORAGE_TOKENS);
  return raw == null ? 3 : Number(raw);
}

// Save tokens
 function saveTokens(n) {
  localStorage.setItem(STORAGE_TOKENS, String(n));
}

// Read reset date
 function readResetDate() {
  const raw = localStorage.getItem(STORAGE_RESET);
  return raw ? new Date(raw) : null;
}

// Save reset date
 function saveResetDate(date) {
  localStorage.setItem(STORAGE_RESET, date.toISOString());
}

// Clear reset
 function clearResetDate() {
  localStorage.removeItem(STORAGE_RESET);
}

// Format countdown seconds to HH:MM:SS
 function formatSeconds(s) {
  const hrs = Math.floor(s / 3600);
  const mins = Math.floor((s % 3600) / 60);
  const secs = s % 60;
  return `${String(hrs).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
};

export  function useAnonymousTokens() {
  const [tokens, setTokens] = useState(3);
  const [countdown, setCountdown] = useState(0);
  const intervalRef = useRef(null);

  const startCountdown = (targetDate) => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    const tick = () => {
      const diff = targetDate.getTime() - Date.now();

      if (diff <= 0) {
        setTokens(3);
        saveTokens(3);
        clearResetDate();
        setCountdown(0);
        clearInterval(intervalRef.current);
        return;
      }

      setCountdown(Math.ceil(diff / 1000));
    };

    tick();
    intervalRef.current = setInterval(tick, 1000);
  };

  useEffect(() => {
    const stored = readTokens();
    setTokens(stored);

    const resetDate = readResetDate();
    if (resetDate) {
      if (resetDate.getTime() > Date.now()) {
        startCountdown(resetDate);
      } else {
        setTokens(3);
        saveTokens(3);
        clearResetDate();
      }
    }

    return () => clearInterval(intervalRef.current);
  }, []);

  const consume = () => {
    const next = Math.max(0, tokens - 1);
    setTokens(next);
    saveTokens(next);

    if (next === 0) {
      const midnight = getNextLocalMidnight();
      saveResetDate(midnight);
      startCountdown(midnight);
    }
  };

  return { tokens, countdown, consume };
}

  
export function AnonymousName({
  enabled,
  realName
}){
const generateNum = Array.from({length: 6}, ()=> Math.floor(Math.random() *10)).join("");
  const nameGenerate = `An${generateNum}nymous`;
 const name = enabled ? nameGenerate :  realName;
  return (
    <span className="anonymous-name">
      {name}
    </span>
  );

};

export function AnonymousProfile({ enabled, realPf }) {
  const colors = [
    "#8B5CF6", // violet
    "#EC4899", // pink
    "#38BDF8", // sky
    "#818CF8", // indigo
    "#EAB308", // yellow
    "#4ADE80", // green
    "#F87171", // red
    "#FB923C", // orange
    "#22D3EE", // cyan
    "#2DD4BF", // teal
    "#F472B6", // rose
    "#A78BFA", // purple
    "#FCA5A5", // soft red
    "#FACC15", // amber
    "#60A5FA", // blue
    "#34D399", // emerald
    "#FB7185", // pink-red
    "#6366F1", // indigo
    "#A855F7", // medium purple
    "#3B82F6", // medium blue
  ];

  const randomIndex = Math.floor(Math.random() * colors.length);
  const colorName = colors[randomIndex];

  const pf = enabled
    ? (
        <img src={nahIdeaAuth} alt="anon icon" style={{width: "35px"}}  className="user-profile" style={{
          backgroundColor: colorName,
        }}/>
    )
    : <img src={realPf} className="user-profile" alt="profile" />;

  return pf;
}

export function AnonymousToggle({
  enabled,
  setEnabled,
  tokens,
  countdown
}) {
   const [visible, setVisible] = useState(enabled);

  useEffect(() => {
    if (enabled) {
      setVisible(true); // show immediately
    } else {
      
      const timer = setTimeout(() => setVisible(false), 1000); // match transition durations
      return () => clearTimeout(timer);
    }
  }, [enabled]);

  return (
  
 
    <div className="anonymous-card">
    
      <FontAwesomeIcon
        icon={faUserSecret}
        id="anonymous-icon"
        className={enabled ? "show" : "hide"}
      />
 
  <div className="anonymous-header">
    <div className="anonymous-title">
       Anonymous Mode
    </div>

    <div className={`status-badge ${enabled ? "on" : "off"}`}>
      {enabled ? "ON" : "OFF"}
    </div>
  </div>

  <p className="token-text">
    {tokens > 0 ? (
      <>
        You have <span>{tokens}</span> token{tokens !== 1 && "s"} remaining
      </>
    ) : (
      AnonymousTokensCoolDown({tokens, countdown})
    )}
  </p>

  {tokens > 0 && (
    <div
      className={`toggle-container ${enabled ? "active" : ""}`}
      onClick={() => setEnabled(!enabled)}
    >
      <div className="toggle-track">
        <div className="toggle-thumb" />
      </div>
    </div>
  )}
</div>
  
  );
};

export function AnonymousTokensCoolDown({tokens, countdown}){
  return(
    <>
       {tokens === 0 && (<div>
        <div>Time left: {formatSeconds(countdown)}</div>
      </div>)}
    </>
  );
}

export function AnonymousNameC({ enabled, realName, anonName }) {
  const generateNum = Array.from({ length: 6 }, () => Math.floor(Math.random() * 10)).join("");
  const fallbackName = `An${generateNum}nymous`;

  const name = enabled ? (anonName ?? fallbackName) : realName;

  return <span className="anonymous-name">{name}</span>;
}

export function AnonymousProfileC({ enabled, realPf, anonBg }) {
  const colors = [
    "#8B5CF6", "#EC4899", "#38BDF8", "#818CF8", "#EAB308",
    "#4ADE80", "#F87171", "#FB923C", "#22D3EE", "#2DD4BF",
    "#F472B6", "#A78BFA", "#FCA5A5", "#FACC15", "#60A5FA",
    "#34D399", "#FB7185", "#6366F1", "#A855F7", "#3B82F6",
  ];

  const randomIndex = Math.floor(Math.random() * colors.length);
  const fallbackColor = colors[randomIndex];
  const colorName = anonBg ?? fallbackColor;

  const pf = enabled ? (
    <img
      src={nahIdeaAuth}
      alt="anon icon"
      className="user-profile"
      style={{ width: "35px", backgroundColor: colorName }}
    />
  ) : (
    <img src={realPf} className="user-profile" alt="profile" />
  );

  return pf;
}