import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../style/page/History.css";
import { Input } from 'antd';
import { SearchOutlined, HeartOutlined } from '@ant-design/icons';
import nahideaIcon from '../img/nahideaIcon.png';
import nahIdeaAuth from "../img/nahIdeaAuth.png";
import api from "../api/axiosInstance"
import { Coffee, ThumbsUp } from "lucide-react";

const LikePost = () => {
  const [searchHistory, setSearchHistory] = useState('');
  const [recentDataHis, setRecentDataHis] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  // Filter by search
  const filteredHistory = recentDataHis.filter(u =>
    u.title?.toLowerCase().includes(searchHistory.toLowerCase())
  );

  const fetchLikedPosts = async (nextPage = 1) => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const res = await api.get(`/api/posts/likes?page=${nextPage}`);
      const json = res.data;
      if (json.data) {
        setRecentDataHis(prev => [...prev, ...json.data]);
        setPage(nextPage);
        setHasMore(json.data.length === 25); // if less than 25, no more pages
      }
    } catch (err) {
      console.error("Failed to fetch liked posts", err);
    } finally {
      setLoading(false);
    }
  };

  // initial load
  useEffect(() => {
    fetchLikedPosts(1);
  }, []);

  // scroll listener
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 200 &&
        !loading &&
        hasMore
      ) {
        fetchLikedPosts(page + 1);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loading, hasMore, page]);

  return (
    <div className="history-page">
      <div className='history-header'>
        <h3 className='history-title' style={{display: 'flex', alignItems: 'center', gap: '5px', margin: 0}}><ThumbsUp /> Like Feed</h3>
        <div className='history-sub-div'>
          <p className='history-subtitle' style={{margin:'5px 0px 0px 0px'}}>Your liked feeds</p>
        </div>
      </div>

      <Input
        placeholder="Search......"
        prefix={<SearchOutlined />}
        value={searchHistory}
        onChange={(e) => setSearchHistory(e.target.value)}
        id='search-chat'
        className='search-btn-personal'
      />

      <div className='history-body'>
        {filteredHistory.map((item) => (
          <PostHistoryCard key={item.id} item={item} />
        ))}
        {loading && <p>Loading...</p>}
      </div>

      {
        filteredHistory.length === 0 && (
        <div className='empty-gif'>
          <Coffee />
          <span>No data yet</span>
        </div>
        )
      }
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

export default LikePost;
