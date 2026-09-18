import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import nahideaIcon from '../img/nahideaIcon.png';
import nahIdeaAuth from "../img/nahIdeaAuth.png";
const RecentHistory = () => {
    const navigate = useNavigate();
  const [recentDataHis, setRecentDataHis] = useState([]);

  useEffect(() => {
    const postData = JSON.parse(localStorage.getItem("recentPostHis")) || [];
    setRecentDataHis(postData);
  }, []);

  if (recentDataHis.length === 0) {
    return null;
  }

  const deletePostHistory = (postId) => {
    const postData = JSON.parse(localStorage.getItem("recentPostHis")) || [];
    const update = postData.filter((item) => item.id !== postId);
    localStorage.setItem("recentPostHis", JSON.stringify(update));
    setRecentDataHis(update);
  };

  return (
    <div className="history-container">
      <div className="history-container-header">
        <label>Recent History</label>
        <span onClick={() => navigate("/history")}>See All</span>
      </div>

      <div className="history-list-ul">
        {recentDataHis.map((item) => (
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
    <div className="post-history-card" onClick={() => {
       const HisData = {
                        id: item.id,
                        title: item.title,
                        mediaSrc: item.mediaSrc,
                        author:  item.author,
                        authurPf: item.authurPf,
                        isAnonymous: item.isAnonymous,
                        anonymousBg: item.anonymousBg,
                      }
                      const recentDataHis = JSON.parse(localStorage.getItem("recentPostHis")) || [];
      
                      let newList;
                      if (recentDataHis.some(items => items.id === item.id)) {
                        const raminData = recentDataHis.filter(items => items.id !== item.id);
                        newList = [HisData, ...raminData].slice(0, 50);
                      } else {
                        newList = [HisData, ...recentDataHis].slice(0, 50);
                      }
                      localStorage.setItem("recentPostHis", JSON.stringify(newList));
      navigate(`/aboutpost/${item.id}`);
    }}>
      <div className="post-history-card-info">
        <div id="author-info">
          <div
            id="author-pf-div"
            style={{
              backgroundColor: item.isAnonymous === 1 ? item.anonymousBg : "",
            }}
          >
            <img
              src={item.isAnonymous === 1 ? nahIdeaAuth : item.authurPf || nahideaIcon}
              alt="user-profile"
              id="author-pf"
            />
          </div>
          <p id="author-name">{item.author}</p>
        </div>
        <div id="title-div">
          <p id="title">{item.title}</p>
        </div>
        <div id="title-div">
          <p id="title" style={{fontSize:'x-small', color:'gray'}}>{item.localTime}</p>
        </div>
      </div>

      {safeImg && (
        <div
          className="media-holder"
          style={{ "--preview-url-history-post": `url(${safeImg})` }}
        >
          <img src={safeImg} alt="post-media" />
        </div>
      )}
    </div>
  );
};

export default RecentHistory;