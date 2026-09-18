import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../style/page/History.css";
import { Input } from 'antd';
import { SearchOutlined, ClearOutlined, DeleteOutlined, ClockCircleOutlined } from '@ant-design/icons';
import nahIdeaAuth from "../img/nahIdeaAuth.png";
import nahideaIcon from '../img/nahideaIcon.png';
import { TimerReset } from "lucide-react";
const History = () => {

  const [searchHisory, setSearchHistory] = useState('');
  const [recentDataHis, setRecentDataHis] = useState([]);

  // Filter by search
  const filteredHistory = recentDataHis.filter(u =>
    u.title.toLowerCase().includes(searchHisory.toLowerCase())
  );

  // Load from localStorage on mount
  useEffect(() => {
    const postData = JSON.parse(localStorage.getItem("recentPostHis")) || [];
    setRecentDataHis(postData);
  }, []);

  // Delete single post
  const deletePostHistory = (postId) => {
    const postData = JSON.parse(localStorage.getItem("recentPostHis")) || [];
    const update = postData.filter((item) => item.id !== postId);
    localStorage.setItem("recentPostHis", JSON.stringify(update));
    setRecentDataHis(update);
  };

  // Clear all posts
  const clearAllHistory = () => {
    localStorage.setItem("recentPostHis", JSON.stringify([]));
    setRecentDataHis([]);
  };

  return (
    <div className="history-page">
      <div className='history-header'>
        <h3 className='history-title' style={{display: 'flex', alignItems: 'center', gap: '5px', margin: 0}}><TimerReset /> History</h3>
        <div className='history-sub-div'>
          <p className='history-subtitle' style={{margin:'5px 0px 0px 0px'}}>Recent History </p>
          <button
            type='button'
            className='clear-all-history-btn'
            onClick={clearAllHistory}
          >
           Clear All
          </button>
        </div>
      </div>

      <Input
        placeholder="Search History......"
        prefix={<SearchOutlined />}
        value={searchHisory}
        onChange={(e) => setSearchHistory(e.target.value)}
        id='search-chat'
        className='search-btn-personal'
      />

      <div className='history-body'>
        {filteredHistory.map((item) => (
          <PostHistoryCard
            key={item.id}
            item={item}
            deletePostHistory={deletePostHistory}
          />
        ))}
      </div>
    </div>
  );
};

const PostHistoryCard = ({ item, deletePostHistory }) => {
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
        <div id="title-divs">
          <p id="titles" style={{fontSize:'x-small', color:'gray'}}>{item.localTime}</p>
        </div>
        <button
          id="history-card-deletes"
          onClick={(e) => {
            e.stopPropagation(); 
            deletePostHistory(item.id)
          }}
        >
          <DeleteOutlined />
        </button>
      </div>
    </div>
  );
};

export default History;
