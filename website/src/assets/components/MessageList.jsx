import React, { useEffect } from 'react';
import { EnterOutlined } from '@ant-design/icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faCheckDouble } from '@fortawesome/free-solid-svg-icons';
import { Button, Dropdown, Popconfirm, message, Spin } from 'antd';
import { DeleteOutlined, FlagOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { faPenToSquare, faTrashCan, faShareFromSquare } from '@fortawesome/free-regular-svg-icons';
import { sameId } from '../page/util/sameId';

const MessageList = ({ messages, currentUserId, onReplyMessage, onEditMessage, onDeleteMessage, onReportMessage, scrollToBottomRef, loadingHistoryRef }) => {
  const getStatusIcon = (status) => {
    if (status === 'sent') return <FontAwesomeIcon icon={faCheck} />;
    if (status === 'delivered') return 'Delivered';
    if (status === 'seen') return <FontAwesomeIcon icon={faCheckDouble} style={{ color: 'yellowgreen' }} />;
    return '';
  };


  // Auto‑scroll to bottom when new messages arrive
  useEffect(() => {

  if (loadingHistoryRef?.current) {
    return;
  }

  scrollToBottomRef?.current?.scrollIntoView({
    behavior: "smooth",
    block: "end"
  });

}, [messages]);

  return (
    <>
      {messages.map((msg) => {
        const isMe = sameId(msg.sender_id, currentUserId);
        const isDeleted = msg.deleted_by_sender === 1;
        if (msg.deleted_by_sender && msg.deleted_by_recipient) return null;

        return (
          <div key={msg.id} className={`message-item ${isMe ? 'message-me' : 'message-other'}`}>
            {!isMe && <img src={msg.avatar_url || "https://api.dicebear.com/9.x/adventurer/svg?seed=Felix"} alt={msg.username} className="message-avatar" />}
            {isMe && (
              <div className="message-actions">
                <button className="message-action-btn" onClick={() => onEditMessage(msg)}>
                  <FontAwesomeIcon icon={faPenToSquare} />
                </button>
                <button className="message-action-btn" onClick={() => onDeleteMessage(msg.id)}>
                  <FontAwesomeIcon icon={faTrashCan} />
                </button>
              </div>
            )}
            <div className="message-bubble">
              {!isMe && <div className="message-username">{msg.username}</div>}
              {msg.reply_to_id && (
                <div className="message-reply-context">
                  <EnterOutlined style={{ transform: 'scaleX(-1)' }} />
                  {msg.reply_gif_preview && <img src={msg.reply_gif_preview} alt="gif" className="reply_gif_preview" />}
                  {msg.reply_preview || 'Reply to a message'}
                </div>
              )}
              {(msg.gif_url && !isDeleted) && <img src={msg.gif_url} alt="gif" className="message-gif" />}
              {isDeleted ? (
                <div className="message-deleted">{isMe ? 'You deleted this message' : 'This message was deleted'}</div>
              ) : (
                <div className="message-text">
                  {msg.content}
                  {msg.is_edited === 1 && <span className="message-edited">Edit*</span>}
                </div>
              )}
              <div className="message-footer">
                <span className="message-time">
                  {msg.created_at === 'Just now' ? 'Just now' : new Date(msg.created_at).toLocaleTimeString()}
                </span>
                {isMe && (
                  <span className="message-status" style={{ color: '#c3c3c3' }}>
                    {getStatusIcon(msg.status)}
                  </span>
                )}
              </div>
            </div>
            {!isMe && !isDeleted && (
              <div className="message-actions">
                <button className="message-action-btn" onClick={() => onReplyMessage(msg)}>
                  <FontAwesomeIcon icon={faShareFromSquare} /> <small>Reply</small>
                </button>
              </div>
            )}
          </div>
        );
      })}
      {/* This empty div triggers auto‑scroll */}
      <div ref={scrollToBottomRef} />
    </>
  );
};

export default MessageList;