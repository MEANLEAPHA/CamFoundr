import React, { useState, useEffect } from "react";
import {useNavigate} from "react-router-dom";

import { QuestionOutlined, FormOutlined, SoundOutlined } from '@ant-design/icons';
import { Dropdown, Space } from 'antd';
import { useNotifications } from "../context/NotificationContext";
// style
import "../style/Header.css";
import { useAuth } from '../context/AuthContext';
import { SearchBar } from "./SearchBar";
import { Bell, Brain, LogOut, Menu, MessageSquareText, MessagesSquare, Moon, Plus, Rocket, Rss, Settings, SquarePlus, Sun, User } from "lucide-react";
import camfoundr from '../../../public/camfoundr.png'

const Header = ({onToggleAside, onToggleTheme, currentTheme}) => {
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();

  return (
     <header>

      <div className="header-left header-children" onClick={()=>{navigate('/')}}>
        
        <Menu className="aside-action-bar mobile-tool lucide-icon-hr" onClick={(e) => {
          e.stopPropagation();
          onToggleAside();
        }} 
        style={{cursor:'pointer'}}
        />
        <p className='logo-font-main not-mobile-tool' style={{cursor:'pointer'}}>CamFound<span style={{color:'#f1ad20'}}>r</span><sup style={{fontSize:'12px'}} className='beta-span'>beta</sup></p>
        <img src={camfoundr} className='mobile-tool logo-mobile'/>
      </div>

        <SearchBar />
  
      <div className="header-right header-children">
        <>
          <button className='button-bar-icon not-mobile-tool' onClick={onToggleTheme}>
            {currentTheme ? <Moon className="not-mobile-tool bar-icon lucide-icon-hr"/>
            :
            <Sun className="not-mobile-tool bar-icon lucide-icon-hr"/>}
          </button>

          <button className='button-bar-icon'>
            <MessagesSquare className=" lucide-icon-hr" />
          </button>

          <CreateDropDown />

          {/* mobile view */}
          <CreateDropDownMin />

          <button className='button-bar-icon' type="button" onClick={()=>{navigate('/notifications')}}>
            <Bell className='lucide-icon-hr'/>
            {unreadCount > 0 && (
                <span className="badge-noti" style={{ color: "white" }}>
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
          </button>

          <ProfileDropDown theme={currentTheme} toggleTheme={onToggleTheme}/>

        </>
      </div>

    </header>
 
  );
};

const useUploadItems = () => {
  const navigate = useNavigate();
  return [
    { label: <li onClick={() => navigate('/create/content')}><Rss className='lucide-icon-dropdown'/> <span>Feed</span></li>, key: '0' },
    { label: <li onClick={() => navigate('/create/confession')}><Brain className='lucide-icon-dropdown'/> <span>Brainstorm</span></li>, key: '1' },
    { label: <li onClick={() => navigate('/create/question')}><Rocket className='lucide-icon-dropdown'/> <span>Raise Team</span></li>, key: '3' },
    // { label: <li onClick={() => navigate('/create/content')}><FormOutlined /> <span>Content</span></li>, key: '0' },
    // { label: <li onClick={() => navigate('/create/confession')}><SoundOutlined /> <span>Confession</span></li>, key: '1' },
    // { label: <li onClick={() => navigate('/create/question')}><QuestionOutlined /> <span>Question</span></li>, key: '3' },
  ];
};

const CreateDropDown = () => {
  const items = useUploadItems();
  return (
    <Dropdown menu={{ items }} trigger={['click']} classNames={{ root: "profile-dropdown create-dropdown" }}>
      <button className='button-bar-icon not-mobile-tool button-create-icon' style={{gap: '5px'}}>
       <Plus className="bar-icon create-icon lucide-icon-hr" /> <span style={{ fontWeight: 600, opacity: 0.9 }}>Create</span>
      </button>
    </Dropdown>
  );
};

const CreateDropDownMin = () => {
  const items = useUploadItems();
  return (
    <Dropdown menu={{ items }} trigger={['click']} classNames={{ root: "profile-dropdown create-dropdown" }}>
      <button className='button-create-icon-min mobile-tool button-bar-icon'>
        <SquarePlus className='lucide-icon-hr'/> 
      </button>
    </Dropdown>
  );
};


// Pf Dropdown
const ProfileDropDown = ({ theme, toggleTheme}) => {
   
  const navigate = useNavigate();

 const {user, logout} = useAuth();

  const userId = user?.id;
  const avatar = user?.avatar_url;
 

  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const menuItems = [
    {
      label: (
        <li onClick={() => navigate("/accounts", {
          state: {
            userId: userId,
          }
        })}>
          <User className='lucide-icon-dropdown'/> View Account
        </li>
      ),
      key: "1",
    },
    {
      label: (
        <li
          onClick={(e) => {
            toggleTheme();
            e.stopPropagation();
          }}
        >
          {theme ? <Moon className='lucide-icon-dropdown'/> : <Sun className='lucide-icon-dropdown'/>}{" "}
          {theme ? <span>Dark Mode</span> : <span>Light Mode</span>} 
        </li>
      ),
      key: "2",
    },
    {
      label: (
        <li onClick={() => navigate("/feedback")}>
          <MessageSquareText className='lucide-icon-dropdown'/> <span>Feedback</span>
        </li>
      ),
      key: "3",
    },
    {
      label: (
        <li onClick={() => navigate("/feedback")}>
          <Settings className='lucide-icon-dropdown'/> <span>Setting</span>
        </li>
      ),
      key: "4",
    },
    {  label: (
     
         <hr />
     
      ),
      key: "5" },
    {
      label: (
       <li
            onClick={() => {
              logout();
              navigate("/login");
            }}
          >
          <LogOut className='lucide-icon-dropdown'/> <span>Logout</span>
        </li>
      ),
      key: "6",
    },
  ];

  return (
    <Dropdown menu={{ items: menuItems }} trigger={["click"]} classNames={{ root: "profile-dropdown"}}>
      <div style={{position: "relative"}} > 
        <Space>
          <img
            src={avatar || 'https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png?utm_source=commons.wikimedia.org&utm_campaign=index&utm_content=original'}
            className="profile-div-img button-bar-icon button-bar-icon-pf"
            alt="profile"
          />
          <div id="user-status">
            <div
              id="user-status-dot"
              style={{ backgroundColor:"yellowgreen" }}
            >
            </div>
          </div>
        </Space>
   </div>
    </Dropdown>
  );
};


export default Header;

