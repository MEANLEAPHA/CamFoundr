import React, { useState, useEffect, useRef, memo } from 'react';
import { Empty } from "antd";
import api from "../../assets/api/axiosInstance";
import "./GifFeed.css";
import { HeartFilled, HeartOutlined, LeftOutlined } from "@ant-design/icons";
import { useNavigate } from 'react-router-dom';



export default function FavoritesFeed() {
  const [gifs, setGifs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    loadFavorites(1);
    setPage(1);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 200 &&
        !loading &&
        hasMore
      ) {
        setPage((prev) => {
          const next = prev + 1;
          loadFavorites(next);
          return next;
        });
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loading, hasMore]);

  const loadFavorites = async (nextPage = 1) => {
    setLoading(true);

    let stored = JSON.parse(localStorage.getItem("favorites_gif") || "[]");

    // ✅ LocalStorage first, only for page 1
    if (stored.length > 0 && nextPage === 1) {
      setGifs(stored);
      setHasMore(false); // localStorage doesn’t paginate
      setLoading(false);
      return;
    }

    // ✅ DB fallback with pagination
    try {
      const res= await api.get(`/api/gifs/favorites/feed?page=${nextPage}`);
      const newPosts = res.data.data || [];

      if (nextPage === 1) {
        setGifs(newPosts);
        // hydrate localStorage with DB results
        localStorage.setItem("favorites_gif", JSON.stringify(newPosts));
      } else {
        setGifs((prev) => [...prev, ...newPosts]);
        // append to localStorage
        const current = JSON.parse(localStorage.getItem("favorites_gif") || "[]");
        const updated = [...current, ...newPosts];
        localStorage.setItem("favorites_gif", JSON.stringify(updated));
      }

      setHasMore(newPosts.length === 25);
    } catch (err) {
      console.error(err);
      setGifs([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (gif) => {
    let stored = JSON.parse(localStorage.getItem("favorites_gif") || "[]");

    if (stored.some((f) => f.gif_id === gif.gif_id)) {
      // Unfavorite
      stored = stored.filter((f) => f.gif_id !== gif.gif_id);
      localStorage.setItem("favorites_gif", JSON.stringify(stored));
      await api.post(`/api/gifs/favorites/remove`, { gif_id: gif.gif_id }, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      setGifs((prev) => prev.filter((f) => f.gif_id !== gif.gif_id));
    } else {
      // Add back
      const newFav = {
        gif_id: gif.gif_id,
        gif_name: gif.gif_name,
        gif_url: gif.gif_url,
      };
      stored.push(newFav);
      localStorage.setItem("favorites_gif", JSON.stringify(stored));
      await api.post(
        `/api/gifs/favorites/add`,
        { gif_id: gif.gif_id },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
  
      setGifs((prev) => [newFav, ...prev]);
    }
  };
const navigate = useNavigate();
  return (
    <div className="gif-feed-container">
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button type='button' className='back-btn-about-post' onClick={() => navigate(-1)}><LeftOutlined /></button><h2>Your Favorites</h2>
      </div>
      {loading && <p>Loading...</p>}
      {!loading && gifs.length === 0 && <Empty description="No favorites yet" />}
      <div className="masonry">
        {gifs.map((gif) => (
          <div key={gif.gif_id} className="gif-card">
            <img src={gif.gif_url} alt={gif.gif_name} />
            <div className="gif-overlay">
              <span className="gif-name">{gif.gif_name}</span>
              <span className="gif-fav" onClick={() => toggleFavorite(gif)}>
                {JSON.parse(localStorage.getItem("favorites_gif") || "[]").some(
                  (f) => f.gif_id === gif.gif_id
                ) ? (
                  <HeartFilled style={{ color: "red" }} />
                ) : (
                  <HeartOutlined />
                )}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
