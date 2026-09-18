import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import ChatWindow from '../components/ChatWindow';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faComments} from '@fortawesome/free-regular-svg-icons';
import '../style/page/chat.css';
import { Spin } from 'antd';

const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) setMatches(media.matches);
    const listener = () => setMatches(media.matches);
    window.addEventListener('resize', listener);
    return () => window.removeEventListener('resize', listener);
  }, [matches, query]);
  return matches;
};

export default function Chat() {
  const { user, loading: authLoading } = useAuth();
  const [activeChat, setActiveChat] = useState(null);
  const isMobile = useMediaQuery('(max-width: 1000px)');
  const handleBack = () => setActiveChat(null);

    if (authLoading || !user) {
        return <div id='chat-loading-page'>
          <Spin style={{color: 'var(--primary-color)'}}/>
        </div>;
      }

  if (isMobile) {
    return (
      <div className="chat-container">
        {activeChat ? (
          <ChatWindow activeChat={activeChat} setActiveChat={setActiveChat} onBack={handleBack} />
        ) : (
          <Sidebar activeChat={activeChat} setActiveChat={setActiveChat} />
        )}
      </div>
    );
  }

  return (
    <div className="chat-container">
      <Sidebar activeChat={activeChat} setActiveChat={setActiveChat} />
      {activeChat ? (
        <ChatWindow activeChat={activeChat} setActiveChat={setActiveChat} />
      ) : (
        <div className="empty-div">
          <FontAwesomeIcon icon={faComments}  id="empty-glass"/>
          Select a chat to start chatting
        </div>
      )}
         
    </div>
  );
}