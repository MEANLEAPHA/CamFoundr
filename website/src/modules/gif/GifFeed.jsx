import React, { useState, useEffect } from 'react';
import { Input } from "antd";
import { HeartOutlined, HeartFilled } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { Button, Dropdown} from 'antd';
import api from "../../assets/api/axiosInstance";
import "./GifFeed.css";
import {Bookmark, CloudUpload, Coffee, FaceSlightlySmiling, Sticker } from "lucide-react";
import {gif_category} from "../../assets/data/post_type_data";
import { AdBanner } from '../../assets/components/ad';

export default function GifFeed() {
  const navigate = useNavigate();

  const [gifs, setGifs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState(null);
  const [favoriteGifIds, setFavoriteGifIds] = useState(() => new Set());

  useEffect(() => {
    fetchGifs(1);
    fetchFavoriteGifIds();
    setPage(1);
  }, []);

  const fetchFavoriteGifIds = async () => {
    const favoriteIds = new Set();
    let favoritePage = 1;

    try {
      while (true) {
        const res = await api.get(`/api/gifs/favorites/feed?page=${favoritePage}`);
        const favorites = res.data.data || [];

        favorites.forEach((favorite) => favoriteIds.add(favorite.gif_id));

        if (favorites.length < 25) break;
        favoritePage += 1;
      }

      setFavoriteGifIds(favoriteIds);
    } catch (err) {
      console.error(err);
    }
  };

  const handleFavoriteChange = (gifId, isFavorite) => {
    setFavoriteGifIds((previousIds) => {
      const nextIds = new Set(previousIds);
      if (isFavorite) {
        nextIds.add(gifId);
      } else {
        nextIds.delete(gifId);
      }
      return nextIds;
    });
  };

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 200 &&
        !loading &&
        !fetching &&
        hasMore
      ) {
        setPage((prev) => {
          const next = prev + 1;
          if (query) {
            searchGif(query, next);
          } else if (activeCategory) {
            searchCategory(activeCategory, next);
          } else {
            fetchGifs(next);
          }

          return next;
        });
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loading, fetching, hasMore, query, activeCategory]);

  const fetchGifs = async (nextPage = 1) => {
    if (fetching) return;
    try {
      setFetching(true);
      setLoading(true);
      const res = await api.get(
        `/api/gifs/getGifs?page=${nextPage}`
      );

      const newPosts = res.data.data;
      if (!Array.isArray(newPosts)) throw new Error("Bad response");

      if (newPosts.length < 25) setHasMore(false);

      if (nextPage === 1) {
        setGifs(newPosts);
      } else {
        setGifs((prev) => [...prev, ...newPosts]);
      }
    } catch (err) {
      setError("Failed to load post");
      setGifs([]);
    } finally {
      setLoading(false);
      setFetching(false);
    }
  };

  const searchGif = async (value, pageNum = 1) => {
    if (pageNum === 1) setQuery(value);

    if (!value) {
      setPage(1);
      return fetchGifs(1);
    }

    setLoading(true);
    try {
      const res = await api.get(
        `/api/gifs/search?name=${value}&page=${pageNum}`
      );
      const newPosts = res.data.data || [];

      if (pageNum === 1) {
        setGifs(newPosts);
      } else {
        setGifs((prev) => [...prev, ...newPosts]);
      }

      setHasMore(newPosts.length === 25);
      setPage(pageNum);
    } catch (err) {
      console.error(err);
      setGifs([]);
    } finally {
      setLoading(false);
    }
  };

  const searchCategory = async (category, pageNum = 1) => {
    setQuery("");
    setActiveCategory(category);
    setLoading(true);
    try {


      const res = await api.get(
        `/api/gifs/category?category=${category}&page=${pageNum}`
      );
      const newPosts = res.data.data || [];

      if (pageNum === 1) {
        setGifs(newPosts);
      } else {
        setGifs((prev) => [...prev, ...newPosts]);
      }

      setHasMore(newPosts.length === 25);
      setPage(pageNum);
    } catch (err) {
      console.error(err);
      setGifs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setQuery("");
    setActiveCategory(null);
    setPage(1);
    fetchGifs(1);
  };

  const items = gif_category.map((cat, idx) => ({
    key: String(idx + 1),
    label: cat.label,
    onClick: () => searchCategory(cat.value, 1),
  }));

  return (
    <div className="gif-feed-container">

      <AdBanner />

      <div className="gif-header">
        <div className="gif-header-text">
          <Sticker /> <span>Gif Reaction</span>
        </div>
        <div className="gif-header-buttons"> 
          <div style={{display:'flex',gap: '10px'}}>

            <div className="gif-dropdown">
              <Dropdown menu={{ items }} placement="bottom" getPopupContainer={(trigger) => trigger.parentNode}>
                <Button className="btn-upload-gif">
                <FaceSlightlySmiling className='lucide-gif'/>
                  Reaction
                </Button>
              </Dropdown>
            </div>
          
            <button onClick={()=>{navigate("/favorite/gif")}} type="button" className="btn-upload-gif">
              <Bookmark className='lucide-gif'/>Favourites
            </button>
          
          </div>
          <button
            onClick={() => navigate("/upload/gif")}
            type="button"
            className="btn-upload-gif"
          >
            <CloudUpload className='lucide-gif'/>
            Upload GIF
          </button>
        </div>
      </div>

      <Input.Search
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onSearch={(val) => searchGif(val, 1)} 
        placeholder="Search GIFs on Camfoundr..."
        allowClear
        onClear={handleClear}
        className="gif-searchs"
      />

      {!loading && gifs.length === 0 && (
          <div className='empty-gif'>
              <Coffee />
              <span>Not Found</span>
          </div>
        )
      }

      <div className="masonry">
        {gifs.map((gif) => (
          <GifCard
            key={gif.id}
            gif={gif}
            isFavorite={favoriteGifIds.has(gif.id)}
            onFavoriteChange={handleFavoriteChange}
          />
        ))}
      </div>

    </div>
  );
}

function GifCard({ gif, isFavorite, onFavoriteChange }) {
  const [updatingFavorite, setUpdatingFavorite] = useState(false);

  const toggleFavorite = async () => {
    if (updatingFavorite) return;

    setUpdatingFavorite(true);
    try {
      const endpoint = isFavorite
        ? "/api/gifs/favorites/remove"
        : "/api/gifs/favorites/add";

      await api.post(endpoint, { gif_id: gif.id }, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      onFavoriteChange(gif.id, !isFavorite);
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingFavorite(false);
    }
  };



  
  return (
    <div className="gif-card">
      <img src={gif.gif_url} alt={gif.gif_label} />
      <div className="gif-overlay">
        <span className="gif-name">{gif.gif_label}</span>
        <span className="gif-fav" onClick={toggleFavorite}>
          {isFavorite ? <HeartFilled style={{color: "rgb(255, 0, 0)"}}/> : <HeartOutlined />}
        </span>
      </div>
    </div>
  );
}




