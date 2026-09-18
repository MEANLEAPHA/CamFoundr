import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useOutletContext, useLocation } from 'react-router-dom';
import { Avatar, Badge, Typography, Input, message } from 'antd';
import { Divider, Dropdown, Space } from 'antd';
import { sameId } from '../page/util/sameId';
import {MenuOutlined,LeftOutlined,PlusOutlined,UserOutlined, MenuFoldOutlined, MenuUnfoldOutlined,SearchOutlined, BellOutlined, QuestionOutlined, FormOutlined, SoundOutlined, LogoutOutlined, MoonFilled, SunFilled, ExceptionOutlined, SettingOutlined, PlusSquareOutlined, SunOutlined, MoonOutlined,
        HomeOutlined,SignatureOutlined,BarChartOutlined,ClockCircleOutlined,HeartOutlined, RiseOutlined, FireOutlined, QuestionCircleOutlined, FlagOutlined, ReadOutlined, FileProtectOutlined,FileDoneOutlined, 
} from '@ant-design/icons';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAddressBook, faComments } from "@fortawesome/free-regular-svg-icons";

  import { faArrowRightFromBracket, } from "@fortawesome/free-solid-svg-icons";
import api from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';
import nahideaIcon from '../img/nahideaIcon.png';
import {
  connectSocket,
  disconnectSocket,
  getSocket
} from "../../socket";

import gossiperlogo from "../img/gossiperlogo.png";

const { Text } = Typography;

// keys used for persisting sidebar state across refreshes
const SELECTED_TAB_KEY = 'sidebar_selected_tab';
const ACTIVE_CHAT_KEY = 'sidebar_active_chat';

const Sidebar = ({ activeChat, setActiveChat }) => {
  
  const navigate = useNavigate();
  const {state} = useLocation();
  const hasConsumedNavState = useRef(false);

  const [onlineUsers, setOnlineUsers] = useState([]);
  const { user } = useAuth();

  const [users, setUsers] = useState([]);
  const [userSpam, setUserSpam] = useState([]);
  const [userArchive, setUserArchive] = useState([]);

  const [search, setSearch] = useState('');
  const [searchSpam, setSearchSpam] = useState('');
  const [searchArchive, setSearchArchive] = useState('');
 
  const socket = getSocket();
  const token = localStorage.getItem('token');

  // hydrate selected tab from localStorage so a refresh keeps the same tab open
  const [selected, setSelected] = useState(() => {
    const stored = localStorage.getItem(SELECTED_TAB_KEY);
    return stored ? Number(stored) : 1;
  });

  // persist selected tab whenever it changes
  useEffect(() => {
    localStorage.setItem(SELECTED_TAB_KEY, String(selected));
  }, [selected]);

  // hydrate activeChat from localStorage on mount (only if router didn't already pass one in)
  useEffect(() => {
    if (!state?.activeChat) {
      const stored = localStorage.getItem(ACTIVE_CHAT_KEY);
      if (stored) {
        try {
          setActiveChat(JSON.parse(stored));
        } catch (e) {
          // corrupted value, drop it
          localStorage.removeItem(ACTIVE_CHAT_KEY);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // persist activeChat whenever it changes so a refresh restores it
  useEffect(() => {
    if (activeChat) {
      localStorage.setItem(ACTIVE_CHAT_KEY, JSON.stringify(activeChat));
    }
  }, [activeChat]);

      useEffect(() => {
        if (!token|| !user) return;

        const socket = connectSocket({
          token,
          userId: user?.id,
          username: user?.username,
          avatar_url: user?.avatar_url
        });
    
        socket.on("online-users", (users) => {
          setOnlineUsers(users);
        });
    
        return () => {
    
          socket.off("online-users");
    
          disconnectSocket();
        };
    
      }, []);

  const fetchChatUsers = async () => {
    try {
      const res = await api.get('/api/get-chat-user');
      setUsers(res.data);
    } catch (err) {
      message.error('Failed to load contacts');
    }
  };

    useEffect(() => {

    if (hasConsumedNavState.current) return;
    if (!state?.selected || !state?.activeChat) return;

    hasConsumedNavState.current = true;
    const initChat = async () => {
      if (state?.selected === 2 && state?.activeChat) {
        const { data: conversation } = await api.post('/api/conversations/get-or-create', {
          otherUserId: state.activeChat.id,
        });

        setActiveChat({
          id: conversation.user_id || state.activeChat.id,
          username: state.activeChat.username,
          avatar_url: state.activeChat.avatar_url,
          conversation_id: conversation.id
        });
        setSelected(2);
      }
      else if (state?.selected === 1 && state?.activeChat) {
        setActiveChat(state.activeChat);
        setSelected(1);
      }
       navigate(location.pathname, { replace: true, state: null });
    };
    
    initChat();
  }, [state]);

  useEffect(() => {
    fetchChatUsers();
  }, []);

  const fetchChatUserSpam = async () => {
    try {
      const res = await api.get('/api/get-chat-spam-user');
      setUserSpam(res.data);
    } catch (err) {
      message.error('Failed to load contacts');
    }
  };

  useEffect(() => {
    fetchChatUserSpam();
  }, [selected === 2]);

  const handleRestoreChat = async (userId) => {
    try {
      await api.put(`/api/open-conversation/${userId}`, null);
      fetchChatUsers();
      fetchChatUserArchive();
    } catch (err) {
      message.error('Failed to restore contact');
    }
  };

  const fetchChatUserArchive = async () => {
    try {
      const res = await api.get('/api/get-chat-archived-user');
      setUserArchive(res.data);
    } catch (err) {
      message.error('Failed to load contacts');
    }
  };

  useEffect(() => {
    fetchChatUserArchive();
  }, [selected === 3]);


  // Listen for new messages to update sidebar (last message & unread count)
  useEffect(() => {
    if (!socket) return;
    const handleNewMessage = () => {
      fetchChatUsers();
      fetchChatUserSpam();
    };
    socket.on('new_message', handleNewMessage);
    return () => socket.off('new_message', handleNewMessage);
  }, [socket]);

  const filteredUsers = users.filter(u =>
    u.username.toLowerCase().includes(search.toLowerCase())
  );

  const filteredUserSpam = userSpam.filter(u =>
    u.username.toLowerCase().includes(searchSpam.toLowerCase())
  );

  const filteredUserArchive = userArchive.filter(u =>
    u.username.toLowerCase().includes(searchArchive.toLowerCase())
  );

  const handleSelectChat = (chatUser) => {
    setActiveChat(chatUser);
    setUsers(prev =>
      prev.map(u =>
        sameId(u.id, chatUser.id) ? { ...u, unread_count: 0 } : u
      )
    );
  };

    const [darkMode, setDarkMode] = useState(() => {
      return localStorage.getItem("darkMode") === "true";
    });
  
    useEffect(() => {
  
      document.body.classList.toggle(
        "dark-theme",
        darkMode
      );
  
      localStorage.setItem(
        "darkMode",
        darkMode
      );
  
    }, [darkMode]);
  
    const toggleTheme = () => {
      setDarkMode(prev => !prev);
    };

    
    const friendUnreadCount = users.reduce(
      (sum, user) => sum + Number(user.unread_count || 0),
      0
    );

    const spamUnreadCount = userSpam.reduce(
      (sum, user) => sum + Number(user.unread_count || 0),
      0
    );

  return (
    <div id='side-bar-gossip'>
      <div id='side-bar-header'>
        <div className='side-bar-header-child'>
          <LeftOutlined className="btn-out-gossiper" onClick={()=> {
            localStorage.removeItem('sidebar_active_chat');
            navigate(-1)}
            }/>

          <FontAwesomeIcon icon={faComments} id='gossip-icon-chat'/>
          <p style={{color: 'var(--font-color)'}}>Chat</p>
        </div>
        
        <div className='side-bar-header-child side-bar-header-child-right'>
          <button className='button-bar-icon btn-theme' onClick={toggleTheme} >
            {darkMode ? <MoonOutlined className="bar-icon"/> : <SunOutlined className=" bar-icon"/>}
            
          </button>
          <img
            src={user?.avatar_url || nahideaIcon}
            className="profile-div-img button-bar-icon button-bar-icon-pf"
            alt="profile"
            style={{backgroundColor: 'var(--secondary-color)'}}
          />
        </div>
      </div>

       <div  className='radio-button-div-chat'>
          {[{id: 1, label: "Friends"}, {id: 2, label: "Spam"}, {id: 3, label: `Archived`}].map((opt) => (
          <button
            key={opt.id}
            onClick={() => setSelected(opt.id)}
            style={{
              borderBottom: selected === opt.id ? "2px solid #fd7648" : "2px solid transparent",
              color: selected === opt.id ? "#fd7648" : "grey",
            }}
            className='radio-button-chat'
          >
            {opt.label}

            {opt.id === 1 && friendUnreadCount > 0 && (
              <span className="chat-tab-badge">
                {friendUnreadCount}
              </span>
            )}

            {opt.id === 2 && spamUnreadCount > 0 && (
              <span className="chat-tab-badge">
                {spamUnreadCount}
              </span>
            )}
          </button>
        ))}
        </div>

        {
          selected === 1 && 
            <div className='div-select-chat'>
          <Input placeholder="Search users..." prefix={<SearchOutlined />} value={search} onChange={(e) => setSearch(e.target.value)} id='search-chat' />
      
          <div className="user-chat-list">
            <div className="user-list-items">
              {filteredUsers.map((item) => (
                <div
                  key={item.id}
                  className="user-list-item"
                  onClick={() => handleSelectChat(item)}
                  style={{
                    cursor: 'pointer',
                    background: String(activeChat?.id) === String(item.id) ? 'var(--secondary-color)' : 'transparent',
                    padding: '12px 16px',
                    transition: '0.2s',
                  }}
                >
                  <div className="user-list-item-meta" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div className="user-list-item-meta-avatar">
                      <img src={item.avatar_url || nahideaIcon} alt="" className='user-chat-avatar' />
                      {onlineUsers.includes(String(item.id)) ? (
                        <div className='online-status-chat'></div>
                      ) : (
                        <div className='offline-status-chat'></div>
                      )}
                      
                    </div>
                    <div className="user-list-item-meta-content">
                      <div className="user-list-item-meta-title">
                        <div className='user-chat-name'>{item.username}</div>
                        <div className='user-chat-message'>{item.last_message || ''}</div>
                      </div>
                      {item.unread_count > 0 && (
                        <Badge
                          count={item.unread_count}
                          style={{ backgroundColor: 'red' }}
                        />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
            </div>
        }
        {
        selected === 2 && 
          <div className='div-select-chat'>
        <Input placeholder="Search spam users..." prefix={<SearchOutlined />} value={searchSpam} onChange={(e) => setSearchSpam(e.target.value)} id='search-chat' />
    
        <div className="user-chat-list">
          <div className="user-list-items">
            {filteredUserSpam.map((item) => (
              <div
                key={item.id}
                className="user-list-item"
                onClick={() => handleSelectChat(item)}
                style={{
                  cursor: 'pointer',
                  background: String(activeChat?.id) === String(item.id) ? 'var(--secondary-color)' : 'transparent',
                  padding: '12px 16px',
                  transition: '0.2s',
                }}
              >
                <div className="user-list-item-meta" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div className="user-list-item-meta-avatar">
                    <img src={item.avatar_url || nahideaIcon} alt="" className='user-chat-avatar' />
                    {onlineUsers.includes(String(item.id)) ? (
                      <div className='online-status-chat'></div>
                    ) : (
                      <div className='offline-status-chat'></div>
                    )}
                    
                  </div>
                  <div className="user-list-item-meta-content">
                    <div className="user-list-item-meta-title">
                      <div className='user-chat-name'>{item.username}</div>
                      <div className='user-chat-message'>{item.last_message || 'No messages yet'}</div>
                    </div>
                    {item.unread_count > 0 && (
                      <Badge
                        count={item.unread_count}
                        style={{ backgroundColor: 'red' }}
                      />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
          </div>
      }
      {
        selected === 3 && 
          <div className='div-select-chat'>
        <Input placeholder="Search archive users..." prefix={<SearchOutlined />} value={searchArchive} onChange={(e) => setSearchArchive(e.target.value)} id='search-chat' />
    
        <div className="user-chat-list">
          <div className="user-list-items">
            {filteredUserArchive.map((item) => (
              <div
                key={item.id}
                className="user-list-item"
                style={{
                  cursor: 'pointer',
                  background: String(activeChat?.id) === String(item.id) ? 'var(--secondary-color)' : 'transparent',
                  padding: '12px 16px',
                  transition: '0.2s',
                }}
              >
                <div className="user-list-item-meta" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div className="user-list-item-meta-avatar">
                    <img src={item.avatar_url || nahideaIcon} alt="" className='user-chat-avatar' />
                    {onlineUsers.includes(String(item.id)) ? (
                      <div className='online-status-chat'></div>
                    ) : (
                      <div className='offline-status-chat'></div>
                    )}
                    
                  </div>
                  <div className="user-list-item-meta-content">
                    <div className="user-list-item-meta-title">
                      <div className='user-chat-name'>{item.username}</div>
                    </div>
                    <button onClick={() => handleRestoreChat(item.id)} type='button'
                     className='btn-restore-chat'
                     style={{background: 'var(--secondary-color)',color: 'var(--font-color)'}}>Restore Chat</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
          </div>
      }
      
    </div>
  );
};

export default Sidebar;
