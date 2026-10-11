import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMagnifyingGlass,
  faClockRotateLeft,
  faTimesCircle,
} from "@fortawesome/free-solid-svg-icons";
import { motion, AnimatePresence } from "framer-motion";
import api from "../api/axiosInstance";
import { faTrashCan } from "@fortawesome/free-regular-svg-icons";

let debounceTimer = null;


const highlightMatch = (text, query) => {
  if (!query) return text;

  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const index = lowerText.indexOf(lowerQuery);

  if (index === -1) return text;

  const before = text.slice(0, index);
  const match = text.slice(index, index + query.length);
  const after = text.slice(index + query.length);

  return (
    <>
      {before}
      <span className="search-highlight-match">{match}</span>
      {after}
    </>
  );
};


export function SearchBar (){
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [historyData, setHistoryData] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef(null);
   const wrapperRef = useRef(null);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("searchHistory")) || [];
    setHistoryData(data);
  }, []);

 
    useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(async () => {
      try {
        const res = await api.get(`/api/search/autocomplete`, {
          params: { q: query },
        });
        setSuggestions(res.data || []);
      } catch (err) {
        console.error("autocomplete error:", err);
        setSuggestions([]);
      }
    }, 250);

    return () => clearTimeout(debounceTimer);
  }, [query]);

  const saveToHistory = (term) => {
    const trimmed = term.trim();
    if (!trimmed) return;

    let history = JSON.parse(localStorage.getItem("searchHistory")) || [];
    history = history.filter((item) => item !== trimmed);
    history = [trimmed, ...history].slice(0, 5);
    localStorage.setItem("searchHistory", JSON.stringify(history));
    setHistoryData(history);
  };

  const runSearch = (term) => {
    const trimmed = term.trim();
    if (!trimmed) return;

    saveToHistory(trimmed);
    setShowDropdown(false);
    inputRef.current?.blur();
    navigate(`/searchform?q=${encodeURIComponent(trimmed)}`);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      runSearch(query);
    }
  };

  const handleDeleteHistory = (term) => {
    const updated = historyData.filter((item) => item !== term);
    localStorage.setItem("searchHistory", JSON.stringify(updated));
    setHistoryData(updated);
  };

  const handleClearAllHistory = () => {
    localStorage.setItem("searchHistory", JSON.stringify([]));
    setHistoryData([]);
  };

  return (
    <div className="header-middle header-children">
      <div className="search-box" ref={wrapperRef}>
        <input
          ref={inputRef}
          type="text"
          placeholder="Search CamFoundr..."
          value={query}
          id="search-input"
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setShowDropdown(true)}
          onKeyDown={handleKeyDown}
          className="search-bar-input"
        />
        {query && (
            <button
                type="button"
                className="btn-clear-value"
                onClick={() => {
                setQuery("");
                setSuggestions([]);
              }}
                >
                <FontAwesomeIcon icon={faTimesCircle} />
            </button>
          
        )}
    
      </div>
           {showDropdown && historyData.length !==0 && (
             <div className="results-search" ref={wrapperRef}>
                 <div className="search-bar-dropdown dev-res">
          {suggestions.length > 0 && (
            <ul className="history-ul">
              <AnimatePresence mode="popLayout">
                {suggestions.slice(0, 6).map((s) => (
                  <motion.li
                    key={s}
                    layout
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 8, height: 0 }}
                    transition={{ duration: 0.18, ease: "easeOut" }}
                    className="history-card"
                    onClick={() => runSearch(s)}
                  >
                    <div className="history-card-info">
                      <FontAwesomeIcon
                        icon={faMagnifyingGlass}
                        className="search-icon-query"
                        style={{ opacity: 0.7 }}
                      />
                      <p className="query-title">{highlightMatch(s, query)}</p>
                    </div>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          )}

          {/* User's own search history */}
          {historyData.length > 0 && (
            <div className="recent-search dev-res">
              <div className="label-flex">
                <label>Searches History</label>
                <button onClick={handleClearAllHistory} style={{cursor:"pointer"}} type="button">Clear All</button>
              </div>
              <ul className="history-ul">
                {historyData.map((item, index) => (
                  <li key={index} className="history-card" onClick={() => runSearch(item)}>
                    <div className="history-card-info">
                      <FontAwesomeIcon
                        icon={faClockRotateLeft}
                        className="search-icon-query"
                        style={{ opacity: 0.7 }}
                      />
                      <p className="query-title">{highlightMatch(item, query)}</p>
                    </div>
                    <FontAwesomeIcon
                      icon={faTrashCan}
                      className="history-icon-trash"
                      onClick={(e) => {
                        handleDeleteHistory(item);
                        e.stopPropagation();
                      }}
                    />
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
            </div>
      )}
      <button className='search-button' onClick={() => runSearch(query)} >
        <FontAwesomeIcon icon={faMagnifyingGlass} className="search-icon" />
      </button>
    </div>
    
  );
};



export function SearchBars (){
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [historyData, setHistoryData] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef(null);
   const wrapperRef = useRef(null);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("searchHistory")) || [];
    setHistoryData(data);
  }, []);

 
    useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(async () => {
      try {
        const res = await api.get(`/api/search/autocomplete`, {
          params: { q: query },
        });
        setSuggestions(res.data || []);
      } catch (err) {
        console.error("autocomplete error:", err);
        setSuggestions([]);
      }
    }, 250);

    return () => clearTimeout(debounceTimer);
  }, [query]);

  const saveToHistory = (term) => {
    const trimmed = term.trim();
    if (!trimmed) return;

    let history = JSON.parse(localStorage.getItem("searchHistory")) || [];
    history = history.filter((item) => item !== trimmed);
    history = [trimmed, ...history].slice(0, 5);
    localStorage.setItem("searchHistory", JSON.stringify(history));
    setHistoryData(history);
  };

  const runSearch = (term) => {
    const trimmed = term.trim();
    if (!trimmed) return;

    saveToHistory(trimmed);
    setShowDropdown(false);
    inputRef.current?.blur();
    navigate(`/searchform?q=${encodeURIComponent(trimmed)}`);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      runSearch(query);
    }
  };

  const handleDeleteHistory = (term) => {
    const updated = historyData.filter((item) => item !== term);
    localStorage.setItem("searchHistory", JSON.stringify(updated));
    setHistoryData(updated);
  };

  const handleClearAllHistory = () => {
    localStorage.setItem("searchHistory", JSON.stringify([]));
    setHistoryData([]);
  };

  return (
    <div className="header-middles header-children">
      <div className="search-box" ref={wrapperRef}>
        <input
          ref={inputRef}
          type="text"
          placeholder="Search Nahidea..."
          value={query}
          id="search-input"
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setShowDropdown(true)}
          onKeyDown={handleKeyDown}
          className="search-bar-input"
        />
        {query && (
            <button
                type="button"
                className="btn-clear-value"
                onClick={() => {
              setQuery("");
              setSuggestions([]);
            }}
                >
                <FontAwesomeIcon icon={faTimesCircle} />
            </button>
          
        )}
         {showDropdown && (
             <div className="results-search">
                 <div className="search-bar-dropdown dev-res">
          {suggestions.length > 0 && (
            <ul className="history-ul">
              <AnimatePresence mode="popLayout">
                {suggestions.slice(0, 6).map((s) => (
                  <motion.li
                    key={s}
                    layout
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 8, height: 0 }}
                    transition={{ duration: 0.18, ease: "easeOut" }}
                    className="history-card"
                    onClick={() => runSearch(s)}
                  >
                    <div className="history-card-info">
                      <FontAwesomeIcon
                        icon={faMagnifyingGlass}
                        className="search-icon-query"
                        style={{ opacity: 0.7 }}
                      />
                      <p className="query-title">{highlightMatch(s, query)}</p>
                    </div>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          )}

          {/* User's own search history */}
          {historyData.length > 0 && (
            <div className="recent-search dev-res">
              <div className="label-flex">
                <label>Searches History</label>
                <button onClick={handleClearAllHistory} style={{cursor:"pointer"}} type="button">Clear All</button>
              </div>
              <ul className="history-ul">
                {historyData.map((item, index) => (
                  <li key={index} className="history-card" onClick={() => runSearch(item)}>
                    <div className="history-card-info">
                      <FontAwesomeIcon
                        icon={faClockRotateLeft}
                        className="search-icon-query"
                        style={{ opacity: 0.7 }}
                      />
                      <p className="query-title">{highlightMatch(item, query)}</p>
                    </div>
                    <FontAwesomeIcon
                      icon={faTrashCan}
                      className="history-icon-trash"
                      onClick={(e) => {
                        handleDeleteHistory(item);
                        e.stopPropagation();
                      }}
                    />
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
            </div>
      )}
      </div>
      <button className='search-button' onClick={() => runSearch(query)} >
        <FontAwesomeIcon icon={faMagnifyingGlass} className="search-icon" />
      </button>
    </div>
  );
};
