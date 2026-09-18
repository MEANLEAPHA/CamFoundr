import React, { useState, useEffect, useCallback } from "react";
import "../style/page/Notifications.css";
import { 
  ClearOutlined, 
  DeleteOutlined, 
  HeartOutlined, 
  MessageOutlined, 
  UserAddOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  EditOutlined
} from "@ant-design/icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelopeOpen, faEllipsisVertical } from "@fortawesome/free-solid-svg-icons";
import { Dropdown } from "antd";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosInstance";
import { faBell } from "@fortawesome/free-regular-svg-icons";
import { useNotifications } from "../context/NotificationContext";
import nahideaIcon from '../img/nahideaIcon.png';
import nahideaIAuth from '../img/nahIdeaAuth.png';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const { unreadCount, setUnreadCount } = useNotifications();
  const [loading, setLoading] = useState(false);
  const [followStatuses, setFollowStatuses] = useState({});
  const navigate = useNavigate();

  // const getNotificationIcon = (type, avatar) => {
  //   const img = () => {
  //     return <img src={avatar || nahideaIcon} className='avatar-icon-type-noti' />
  //   }
  //   switch(type) {
  //     case 'comment_reply':
  //     case 'mention':
  //       return img();
  //     case 'comment_like':
  //     case 'post_like':
  //       return img();
  //     case 'answer_upvote':
  //       return img();
  //     case 'answer_downvote':
  //       return img();
  //     case 'answer':
  //       return img(); 
  //     case 'follow':
  //       return img();
  //     case 'follow_back':
  //       return img();
  //     default:
  //       return null;
  //   }
  // };
  const getNotificationIcon = (notification) => {
    if (Number(notification.is_anonymous) === 1) {
      return (
          <img
            src={nahideaIAuth}
            className="avatar-icon-type-noti"
            style={{backgroundColor: notification.anonymous_bg_color || "gold"}}
          />
      );
    }
    return (
      <img
        src={notification.sender_avatar || nahideaIcon}
        className="avatar-icon-type-noti"
      />
    );
  };
  const getNotificationActionIcon = (type, isViewed) => {
    if (!isViewed) {
      return <FontAwesomeIcon icon={faEnvelopeOpen} />;
    }
    return null;
  };

  // Check follow status for a specific user
  const checkFollowStatus = async (senderId) => {
    try {
      const res = await api.get(`/api/follow-status/${senderId}`);
      return res.data.state;
    } catch (err) {
      console.error("Error checking follow status:", err);
      return null;
    }
  };

  // Check follow statuses for all follow notifications
  const checkAllFollowStatuses = async (notificationsList) => {
    const statusMap = {};
    const followNotifications = notificationsList.filter(
      n => n.type === 'follow' && !n.is_viewed
    );
    
    for (const notification of followNotifications) {
      const status = await checkFollowStatus(notification.sender_id);
      if (status) {
        statusMap[notification.sender_id] = status;
      }
    }
    
    setFollowStatuses(statusMap);
  };

  const getNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/notifications/get-all');
      setNotifications(res.data.notifications);
      setUnreadCount(res.data.unreadCount);
      await checkAllFollowStatuses(res.data.notifications);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }, [setUnreadCount]);

  useEffect(() => {
    getNotifications();
  }, [getNotifications]);

  const markAsRead = async (notificationId) => {
    try {  
      const res = await api.patch(`/api/notifications/${notificationId}/read`, {});
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, is_viewed: 1 }
            : notif
        )
      );
      setUnreadCount(res.data.unreadCount);
      toast.success("Marked as read");
    } catch (err) {
      console.error(err);
      toast.error("Failed to mark as read");
    }
  };

  const markAllAsRead = async () => {
    try {
      const res = await api.patch(
        `/api/notifications/mark-all-read`, {}
      )
      
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, is_viewed: 1 }))
      );
      setUnreadCount(res.data.unreadCount);
      toast.success("All notifications marked as read");
    } catch (err) {
      console.error(err);
      toast.error("Failed to mark all as read");
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      const res = await api.delete(`/api/notifications/${notificationId}`); 
      setNotifications(prev => 
        prev.filter(notif => notif.id !== notificationId)
      );
      setUnreadCount(res.data.unreadCount);
      toast.success("Notification deleted");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete notification");
    }
  };

  const deleteAllNotifications = async () => {
    if (!window.confirm("Delete all notifications? This can't be undone.")) return;
    try {
      const res = await api.delete(`/api/notifications/delete-all`);
      setNotifications([]);
      setUnreadCount(res.data.unreadCount);
      toast.success("All notifications deleted");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete all notifications");
    }
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.is_viewed) {
      await markAsRead(notification.id);
    }
    
    switch(notification.type) {
      case 'comment':
      case 'comment_reply':
      case 'mention':
        if (notification.post_id) {
          const commentHash = notification.comment_id ? `#${notification.comment_id}` : '';
          navigate(`/aboutpost/${notification.post_id}${commentHash}`);
        }
        break;
      case 'comment_like':
      case 'post_like':
        if (notification.post_id) {
          const commentHash = notification.comment_id ? `#${notification.comment_id}` : '';
          navigate(`/aboutpost/${notification.post_id}${commentHash}`);
        }
        break;
      case 'answer_upvote':
      case 'answer_downvote':
        if (notification.post_id && notification.answer_id) {
          navigate(`/aboutpost/${notification.post_id}#answer-${notification.answer_id}`);
        } else if (notification.post_id) {
          navigate(`/aboutpost/${notification.post_id}#answers-section`);
        }
        break;
      case 'answer':
        if (notification.post_id && notification.answer_id) {
          navigate(`/aboutpost/${notification.post_id}#answer-${notification.answer_id}`);
        } else if (notification.post_id) {
          navigate(`/aboutpost/${notification.post_id}#answers-section`);
        }
        break;
      case 'follow':
      case 'follow_back':
        if (notification.sender_id) {
          navigate(`/accounts`, { state: { userId: notification.sender_id } });
        }
        break;
      default:
        if (notification.post_id) {
          navigate(`/aboutpost/${notification.post_id}`);
        }
    }
  };

  const followBack = async (senderName, senderId, notificationId) => {
    try { 
      const res = await api.post(`/api/add-follow/${senderId}`, {});
      if (res.data.success) {
        // Update follow status for this user
        setFollowStatuses(prev => ({
          ...prev,
          [senderId]: res.data.mutual ? 'mutual' : 'following'
        }));
        
        // Update the notification
        setNotifications(prev => 
          prev.map(notif => 
            notif.id === notificationId 
              ? { 
                  ...notif, 
                  type: res.data.mutual ? 'follow_back' : 'follow',
                  content: res.data.mutual ? `You and ${senderName} are now friends` : `${senderName} started following you`
                }
              : notif
          )
        );
        
        toast.success(res.data.mutual ? "You are now friends!" : "Followed successfully!");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to follow back");
    }
  };

  const getDropdownItems = (notification) => {
    const items = [];

    if (!notification.is_viewed) {
      items.push({
        label: <li>Mark as read</li>,
        key: "mark",
        onClick: () => markAsRead(notification.id),
      });
    }

    items.push({
      label: <li>Delete</li>,
      key: "delete",
      onClick: () => deleteNotification(notification.id),
    });

    return { items };
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  // Check if follow back button should be shown
  const shouldShowFollowBackButton = (notification) => {
    if (notification.type !== 'follow') return false;
    if (notification.is_viewed) return false;
    
    const status = followStatuses[notification.sender_id];
    // Don't show button if already following or mutual
    return status !== 'following' && status !== 'mutual';
  };

  // Get notification content text
  const getNotificationContent = (notification) => {
    if (notification.content) {
      return notification.content; // backend already builds this with the correct display name
    }

    const senderName = notification.is_anonymous
      ? notification.anonymous_name || "Anonymous"
      : notification.sender_username || "Someone";

    switch (notification.type) {
      case "comment":
        return `${senderName} comment to your post`;
      case "comment_reply":
        return `${senderName} replied to your comment`;
      case "comment_like":
        return `${senderName} liked your comment`;
      case "answer":
        return `${senderName} answered your question`;
      case "post_like":
        return `${senderName} liked your post`;
      case "mention":
        return `${senderName} mentioned you`;
      case "answer_upvote":
        return `${senderName} upvoted your answer`;
      case "answer_downvote":
        return `${senderName} downvoted your answer`;
      case "follow":
        return `${senderName} started following you`;
      case "follow_back":
        return `${senderName} followed you back`;
      default:
        return `${senderName} interacted with your content`;
    }
  };

  return (
    <div className="notification-panel">
      {/* Header */}
      <div className="notification-header">
        <div className='head-left'>
          <h3><FontAwesomeIcon icon={faBell} /> Notifications</h3>
          {unreadCount > 0 && (
            <div id='unread-badge'>{unreadCount}</div>
          )}
        </div>
        <div className='mark-div'>
          <button 
            className="mark-read-btn" 
            onClick={deleteAllNotifications}
            disabled={notifications.length === 0}
          >
           Clear all
          </button>
          |
          <button 
            className="mark-read-btn" 
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
          >
            Mark all as read
          </button>
          |
          <button 
            className="refresh-btn" 
            onClick={getNotifications}
            disabled={loading}
          >
            ↻ {loading ? '...' : ''}
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="notification-list">
        {loading && notifications.length === 0 ? (
          <div className="loading-state">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="empty-state">No notifications yet</div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className='notification-card'
              onClick={() => handleNotificationClick(notification)}
              style={{ cursor: 'pointer' }}
            >
              <div className="notification-left">
                <div
                  className='status-icon-unread'
                  style={{ 
                    backgroundColor: notification.is_viewed ? 'grey' : '#1890ff'
                  }}
                />
                <div className="notification-body">
                  <div className="notification-title-avatar">
                    {getNotificationIcon(notification)}
                  </div>
                  <div className="notification-title-div">
                    <div className="notification-title">
                      {getNotificationContent(notification)}
                      
                      {/* Follow back button - only show if user is not already following back */}
                      {shouldShowFollowBackButton(notification) && (
                        <button 
                          className='followbackBtn'
                          onClick={(e) => {
                            e.stopPropagation();
                            followBack(notification.sender_username,notification.sender_id, notification.id);
                          }}
                        >
                          Follow back
                        </button>
                      )}
                    </div>
                    <div className="notification-title-time">
                      {formatTime(notification.created_at)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="notification-actions">
                <button
                  className="icon-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    markAsRead(notification.id);
                  }}
                  title="Mark as read"
                >
                  {getNotificationActionIcon(notification.type, notification.is_viewed)}
                </button>
                <button
                  className="icon-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNotification(notification.id);
                  }}
                  title="Delete"
                >
                  <DeleteOutlined />
                </button>
                <Dropdown 
                  menu={getDropdownItems(notification)} 
                  trigger={["click"]}
                >
                  <div className="noti-header-right" onClick={(e) => e.stopPropagation()}>
                    <FontAwesomeIcon icon={faEllipsisVertical} className="icon-formore-comm" />
                  </div>
                </Dropdown>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
