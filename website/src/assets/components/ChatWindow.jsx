import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { Button, Dropdown, Popconfirm, Spin } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBarsStaggered, faAngleLeft } from '@fortawesome/free-solid-svg-icons';
import { DeleteOutlined, FlagOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import MessageList from './MessageList';
import toast from 'react-hot-toast';
import MessageInput from './MessageInput';

import api from "../api/axiosInstance"
import { sameId } from '../page/util/sameId';
import {
  connectSocket,
  disconnectSocket,
  getSocket
} from "../../socket";
import { useAuth } from '../context/AuthContext';

const ChatWindow = ({ activeChat, setActiveChat, onBack }) => {
  const [onlineUsers, setOnlineUsers] = useState([]);
  const navigate = useNavigate();
  const loadingHistoryRef = useRef(false);
  const { user} = useAuth();
  const [messages, setMessages] = useState([]);
  const [conversationId, setConversationId] = useState(null);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [oldestMessageId, setOldestMessageId] = useState(null);
  const socket = getSocket();
  const messagesEndRef = useRef(null);
  const [typingTimeout, setTypingTimeout] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [replyTo, setReplyTo] = useState(null);
  const [editMessage, setEditMessage] = useState(null);

  const token = localStorage.getItem('token');


    useEffect(() => {
      if (!token || !user) return;
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

  const handleReply = (msg) => {
    setEditMessage(null);
    setReplyTo(msg);
  };

  const handleEdit = (msg) => {
    setReplyTo(null);
    setEditMessage(msg);
  };

  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await api.get(`/api/get-message/${activeChat.id}?limit=30`);
      const convId = Number(res.data.conversationId);
      setConversationId(convId);
      setMessages(res.data.messages);
      setHasMore(res.data.hasMore || false);
      if (res.data.messages.length > 0) {
        setOldestMessageId(res.data.messages[0].id);
      }
      if (socket && convId) {
        socket.emit('mark_seen', { conversationId: convId });
      }
    } catch (err) {
      toast.error('Failed to load messages');
    }
  };

  const loadOlderMessages = async () => {
    loadingHistoryRef.current = true;
    if (loadingOlder || !hasMore || !oldestMessageId) return;
    setLoadingOlder(true);
    try {

      const res = await api.get(`/api/get-message/${activeChat.id}?limit=30&beforeId=${oldestMessageId}`);
      if (res.data.messages.length > 0) {
        setMessages(prev => [...res.data.messages, ...prev]);
        setOldestMessageId(res.data.messages[0].id);
        setHasMore(res.data.hasMore || false);
        setTimeout(() => {
          loadingHistoryRef.current = false;
        }, 100);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      toast.error('Failed to load older messages');
    } finally {
      setLoadingOlder(false);
    }
  };

  const handleScroll = (e) => {
    const container = e.target;
    if (container.scrollTop === 0 && !loadingOlder && hasMore) {
      loadOlderMessages();
    }
  };

  useEffect(() => {
    if (socket && conversationId) {
      socket.emit('join_conversation', { conversationId });
    }
  }, [conversationId, socket]);

  useEffect(() => {
    if (!socket) return;
    const handleNewMessage = (msg) => {
      if (!conversationId && msg.conversation_id) {
        setConversationId(Number(msg.conversation_id));
      }
      if (String(msg.sender_id) === String(activeChat.id) || String(msg.sender_id) === String(user.id)) {
        setMessages((prev) => [...prev, msg]);
        if (String(msg.sender_id) !== String(user.id) && (conversationId || msg.conversation_id)) {
          const convId = conversationId || msg.conversation_id;
          socket.emit('message_delivered', { messageId: msg.id });
          socket.emit('mark_seen', { conversationId: convId });
        }
      }
    };
    const handleMessageSent = (msg) => {
      setMessages((prev) => [...prev, msg]);
    };

    const handleMessagesSeen = ({ conversationId: seenConvId }) => {
      const eventConvId = Number(seenConvId);
      setMessages((prev) =>
        prev.map((msg) =>
          sameId(msg.sender_id, user.id) && Number(msg.conversation_id) === eventConvId
            ? { ...msg, status: "seen" }
            : msg
        )
      );
    };
    const handleMessageEdited = (updatedMsg) => {
      setMessages((prev) =>
        prev.map((m) => (m.id === updatedMsg.id ? updatedMsg : m))
      );
    };

    const handleMessageDeleted = ({ messageId, updatedMessage, permanentlyDeleted }) => {
      if (permanentlyDeleted) {
        setMessages((prev) => prev.filter((m) => m.id !== messageId));
      } else if (updatedMessage) {
        setMessages((prev) =>
          prev.map((m) => (m.id === messageId ? updatedMessage : m))
        );
      }
    };

    const handleMessageStatusUpdated = ({ messageId, status }) => {
      setMessages((prev) =>
        prev.map((m) => (m.id === messageId ? { ...m, status } : m))
      );
    };

    const handleUserTyping = ({ userId: typingUserId, isTyping: typing }) => {
  if (Number(typingUserId) === Number(activeChat.id)) {
    setIsTyping(typing);
  }
};

    const handleReplyPreviewUpdate = ({ replyMessageId, newReplyPreview, newReplyGifPreview, deleted }) => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === replyMessageId
            ? {
                ...m,
                reply_preview: deleted ? 'Original message deleted' : (newReplyPreview || m.reply_preview),
                reply_gif_preview: deleted ? null : (newReplyGifPreview || m.reply_gif_preview),
              }
            : m
        )
      );
    };

    socket.on('new_message', handleNewMessage);
    socket.on('message_sent', handleMessageSent);
    socket.on('messages_seen', handleMessagesSeen);
    socket.on('message_edited', handleMessageEdited);
    socket.on('message_deleted', handleMessageDeleted);
    socket.on('message_status_updated', handleMessageStatusUpdated);
    socket.on('user_typing', handleUserTyping);
    socket.on('reply_preview_update', handleReplyPreviewUpdate);

    return () => {
      socket.off('new_message', handleNewMessage);
      socket.off('message_sent', handleMessageSent);
      socket.off('messages_seen', handleMessagesSeen);
      socket.off('message_edited', handleMessageEdited);
      socket.off('message_deleted', handleMessageDeleted);
      socket.off('message_status_updated', handleMessageStatusUpdated);
      socket.off('user_typing', handleUserTyping);
      socket.off('reply_preview_update', handleReplyPreviewUpdate);
    };
  }, [socket, activeChat, conversationId, user?.id]);

  useEffect(() => {
    if (activeChat) fetchMessages();
  }, [activeChat]);

  const handleSend = (content, gif, replyToId = null) => {
    if (!content && !gif) return;
    socket.emit('send_message', {
      toUserId: Number(activeChat.id),
      content: content || null,
      gifId: gif?.id || null,
      gifUrl: gif?.gif_url || null,
      replyToId,
    });
  };

  const handleEditMessage = (messageId, newContent, newGif) => {
    socket.emit('edit_message', {
      messageId,
      newContent: newContent || null,
      newGifId: newGif?.id || null,
      newGifUrl: newGif?.gif_url || null,
    });
  };

  const handleDeleteMessage = (messageId) => {
    socket.emit('delete_message', { messageId });
  };

  const confirmDeleteConversation = async () => {
    try {
      await api.delete(`/api/delete-conversation/${activeChat.id}`);
      localStorage.removeItem('sidebar_active_chat');
      toast.success('Conversation deleted');
      setActiveChat(null);
      window.location.reload();
    } catch (err) {
      toast.error('Failed to delete');
    }
  };
   const handleReportConversation = () => {
     navigate('/report-conversation', { state: { conversationId: activeChat.id, userId: activeChat.id } });
  };


  const handleTyping = (isUserTyping) => {
    if (!socket) return;
    socket.emit('typing', { toUserId: Number(activeChat.id), isTyping: isUserTyping });
    if (isUserTyping && typingTimeout) clearTimeout(typingTimeout);
    if (!isUserTyping) return;
    setTypingTimeout(
      setTimeout(() => {
        socket.emit('typing', { toUserId: Number(activeChat.id), isTyping: false });
      }, 4000)
    );
  };
  const items = [
    {
      key: '1',
      label: (
        <Popconfirm
          title="Delete Chat"
          description="Are you sure you want to delete this chat?"
          onConfirm={confirmDeleteConversation}
          icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
          okText="Delete"
          cancelText="No, Keep"
          okButtonProps={{
            style: { backgroundColor: 'red', borderColor: 'red', height: '30px', color: '#fff', borderRadius: '5px' },
          }}
          cancelButtonProps={{
            style: { backgroundColor: 'skyblue', height: '30px', color: '#fff', borderRadius: '5px' },
          }}
        >
          <DeleteOutlined /> Delete this Chat
        </Popconfirm>
      ),
    },
    {
      key: '2',
      label: (
        <span onClick={handleReportConversation}>
          <FlagOutlined /> Report this Chat
        </span>
      ),
    },
  ];

  return (
    <div className="chat-window">
      <div className="chat-header">
        <div className="chat-header-left">
          {window.innerWidth <= 1000 && (
            <button className="back-button" onClick={() => {
              setActiveChat(null);
              onBack();
              localStorage.removeItem('sidebar_active_chat');
            }
              }>
              <FontAwesomeIcon icon={faAngleLeft} />
            </button>
          )}
          <div className="chat-avatar-div">
            <img src={activeChat.avatar_url || "https://api.dicebear.com/9.x/adventurer/svg?seed=Felix"} alt={activeChat.username} className="chat-avatar" />
             {onlineUsers.includes(String(activeChat.id)) ? (
                    <div className='online-status-chat'></div>
                  ) : (
                    <div className='offline-status-chat'></div>
                  )}
          </div>
          <div className="chat-user-info">
            <span className="chat-username">{activeChat.username}</span>
            {isTyping && <div className="typing-indicator"><span></span><span></span><span></span></div>}
          </div>
        </div>
        <div className="chat-header-right" style={{ cursor: "pointer" }}>
          <Dropdown menu={{ items }} placement="bottom">
            <FontAwesomeIcon icon={faBarsStaggered} className='back-button' />
          </Dropdown>
        </div>
      </div>

      <div className="message-list" onScroll={handleScroll}>
        {loadingOlder && (
          <div style={{ textAlign: 'center', padding: '10px' }}>
            <Spin size="small" style={{color: 'var(--primary-color)'}}/>
          </div>
        )}
        <MessageList
          messages={messages}
          currentUserId={Number(user.id)}
          onReplyMessage={handleReply}
          onEditMessage={handleEdit}
          onDeleteMessage={handleDeleteMessage}
          scrollToBottomRef={messagesEndRef}
          loadingHistoryRef={loadingHistoryRef}
        />
      </div>

      <MessageInput
        onSend={handleSend}
        onTyping={handleTyping}
        replyTo={replyTo}
        setReplyTo={setReplyTo}
        editMessage={editMessage}
        setEditMessage={setEditMessage}
        onEditMessage={handleEditMessage}
      />
    </div>
  );
};

export default ChatWindow;