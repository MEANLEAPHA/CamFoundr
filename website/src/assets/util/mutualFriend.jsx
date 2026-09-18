import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosInstance"
import nahideaIcon from '../img/nahideaIcon.png';
const MutualFriend = ({ onlineUsers }) => {
  const [friends, setFriends] = useState([]);
  const navigate = useNavigate();
  useEffect(() => {
    const fetchMutualFriends = async () => {
      try {
        const res = await api.get(
          `/api/get-mutuals`
        );
        setFriends(res.data.data);
      } catch (err) {
        console.error("Failed to fetch mutual friends:", err); 
      }
    };

    fetchMutualFriends();
  }, []);

  if (friends.length === 0) {
    console.log("No mutual friends found.");
    return null;
  }

  return (
    <div className="friend-container">
      <div className="friend-header-card">
        <label>Friend</label>
        <span onClick={() => navigate("/friends")}>see all</span>
      </div>
      <div className="friend-list-ul">
        {friends?.map((friend) => (
          <FriendCard
            key={friend.id}
            userId={friend.id}
            username={friend.username}
            avatar_url={friend.avatar_url}
            isOnline={onlineUsers.includes(String(friend.id))}
          />
        ))}
      </div>
    </div>
  );
};


const FriendCard = ({ username, avatar_url, isOnline, userId }) => {
  const navigate = useNavigate();
  return (
    <div className="friend-card" onClick={() => navigate(`/accounts`, {
        state: {
          userId: userId
        }
    })}>
      <div className="friend-pf-div">
        <img src={avatar_url || nahideaIcon} alt={username} className="friend-pf" />
        {isOnline ? (
          <div className="online-dot status-fri-dot"></div>
        ) : (
          <div className="offline-dot status-fri-dot"></div>
        )}
      </div>
      <div className="friend-info">
        <span>{username}</span>
      </div>
    </div>
  );
};

export default MutualFriend;