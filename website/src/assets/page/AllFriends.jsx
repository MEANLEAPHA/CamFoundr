import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useOutletContext, useLocation } from "react-router-dom";
import api from "../api/axiosInstance";
import "../style/page/AllFriends.css";
import nahideaIcon from '../img/nahideaIcon.png';

const AllFriends = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { user } = useOutletContext();
  
  const [selected, setSelected] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [searchFriends, setSearchFriends] = useState('');
  const [searchFollowers, setSearchFollowers] = useState('');
  const [searchFollowings, setSearchFollowings] = useState('');
  
  const [friends, setFriends] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [followings, setFollowings] = useState([]);
  
  const targetUserId = state?.userId || user?.id;
  const targetUsername = state?.username || user?.username;

  // Filter functions
  const filterFriend = friends.filter(f => 
    f.username?.toLowerCase().includes(searchFriends.toLowerCase())
  );
  
  const filterFollower = followers.filter(f => 
    f.username?.toLowerCase().includes(searchFollowers.toLowerCase())
  );
  
  const filterFollowing = followings.filter(f => 
    f.username?.toLowerCase().includes(searchFollowings.toLowerCase())
  );

  // Get token with error handling
  const getToken = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return null;
    }
    return token;
  };

  // API calls
  const fetchFriends = useCallback(async () => {
    if (!targetUserId) return;
    
    setLoading(true);
    setError(null);
    
    try {

      const res = await api.get(
        `/api/friends/${targetUserId}`
      );
      setFriends(res.data || []);
    } catch (err) {
      console.error('Error fetching friends:', err);
      setError(err.response?.data?.error || 'Failed to load friends');
      setFriends([]);
    } finally {
      setLoading(false);
    }
  }, [targetUserId, navigate]);

  const fetchFollowers = useCallback(async () => {
    if (!targetUserId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const res = await api.get(
        `/api/followers/${targetUserId}`
      );
      setFollowers(res.data || []);
    } catch (err) {
      console.error('Error fetching followers:', err);
      setError(err.response?.data?.error || 'Failed to load followers');
      setFollowers([]);
    } finally {
      setLoading(false);
    }
  }, [targetUserId, navigate]);

  const fetchFollowings = useCallback(async () => {
    if (!targetUserId) return;
    
    setLoading(true);
    setError(null);
    
    try { 
      const res = await api.get(
        `/api/followings/${targetUserId}`
      );
      setFollowings(res.data || []);
    } catch (err) {
      console.error('Error fetching followings:', err);
      setError(err.response?.data?.error || 'Failed to load followings');
      setFollowings([]);
    } finally {
      setLoading(false);
    }
  }, [targetUserId, navigate]);

  // Effects
  useEffect(() => {
    setSelected(state?.selected || 1);
  }, [state?.selected]);

  useEffect(() => {
    if (selected === 1) fetchFriends();
    else if (selected === 2) fetchFollowers();
    else if (selected === 3) fetchFollowings();
  }, [selected, fetchFriends, fetchFollowers, fetchFollowings]);

  // Reset searches when tab changes
  useEffect(() => {
    setSearchFriends('');
    setSearchFollowers('');
    setSearchFollowings('');
  }, [selected]);

  const getCurrentData = () => {
    switch(selected) {
      case 1: return { data: filterFriend, length: friends.length, search: searchFriends, setSearch: setSearchFriends, placeholder: 'Search friends' };
      case 2: return { data: filterFollower, length: followers.length, search: searchFollowers, setSearch: setSearchFollowers, placeholder: 'Search followers' };
      case 3: return { data: filterFollowing, length: followings.length, search: searchFollowings, setSearch: setSearchFollowings, placeholder: 'Search following' };
      default: return { data: [], length: 0, search: '', setSearch: () => {}, placeholder: '' };
    }
  };

  const current = getCurrentData();

  const renderUserCard = (user) => (
    <div 
      className='friend-list-item' 
      key={user.id} 
      onClick={() => navigate(`/accounts`, { state: { userId: user.id } })}
    >
      <img 
        src={user.avatar_url || nahideaIcon} 
        alt={user.username || 'profile'} 
        className='fris-pf'
        onError={(e) => {
          e.target.src = nahideaIcon;
        }}
      />
      <div className='friend-info'>
        <p className='fris-name'>{user.username || 'Unknown User'}</p>
        <p className='fris-profession'>{user.profession || 'No profession specified'}</p>
      </div>
    </div>
  );

  const getTabLabel = () => {
    if (selected === 1) return "Mutuals";
    if (selected === 2) return "Followers";
    return "Following";
  };

  return (
    <div id='all-friends-container'>
      <div id='friend-header'>
        <h3 id='f-label'>
          {targetUsername}'s {getTabLabel()} ({current.length})
        </h3>
        
        <div className='radio-button-div-chat'>
          {[
            { id: 1, label: "Mutuals" },
            { id: 2, label: "Followers" },
            { id: 3, label: "Following" }
          ].map((opt) => (
            <button
              key={opt.id}
              onClick={() => setSelected(opt.id)}
              style={{
                borderBottom: selected === opt.id ? "2px solid #fd7648" : "2px solid transparent",
                color: selected === opt.id ? "#fd7648" : "grey",
                background: selected === opt.id ? "var(--back-con)" : "transparent",
              }}
              className='radio-button-chat'
              disabled={loading}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
      
      <div id='friend-list-body'>
        {loading ? (
          <div className='loading-container'>
            <div className='loading-spinner'></div>
            <p style={{color: "grey"}}>Loading...</p>
          </div>
        ) : error ? (
          <div className='error-container'>
            <p className='error-message'>{error}</p>
            <button onClick={() => {
              if (selected === 1) fetchFriends();
              else if (selected === 2) fetchFollowers();
              else fetchFollowings();
            }} className='retry-button'>
              Retry
            </button>
          </div>
        ) : (
          <div id='friend-list-result'>
            <div id='friend-search'>
              <input 
                type='text' 
                placeholder={current.placeholder} 
                value={current.search}
                onChange={(e) => current.setSearch(e.target.value)} 
                className='friend-list-search'
              />
            </div>
            
            <div id='friend-list'>
              {current.data.length > 0 ? (
                current.data.map(renderUserCard)
              ) : (
                <div className='empty-state'>
                  <p>No {getTabLabel().toLowerCase()} found</p>
                  {current.search && <p>Try a different search term</p>}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllFriends;