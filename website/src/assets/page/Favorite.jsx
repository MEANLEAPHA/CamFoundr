import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../style/page/History.css";
import { Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBookmark } from '@fortawesome/free-regular-svg-icons';
// img
import nahIdeaAuth from "../img/nahIdeaAuth.png";
import nahideaIcon from '../img/nahideaIcon.png';
import api from "../api/axiosInstance";
import { Bookmark, BookMarked, Coffee } from "lucide-react";

const Favorite = () => {
  const [searchHistory, setSearchHistory] = useState('');
  const [recentPosts, setRecentPosts] = useState([]);
  const [recentGifs, setRecentGifs] = useState([]);
  const [pagePosts, setPagePosts] = useState(1);
  const [pageGifs, setPageGifs] = useState(1);
  const [hasMorePosts, setHasMorePosts] = useState(true);
  const [hasMoreGifs, setHasMoreGifs] = useState(true);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(1);

  // Filter by search
  const filteredPosts = recentPosts.filter(u =>
    u.title?.toLowerCase().includes(searchHistory.toLowerCase())
  );
  const filteredGifs = recentGifs.filter(u =>
    u.gif_name?.toLowerCase().includes(searchHistory.toLowerCase())
  );

  // Fetch posts
  const fetchPosts = async (nextPage = 1) => {
  if (loading || !hasMorePosts) return;
  setLoading(true);
  try {
    const res = await api.get(`/api/posts/favorites?page=${nextPage}`);
    const json = res.data; 
    if (json.data) {
      setRecentPosts(prev => [...prev, ...json.data]);
      setPagePosts(nextPage);
      setHasMorePosts(json.data.length === 25);
    }
  } catch (err) {
    console.error("Failed to fetch favorite posts", err);
  } finally {
    setLoading(false);
  }
};

  // Fetch gifs
  const fetchGifs = async (nextPage = 1) => {
    if (loading || !hasMoreGifs) return;
    setLoading(true);
    try {
      const res = await api.get(`/api/gifs/favorites/feed?page=${nextPage}`);
      const json = res.data;
      if (json.data) {
        setRecentGifs(prev => [...prev, ...json.data]);
        setPageGifs(nextPage);
        setHasMoreGifs(json.data.length === 25);
      }
    } catch (err) {
      console.error("Failed to fetch favorite gifs", err);
    } finally {
      setLoading(false);
    }
  };

  // initial load
  useEffect(() => {
    if (selected === 1 && recentPosts.length === 0) {
      fetchPosts(1);
    }
    if (selected === 2 && recentGifs.length === 0) {
      fetchGifs(1);
    }
  }, [selected]);

  // scroll listener
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 200 && !loading) {
        if (selected === 1 && hasMorePosts) {
          fetchPosts(pagePosts + 1);
        }
        if (selected === 2 && hasMoreGifs) {
          fetchGifs(pageGifs + 1);
        }
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loading, selected, pagePosts, pageGifs, hasMorePosts, hasMoreGifs]);

  return (
    <div className="history-page">
      <div className='history-header'>
        <h3 className='history-title' style={{display: 'flex', alignItems: 'center', gap: '5px', margin: 0}}><Bookmark /> Favorite</h3>
        <div className='history-sub-div'>
          <p className='history-subtitle' style={{margin:'5px 0px 0px 0px'}}>Your favorite feeds and gifs</p>
        </div>
      </div>

      {[{id: 1, label: "Posts"}, {id: 2, label: "Gifs"}].map((opt) => (
        <button
          key={opt.id}
          onClick={() => setSelected(opt.id)}
          style={{
            backgroundColor: selected === opt.id ? "var(--back-con)" : "transparent",
            borderBottom: selected === opt.id ? "2px solid #fd7648" : "2px solid transparent",
            color: selected === opt.id ? "#fd7648" : "grey",
          }}
          className='radio-button'
        >
          {opt.label}
        </button>
      ))}

      <br/><br/>

      {selected === 1 && (
        <div className='select-result-fav'>
          <Input
            placeholder="Search favorite feed..."
            prefix={<SearchOutlined />}
            value={searchHistory}
            onChange={(e) => setSearchHistory(e.target.value)}
            id='search-chat'
            className='search-btn-personal'
          />
          <div className='history-body'>
            {filteredPosts.map((item) => (
              <PostHistoryCard key={item.id} item={item} />
            ))}
            {loading && <div><p style={{color: "grey", textAlign: "center"}}>Loading...</p></div>}
          </div>
          {
            filteredPosts.length === 0 && !loading && (
              <div className='empty-gif'>
                <Coffee />
                <span>No data yet</span>
              </div>
            )
          }
        </div>
      )}

      {selected === 2 && (
        <div className='select-result-fav'>
          <Input
            placeholder="Search favorite gif..."
            prefix={<SearchOutlined />}
            value={searchHistory}
            onChange={(e) => setSearchHistory(e.target.value)}
            id='search-chat'
            className='search-btn-personal'
          />
          <br/>
          <br/>
          <div className='masonry'>
            {filteredGifs.map((gif) => (
              <GifHistoryCard key={gif.gif_id} gif={gif} />
            ))}
            {loading && <div className='empty-gif'><p style={{color: "grey", textAlign: "center"}}>Loading...</p></div>}
          </div>
          {
            filteredGifs.length === 0 && !loading && (
              <div className='empty-gif'>
                <Coffee />
                <span>No data yet</span>
              </div>
            )
          }
        </div>
      )}
    </div>
  );
};

const PostHistoryCard = ({ item }) => {
  const navigate = useNavigate();
  let safeImg = null;
  try {
    if (typeof item.mediaSrc === "string") {
      if (item.mediaSrc.trim().startsWith("[")) {
        const arr = JSON.parse(item.mediaSrc);
        if (Array.isArray(arr) && arr.length > 0) {
          safeImg = arr[0];
        }
      } else {
        safeImg = item.mediaSrc;
      }
    }
  } catch (err) {
    console.warn("Invalid mediaSrc format", err);
  }

  return (
    <div className="post-history-cards" onClick={() => navigate(`/aboutpost/${item.id}`)}>
      {safeImg && (
        <div
          className="media-holders"
          style={{ "--preview-url-history-post": `url(${safeImg})` }}
        >
          <img src={safeImg} alt="post-media" />
        </div>
      )}
      <div className="post-history-card-infos">
        <div id="author-infos">
          <div
            id="author-pf-divs"
            style={{
              backgroundColor: item.isAnonymous === 1 ? item.anonymousBg : "",
            }}
          >
            <img
              src={
                item.isAnonymous === 1
                  ? nahIdeaAuth 
                  : item.authurPf || nahideaIcon
              }
              alt="user-profile"
              id="author-pfs"
            />
          </div>
          <p id="author-names">{item.author}</p>
        </div>
        <div id="title-divs">
          <p id="titles">{item.title}</p>
        </div>
      </div>
    </div>
  );
};

const GifHistoryCard = ({ gif }) => (
  <div className="gif-card">
      <img src={gif.gif_url} alt={gif.gif_name} />
     <div className="gif-overlay">
              <span className="gif-name">{gif.gif_name}</span>
            </div>
  </div>
);

export default Favorite;
