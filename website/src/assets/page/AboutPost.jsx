// React State
import React, { useState, useEffect, useRef, memo} from 'react';
import { useParams, useOutletContext, useNavigate, useLocation } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import toast from "react-hot-toast";

// style
import "../style/page/Aboutpost.css";
import "../style/page/Home.css";
import "../style/upload/MultipleMedia.css";
import "../style/upload/Postpreview.css";

// lucide
import { Heart, Bookmark, ArrowUp, ArrowDown, BarChart3} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// fontawesome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleDown, faAngleUp, faMartiniGlassEmpty, faPen, faEllipsis } from '@fortawesome/free-solid-svg-icons';
import { faCircle } from '@fortawesome/free-regular-svg-icons';

// antd
import { Typography, Dropdown, Spin } from "antd";
import { BorderOutlined, CheckOutlined, CloseOutlined, DeleteOutlined, EditOutlined, EnterOutlined, FlagOutlined, LeftOutlined, LinkOutlined } from '@ant-design/icons';
const { Text } = Typography;

// util
import {iconOptions} from "../data/post_type_data";
import { MediaPreview } from "../util/mediaUploader";
import DotDropDown from './util/dotDropDown';
import Rule from "../util/upload/Rule";
import { useUserRanking } from "./util/useUserRanking";
import RankBadge from "../components/RankBadge";

// img
import nahIdeaAuth from "../img/nahIdeaAuth.png";
import nahideaIcon from '../img/nahideaIcon.png';

// token api
import api from "../api/axiosInstance";

// Helper
const parseJSON = (val) => {
  try {
    return typeof val === "string" ? JSON.parse(val) : val;
  } catch {
    return [];
  }
};

const timeAgo = (timestamp) => {
  if (!timestamp) return 'just now';
  
  const now = new Date();
  const past = new Date(timestamp);
  const seconds = Math.floor((now - past) / 1000);
  
  if (seconds < 60) return `${seconds} seconds ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months > 1 ? 's' : ''} ago`;
  const years = Math.floor(days / 365);
  return `${years} year${years > 1 ? 's' : ''} ago`;

};

const calculateAverageAnswer = (answers, questionType) => {
  if (!answers || answers.length === 0) return null;

  switch (questionType) {
    case 'closedend': {
      const yesCount = answers.filter(a => a.yes_no === 'yes').length;
      const noCount = answers.filter(a => a.yes_no === 'no').length;
      const total = answers.length;
      return {
        type: 'closedend',
        yes: {
          count: yesCount,
          percentage: Math.round((yesCount / total) * 100)
        },
        no: {
          count: noCount,
          percentage: Math.round((noCount / total) * 100)
        },
        total
      };
    }

    case 'rating': {
      const total = answers.length;
      const sum = answers.reduce((acc, a) => acc + (a.rating_value || 0), 0);
      const average = (sum / total).toFixed(1);
      // Count distribution
      const distribution = {};
      answers.forEach(a => {
        const val = a.rating_value || 0;
        distribution[val] = (distribution[val] || 0) + 1;
      });
      return {
        type: 'rating',
        average: parseFloat(average),
        total,
        distribution: Object.keys(distribution).sort().map(key => ({
          value: parseInt(key),
          count: distribution[key],
          percentage: Math.round((distribution[key] / total) * 100)
        }))
      };
    }

    case 'singlechoice': {
      const counts = {};
      answers.forEach(a => {
        const val = a.singlechoice_option_value || 'Unknown';
        counts[val] = (counts[val] || 0) + 1;
      });
      const total = answers.length;
      const sorted = Object.keys(counts).sort((a, b) => counts[b] - counts[a]);
      return {
        type: 'singlechoice',
        total,
        choices: sorted.map(key => ({
          label: key,
          count: counts[key],
          percentage: Math.round((counts[key] / total) * 100)
        }))
      };
    }

    case 'multiplechoice': {
      const counts = {};
      answers.forEach(a => {
        const values = parseJSON(a.multiplechoice_option_value) || [];
        values.forEach(val => {
          counts[val] = (counts[val] || 0) + 1;
        });
      });
      const total = answers.length;
      const sorted = Object.keys(counts).sort((a, b) => counts[b] - counts[a]);
      return {
        type: 'multiplechoice',
        total,
        choices: sorted.map(key => ({
          label: key,
          count: counts[key],
          percentage: Math.round((counts[key] / total) * 100)
        }))
      };
    }

    case 'rankingorder': {
      if (!answers.length) {
        return { type: 'rankingorder', total: 0, items: [] };
      }

      const positionMap = {}; // keyed by item id

      answers.forEach(a => {
        const ids = parseJSON(a.ranking_positions) || [];
        const labels = parseJSON(a.ranking_position_value) || [];

        ids.forEach((id, idx) => {
          const position = idx + 1; // array order IS the ranked position, 1-based
          const label = labels[idx] ?? id; // fall back to id if label missing for some reason

          if (!positionMap[id]) {
            positionMap[id] = { sum: 0, count: 0, label };
          }
          positionMap[id].sum += position;
          positionMap[id].count += 1;
        });
      });

      const sorted = Object.keys(positionMap).sort((a, b) => {
        const avgA = positionMap[a].sum / positionMap[a].count;
        const avgB = positionMap[b].sum / positionMap[b].count;
        return avgA - avgB;
      });

      return {
        type: 'rankingorder',
        total: answers.length,
        items: sorted.map(id => ({
          label: positionMap[id].label,
          avgPosition: (positionMap[id].sum / positionMap[id].count).toFixed(1)
        }))
      };
    }

   case 'range': {
      const total = answers.length;
      const values = answers.map(a => Number(a.range_value) || 0); // normalize once, reuse everywhere
      const sum = values.reduce((acc, v) => acc + v, 0);
      const average = total > 0 ? (sum / total).toFixed(1) : "0.0";
      const min = total > 0 ? Math.min(...values) : 0;
      const max = total > 0 ? Math.max(...values) : 0;
      return {
        type: 'range',
        average: parseFloat(average),
        min,
        max,
        total
      };
    }

    case 'openend': {
      null
    }

    default:
      return null;
  }
};

// render component
const AverageAnswerDisplay = ({ averageData, questionType, ratingIcon }) => {
  if (!averageData) return null;

  const renderContent = () => {
    switch (questionType) {
      case 'closedend':
        return (
          <div className="average-closedend">
            <div className="average-bar-container">
              <div className="average-bar-label">
                <span><CheckOutlined />  Yes</span>
                <span>{averageData.yes.count} ({averageData.yes.percentage}%)</span>
              </div>
              <div className="average-bar-track">
                <div 
                  className="average-bar-fill yes-fill" 
                  style={{ width: `${averageData.yes.percentage}%` }}
                />
              </div>
            </div>
            <div className="average-bar-container">
              <div className="average-bar-label">
                <span><CloseOutlined />  No</span>
                <span>{averageData.no.count} ({averageData.no.percentage}%)</span>
              </div>
              <div className="average-bar-track">
                <div 
                  className="average-bar-fill no-fill" 
                  style={{ width: `${averageData.no.percentage}%` }}
                />
              </div>
            </div>
            <div className="average-total-votes">
              {averageData.total} total vote{averageData.total > 1 ? 's' : ''}
            </div>
          </div>
        );

      case 'rating':
        return (
          <div className="average-rating">
            <div className="average-rating-score">
              <span className="avg-score">{averageData.average}</span>
              <span className="avg-out-of">/ 5</span>
            </div>
            <div className="average-rating-distribution">
              {averageData.distribution.map(item => (
                <div key={item.value} className="rating-distribution-row">
                  <span className="rating-value">{item.value}</span>
                  <div className="rating-bar-track">
                    <div 
                      className="rating-bar-fill" 
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                  <span className="rating-count">{item.count}</span>
                </div>
              ))}
            </div>
            <div className="average-total-votes">
              {averageData.total} total rating{averageData.total > 1 ? 's' : ''}
            </div>
          </div>
        );

      case 'singlechoice':
      case 'multiplechoice':
        return (
          <div className="average-choices">
            {averageData.choices.map((choice, idx) => (
              <div key={idx} className="choice-bar-container">
                <div className="choice-bar-label">
                  <span>{choice.label}</span>
                  <span>{choice.count} ({choice.percentage}%)</span>
                </div>
                <div className="choice-bar-track">
                  <div 
                    className="choice-bar-fills" 
                    style={{ 
                      width: `${choice.percentage}%`
                    }}
                  />
                </div>
              </div>
            ))}
            <div className="average-total-votes">
              {averageData.total} total response{averageData.total > 1 ? 's' : ''}
            </div>
          </div>
        );

      case 'rankingorder':
        return (
          <div className="average-ranking">
            {averageData.items.map((item, idx) => (
              <div key={idx} className="ranking-item">
                <span className="ranking-position">{idx + 1}. </span>
                <span className="ranking-label"> {item.label}</span>
                <span className="ranking-avg">Avg: {item.avgPosition}</span>
              </div>
            ))}
            <div className="average-total-votes">
              {averageData.total} total ranking{averageData.total > 1 ? 's' : ''}
            </div>
          </div>
        );

      case 'range':
        return (
          <div className="average-range">
            <div className="range-stats">
              <span>Min: {averageData.min}</span>
              <span>Average: {averageData.average}</span>
              <span>Max: {averageData.max}</span>
            </div>
            <div className="average-total-votes">
              {averageData.total} total response{averageData.total > 1 ? 's' : ''}
            </div>
          </div>
        );

      case 'openend':
        return (
          null
        );

      default:
        return null;
    }
  };

  return (
    <div className="average-answer-container">
      <div className="average-answer-header">
        <BarChart3 size={18} />
        <span>Analytic Answer</span>
      </div>
      <div className="average-answer-body">
        {renderContent()}
      </div>
    </div>
  );
};

const AnswerCard = memo(({ answer, onUpvote, onDownvote, isVoting, highlightedAnswerId, ratingIcon }) => {
  const navigate = useNavigate();
  const renderAnswerContent = () => {
    switch (answer.question_type) {
      case 'openend':
        return <div className="answer-choice-badge"><EnterOutlined style={{transform: 'scaleX(-1)', fontSize: "15px",}}/> {answer.text_answer}</div>;
      case 'closedend':
        return (
          <div className={`${answer.yes_no === 'yes' ? 'answer-yess' : 'answer-nos'}`}>
            <EnterOutlined style={{transform: 'scaleX(-1)', fontSize: "15px",}}/>
            {answer.yes_no === 'yes' ? 'Yes' : 'No'}
          </div>
        );
      case 'rating':
        return (
          <div className="answer-rating">
            <EnterOutlined style={{transform: 'scaleX(-1)', fontSize: "15px",}}/>
            {
              Array.from({ length: answer.rating_value || 0 }).map((_, i) => (
                <FontAwesomeIcon 
                  key={`${answer.id}-${i}`} 
                  icon={iconOptions.find((opt) => opt.id === ratingIcon)?.icon}
                  style={{ fontSize: "20px", color: "var(--primary-color)" }}
                />
              ))
            }
          </div>
        );
      case 'singlechoice':
        return (
          <div className="answer-choice-badge">
            <EnterOutlined style={{transform: 'scaleX(-1)', fontSize: "15px"}}/> {answer.singlechoice_option_value}
          </div>
        );
      case 'multiplechoice': {
        const choices = parseJSON(answer.multiplechoice_option_value);
        return (
          <div className='answer-multiple'>
          <EnterOutlined style={{transform: 'scaleX(-1)', fontSize: "15px",}}/>
          <div className="answer-choices">
            {choices.map((choice, idx) => (
              <span key={idx} className="answer-choice-badge"> {choice}</span>
            ))}
          </div>
          </div>
        );
      }
      case 'range':
        return (
          <div className="answer-range">
            <EnterOutlined style={{transform: 'scaleX(-1)', fontSize: "15px",}}/> {answer.range_value}
          </div>
        );
      case 'rankingorder':
        const rankingItems = parseJSON(answer.ranking_position_value);
        return (
          <div className='answer-multiple'>
          <EnterOutlined style={{transform: 'scaleX(-1)', fontSize: "15px",}}/>
          <div className="answer-ranking">
         
             {
               rankingItems.map((item, idx) => (
                 <div key={idx} className="ranking-item">
                   <span className="ranking-position">{idx + 1}. </span>
                   <span className="ranking-label">{item}</span>
                 </div>
               ))
             }
          </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div 
      className={`answer-card ${highlightedAnswerId === answer.id ? 'highlight-comment' : ''}`}
      id={`answer-${answer.id}`}
    >
      <div className="answer-header">
        <div className="answer-author">
          <div 
            className="answer-avatar" 
            style={{ background: answer.author_bg_color || '#999' }}
          >
            <img src={answer.is_anonymous === 1 ? nahIdeaAuth : (answer.avatar_url || nahideaIcon)} alt="avatar" className="avatar-image"  style= {{cursor: answer.is_anonymous === 1 ? 'none' : 'pointer'}}/>
          </div>
          <div className="answer-author-info">
            <span className="answer-author-name" 
              onClick ={answer.is_anonymous !== 1 ? () => navigate(`/accounts`, { state: {userId: answer.user_id}}) : null} style= {{cursor: answer.is_anonymous === 1 ? 'none' : 'pointer'}}>
                {answer.author_name || 'Anonymous'}
                <PostAuthorBadgeCm userId={answer.user_id} isAnonymous={answer.is_anonymous === 1} />
            </span>
            <span className="answer-time">{timeAgo(answer.created_at)}</span>
          </div>
        </div>
      </div>
      
      <div className="answer-body">
        {renderAnswerContent()}
      </div>
      
      <div className="answer-footer">
        <AnswerVoteButton
          voteScore={answer.vote_score || 0}
          userVote={answer.user_vote_type}
          onUpvote={onUpvote}
          onDownvote={onDownvote}
          isVoting={isVoting}
        />
      </div>
    </div>
  );
});

const AnswerVoteButton = memo(({ voteScore, userVote, onUpvote, onDownvote, isVoting }) => {
  return (
    <div className="answer-vote-container">
      <button 
        className={`answer-vote-btn upvote ${userVote === 'upvote' ? 'active' : ''}`}
        onClick={onUpvote}
        disabled={isVoting}
      >
        <ArrowUp size={16} />
      </button>
      <span className="answer-vote-score">{voteScore}</span>
      <button 
        className={`answer-vote-btn downvote ${userVote === 'downvote' ? 'active' : ''}`}
        onClick={onDownvote}
        disabled={isVoting}
      >
        <ArrowDown size={16} />
      </button>
    </div>
  );
});

const CommentLikeButton = memo(({ isLiked, likesCount, onLike, isAnimating }) => {
  return (
    <button
      className={`comment-like-button ${isLiked ? "liked" : ""}`}
      type="button"
      style={{cursor: 'pointer'}}
      onClick={onLike}
    >
      <motion.div
        className="action-icon-wrapper"
        whileTap={{ scale: 0.75 }}
        animate={isAnimating ? { scale: [1, 1.35, 1], rotate: [0, -15, 15, 0] } : {}}
        transition={{ duration: 0.45, ease: "easeInOut" }}
      >
        <AnimatePresence mode="wait">
          {isLiked ? (
            <motion.div
              key="liked"
              initial={{ scale: 0.4, opacity: 0, rotate: -25 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={{ scale: 0.4, opacity: 0, rotate: 25 }}
              transition={{ type: "spring", stiffness: 500, damping: 22 }}
            >
              <Heart size={16} className="comment-like-icon liked-heart" fill="currentColor" />
            </motion.div>
          ) : (
            <motion.div
              key="unliked"
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.4, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Heart size={16} className="comment-like-icon" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      <span style={{margin: 0}}>{likesCount}</span>
    </button>
  );
});

const CommentCard = memo(({ c, postType, is_anonymous, isReply, postId, expandedReplies, onToggleReplies, onLikeComment, onReplyClick, highlightedId, timeAgoFn, renderNameFn, renderColorFn, renderAvatarFn, likingCommentId, onDeleteComment }) => {
  const isExpanded = expandedReplies[c.id];
  
  const navigate = useNavigate();

  return (
    <div
      className={`
        comment
        ${isReply ? "reply" : ""}
        ${String(highlightedId) === String(c.id) ? "highlight-comment" : ""}
      `}
      id={c.id}
    >
    <div className="avatar" style={{ background: renderColorFn(c), cursor: is_anonymous === 1 ? 'none' : 'pointer' }} onClick = {Number(is_anonymous) !== 1 ? () => navigate('/accounts', { state: {userId: c.user_id}}) : null}>
      <img src={renderAvatarFn(c)} alt="avatar" className="avatar-image"/>
    </div>

      <div className="comment-body">
        <div className="comment-header">
          <div className="comment-name-wrapper">
            <b className="comment-name" onClick = {Number(is_anonymous) !== 1 ? () => navigate('/accounts', { state: {userId: c.user_id}}) : null} style= {{cursor: is_anonymous === 1 ? 'none' : 'pointer'}}>{renderNameFn(c)}</b><PostAuthorBadgeCm userId={c.user_id} isAnonymous={is_anonymous === 1} />
          </div>
          <CommentDropDown 
            ownerId={c.user_id} 
            comm_id={c.id} 
            postType={postType}
            comm_text={c.content} 
            comm_gif={c.gif_url} 
            post_id={postId}
            onDelete={() => onDeleteComment?.()}
          />
        </div>

        <div className="comment-text">
          {c.username_mention && (
            <span style={{ color: 'skyblue', cursor: 'none' }} className='comm-mention-name'>@{c.username_mention} </span>
          )}
          <span className='comm-content'>{c.content}
            {c.is_edited === 1 && !c.is_deleted && (
              <span className="edited-badge">
                 Edited*
              </span>
            )}
          </span>
        </div>

        {c.gif_url && (
          <div className="comment-gif">
            <img src={c.gif_url} alt="gif" className="gif-com" />
          </div>
        )}

        <div className="comment-actions">
          {c.is_deleted === 0 && (
            <div className="comment-actions-left">
              <CommentLikeButton
                isLiked={c.is_liked}
                likesCount={c.likes_count}
                onLike={(e) => {
                  e.preventDefault();
                  onLikeComment(c.id);
                }}
                isAnimating={likingCommentId === c.id}
              />
              <span onClick={() => onReplyClick(c)} className='btn-cursor' style={{ margin: 0 }}>
                Reply
              </span>
            </div>
          )}
          <div className="comment-actions-right">
            <span className="comment-time">
              {c.is_edited === 1 ? timeAgoFn(c.updated_at) : timeAgoFn(c.created_at)}
            </span>
          </div>
        </div>

        {c.replies?.length > 0 && (
          <div className="reply-section">
            <button className="reply-toggle" onClick={() => onToggleReplies(c.id)}>
              {isExpanded ? (
                <span className="hide-replies arrow-reply">
                  <FontAwesomeIcon icon={faAngleUp} /> Hide replies
                </span>
              ) : (
                <span className="show-replies arrow-reply">
                  <FontAwesomeIcon icon={faAngleDown} /> View {c.replies.length} replies
                </span>
              )}
            </button>

            {isExpanded && c.replies.map(r => (
              <CommentCard 
                key={r.id} 
                c={r} 
                postType = {postType}
                is_anonymous = {r.is_anonymous}
                isReply={true}
                postId={postId}
                expandedReplies={expandedReplies}
                onToggleReplies={onToggleReplies}
                onLikeComment={onLikeComment}
                onReplyClick={onReplyClick}
                highlightedId={highlightedId}
                timeAgoFn={timeAgoFn}
                renderNameFn={renderNameFn}
                renderColorFn={renderColorFn}
                renderAvatarFn={renderAvatarFn}
                likingCommentId={likingCommentId}
                onDeleteComment={onDeleteComment}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
});

const CommentDropDown = ({ ownerId, comm_id, comm_text, comm_gif, post_id, postType, onDelete }) => {
  const { user } = useOutletContext();
  const navigate = useNavigate();

  const handleDelete = async () => {
    const confirmed = window.confirm(
        "Are you sure you want to delete this comment? This can't be undone."
    );
  if (!confirmed) return;
    try {
      const res = await api.delete(`/api/comments/${comm_id}/${post_id}`);
      if(res.status === 200) {
        toast.success("Comment deleted");
        onDelete?.()
      };
     
    } catch (err) {
      console.error(err);
    }
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}${window.location.pathname}#${comm_id}`;
    navigator.clipboard.writeText(url);
    toast.success("Copied");
  };

  const isOwner = Number(ownerId) === Number(user?.id);

  const menuItemsForAll = [
    {
      label: <li onClick={handleCopyLink}><LinkOutlined /> Copy link</li>,
      key: "0",
    },
    {
      label: (
        <li onClick={() => navigate('/report', { state: { commentId: comm_id, userId: ownerId } })}>
          <FlagOutlined /> Report
        </li>
      ),
      key: "1",
    },
  ];

  const menuItemsForOwner = [
    {
      label: (
        <li onClick={() => {
          navigate("/comment", {
            state: { 
              postId: post_id, 
              commentId: comm_id, 
              content: comm_text, 
              gif_url: comm_gif, 
              postType: postType,
              mode: "edit" 
            },
          });
        }}>
          <EditOutlined /> Edit
        </li>
      ),
      key: "0",
    },
    {
      label: (
        <li onClick={handleDelete}>
          <DeleteOutlined /> Delete
        </li>
      ),
      key: "1",
    },
    {
      label: <li onClick={handleCopyLink}><LinkOutlined /> Copy link</li>,
      key: "2",
    },
    {
      label: (
        <li onClick={() => navigate('/report', { state: { commentId: comm_id, userId: ownerId } })}>
          <FlagOutlined /> Report
        </li>
      ),
      key: "3",
    },
  ];

  return (
    <Dropdown
      menu={{ items: isOwner ? menuItemsForOwner : menuItemsForAll }}
      trigger={["click"]}
      classNames={{ root: "profile-dropdown" }}
    >
      <div className="comm-header-right">
        <FontAwesomeIcon icon={faEllipsis} className="icon-formore-comm" style={{cursor: 'pointer'}}/>
      </div>
    </Dropdown>
  );
};


const AboutPost = () => {
  const navigate = useNavigate();
  const location = useLocation();


  const { user } = useOutletContext();
  const { id } = useParams();

  const [post, setPost] = useState(null);
  const [likingPosts, setLikingPosts] = useState(false);
  const [likingCommentId, setLikingCommentId] = useState(null);
  const [favoritingPosts, setFavoritingPosts] = useState(false);

  const [comments, setComments] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [averageData, setAverageData] = useState(null);
  const [votingAnswerId, setVotingAnswerId] = useState(null);

  const [page, setPage] = useState(1);
  const [answerPage, setAnswerPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [hasMoreAnswers, setHasMoreAnswers] = useState(true);
  const [loadingComments, setLoadingComments] = useState(false);
  const [loadingAnswers, setLoadingAnswers] = useState(false);

  const [expandedReplies, setExpandedReplies] = useState({});
  const [highlightedId, setHighlightedId] = useState(null);
  const [highlightedAnswerId, setHighlightedAnswerId] = useState(null);
  const [selectedTab, setSelectedTab] = useState(1);

  const observerRef = useRef(null);
  const answerObserverRef = useRef(null);
  const targetCommentId = useRef(null);
  const targetAnswerId = useRef(null);
  const hasScrolledToHash = useRef(false);
  const commentsFetched = useRef(false);
  const answersFetched = useRef(false);

  // Initial load
  useEffect(() => {
    setPost(null);
    setComments([]); setAnswers([]); setAverageData(null);
    setPage(1); setAnswerPage(1);
    setHasMore(true); setHasMoreAnswers(true);
    setSelectedTab(1);
    commentsFetched.current = false;
    answersFetched.current = false;
    hasScrolledToHash.current = false;
    targetCommentId.current = null;
    targetAnswerId.current = null;

    handleFetchPost();
    handleView();
    handleHistory();
  }, [id]);

  // Parse location hash for scrolling
  useEffect(() => {
    if (location.hash) {
      const hash = location.hash.replace("#", "");
      if (hash.startsWith('answer-')) {
        targetAnswerId.current = hash.replace('answer-', '');
        targetCommentId.current = null;
      } else {
        targetCommentId.current = hash;
        targetAnswerId.current = null;
      }
    }
  }, [location]);

  // Auto scroll to answer or comment
  useEffect(() => {
    if (hasScrolledToHash.current) return;

    if (targetAnswerId.current && answers.length > 0) {
      const answerId = targetAnswerId.current;
      const found = answers.some(a => String(a.id) === String(answerId));
      
      if (found) {
        setSelectedTab(1);
        setTimeout(() => {
          const el = document.getElementById(`answer-${answerId}`);
          if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "center" });
            hasScrolledToHash.current = true;
            setHighlightedAnswerId(answerId);
            setTimeout(() => setHighlightedAnswerId(null), 4000);
          }
        }, 500);
      }
    } else if (targetCommentId.current && comments.length > 0) {
      const commentId = targetCommentId.current;
      let found = false;
      
      comments.forEach(comment => {
        if (String(comment.id) === commentId) {
          found = true;
        }
        comment.replies?.forEach(reply => {
          if (String(reply.id) === commentId) {
            found = true;
            setExpandedReplies(prev => ({ ...prev, [comment.id]: true }));
          }
        });
      });
      
      if (found) {
        setSelectedTab(2);
        setTimeout(() => {
          const el = document.getElementById(commentId);
          if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "center" });
            hasScrolledToHash.current = true;
            setHighlightedId(commentId);
            setTimeout(() => setHighlightedId(null), 4000);
          }
        }, 500);
      }
    }
    else {
  
    const hash = window.location.hash.replace("#", "");
    if (hash === "comments") {
      setSelectedTab(2);
      setTimeout(() => {
        const el = document.getElementById("comments-section");
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
          hasScrolledToHash.current = true;
        }
      }, 500);
    }
  }
    
  }, [answers, comments]);

  // Infinite scroll for comments
  useEffect(() => {
    if (selectedTab !== 2) return;
    
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loadingComments) {
         fetchComments(page + 1, true);
        }
      },
      { threshold: 1 }
    );

    if (observerRef.current) observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [page, hasMore, loadingComments, selectedTab]);

  // Infinite scroll for answers
  useEffect(() => {
    if (selectedTab !== 1) return;
    
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMoreAnswers && !loadingAnswers && post?.post_type === 'question') {
          fetchAnswers(answerPage + 1);
        }
      },
      { threshold: 1 }
    );

    if (answerObserverRef.current) observer.observe(answerObserverRef.current);
    return () => observer.disconnect();
  }, [answerPage, hasMoreAnswers, loadingAnswers, selectedTab, post]);

  // Calculate average when answers change
  useEffect(() => {
    if (answers.length > 0 && post?.post_type === 'question') {
      const data = calculateAverageAnswer(answers, post?.data?.question_type);
      setAverageData(data);
    }
  }, [answers, post]);

  // Fetch data when tab changes
  useEffect(() => {
    if (post?.post_type === 'question') {
      if (selectedTab === 1 && !answersFetched.current) {
        fetchAnswers(1);
        answersFetched.current = true;
      } else if (selectedTab === 2 && !commentsFetched.current) {
        fetchComments(1, true);
        commentsFetched.current = true;
      }
    } else {
      if (!commentsFetched.current) {
        fetchComments(1, true);
        commentsFetched.current = true;
      }
    }
  }, [selectedTab, post]);

 
  const handleView = async () => {
    try {
      await api.post(`/api/record-view-post/${id}`, {});
    } catch (err) {
      console.error(err);
    }
  };

  const handleHistory = async () => {
    try {
      await api.post(`/api/history-post/${id}`, {});
    } catch (err) {
      console.error(err);
    }
  };

  const handleFetchPost = async () => {
    try {
      const res = await api.get(`/api/get-posts/${id}`);
      const data = res.data.data;
      setPost(data);
    } catch (err) {
      console.error(err);
      setPost(null);
    }
  };

  const fetchAnswers = async (pageNum = 1) => {
    if (loadingAnswers || !hasMoreAnswers || post?.post_type !== 'question') return;

    try {
      setLoadingAnswers(true);
      const res = await api.get(`/api/answers/question/${post?.data?.id}?page=${pageNum}&limit=10&sort=top`);
      const newAnswers = res.data.data;
      setAnswers(prev => pageNum === 1 ? newAnswers : [...prev, ...newAnswers]);
      setHasMoreAnswers(res.data.pagination.has_more);
      setAnswerPage(pageNum);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAnswers(false);
    }
  };

  const fetchComments = async (pageNum = 1, force = false) => {
    if (loadingComments || (!hasMore && !force)) return;

    try {
      setLoadingComments(true);
      const res = await api.get(`/api/posts/${id}/comments?page=${pageNum}&limit=10`);
      const newComments = res.data.comments;
      setComments(prev => pageNum === 1 ? newComments : [...prev, ...newComments]);
      setHasMore(res.data.pagination.has_more);
      setPage(pageNum);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleUpvoteAnswer = async (answerId) => {
    if (votingAnswerId === answerId) return;
    setVotingAnswerId(answerId);

    const previousAnswers = [...answers];
    setAnswers(prev => prev.map(a => {
      if (a.id === answerId) {
        const newVoteType = a.user_vote_type === 'upvote' ? null : 'upvote';
        const voteDelta = a.user_vote_type === 'upvote' ? -1 : (a.user_vote_type === 'downvote' ? 2 : 1);
        return {
          ...a,
          user_vote_type: newVoteType,
          vote_score: Number(a.vote_score || 0) + voteDelta
        };
      }
      return a;
    }));

    try {
      await api.post(`/api/answers/${answerId}/upvote`, {});
    } catch (err) {
      setAnswers(previousAnswers);
      console.error(err);
    } finally {
      setVotingAnswerId(null);
    }
  };

  const handleDownvoteAnswer = async (answerId) => {
    if (votingAnswerId === answerId) return;
    setVotingAnswerId(answerId);

    const previousAnswers = [...answers];
    setAnswers(prev => prev.map(a => {
      if (a.id === answerId) {
        const newVoteType = a.user_vote_type === 'downvote' ? null : 'downvote';
        const voteDelta = a.user_vote_type === 'downvote' ? 1 : (a.user_vote_type === 'upvote' ? -2 : -1);
        return {
          ...a,
          user_vote_type: newVoteType,
          vote_score: Number(a.vote_score || 0) + voteDelta
        };
      }
      return a;
    }));

    try {
      await api.post(`/api/answers/${answerId}/downvote`, {});
    } catch (err) {
      setAnswers(previousAnswers);
      console.error(err);
    } finally {
      setVotingAnswerId(null);
    }
  };

  const handleDeleteComment = () => fetchComments(1, true);

  const toggleReplies = (commentId) => {
    setExpandedReplies(prev => ({
      ...prev,
      [commentId]: !prev[commentId]
    }));
  };

  const toggleLikeComment = async (commentId) => {
    if (likingCommentId === commentId) return;
    
    setLikingCommentId(commentId);

    setComments(prevComments => {
      const updateComment = (comment) => {
        if (comment.id === commentId) {
          return {
            ...comment,
            is_liked: !comment.is_liked,
            likes_count: comment.is_liked ? Number(comment.likes_count) - 1 : Number(comment.likes_count) + 1
          };
        }
        if (comment.replies) {
          return {
            ...comment,
            replies: comment.replies.map(reply => updateComment(reply))
          };
        }
        return comment;
      };
      return prevComments.map(comment => updateComment(comment));
    });

    try {
      await api.post(`/api/comments/${commentId}/like`, {});
    } catch (err) {
      fetchComments(1, true);
      console.error(err);
    } finally {
      setLikingCommentId(null);
    }
  };

  const handleReplyClick = (c) => {
    navigate("/comment", {
      state: {
        postId: id,
        comment_id: c.id,
        user_id_mention: c.user_id || null,
        username_mention: renderName(c),
        mode: "reply",

        postType: post?.post_type,

        isAnnoymous: c?.is_anonymous,
        annoymousBG: c?.anonymous_bg_color || null,
        
        authorName:  Number(c?.is_anonymous) === 1 ? c?.anonymous_name : c?.username,
        authorPf: Number(c?.is_anonymous) === 1 ? null : c?.avatar_url,

        img: c?.gif_url,
        content: c?.content,
      }
    });
  };

  const renderName = (c) => {
    if (c.is_deleted === 1) return '[deleted]';
    return c.is_anonymous === 1 ? c.anonymous_name : (c.display_name || c.username);
  };

  const renderColor = (c) => {
    if (c.is_deleted === 1) return '#999';
    return c.is_anonymous === 1 ? c.anonymous_bg_color : '#999';
  };

  const renderAvatar = (c) => {
    if (c.is_deleted === 1) return null;
    if (c.is_anonymous === 1) return nahIdeaAuth;
    return c.avatar_url ;
  };

  if (!post) {
    return (
      <div className="loading-page">
       <Spin style={{ color: "var(--primary-color)" }}/>
        <p style={{color: 'var(--font-color)'}}>Loading</p>
      </div>
    );
  }

  function tagSplitter(tags = "") {
    if (!tags) return null;
    return tags
      .split(",")
      .map(t => t.trim())
      .filter(Boolean)
      .map((t, i) => (
        <span key={i} className="tag-text">#{t}</span>
      ));
  }

  const renderPostContent = (post) => {
    const data = post?.data;
    if (!data) return <Text type="secondary">No content</Text>;

    switch (post.post_type) {
      case "content":
        return (
          <>
            <div className='post-body'>
              <div className='post-caption'>
                <p>{data.title}</p>
              </div>
              <div className='post-body-text'>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {data.text_body || ""}
                </ReactMarkdown>
              </div>
              <div className='post-tags'>
                {post.tags && <div>{tagSplitter(post.tags)}</div>}
              </div>
            </div>
            {
              data.media_url &&
              <div className='post-thumbnail'>
                <MediaPreview files={parseJSON(data.media_url)} />
              </div>
            }

          </>
        );

      case "confession":
        return (
          <>
            <div>
              <div className='post-caption'>
                <p>{data.title}</p>
              </div>
            </div>
            {
              data.media_url &&
              <div className="post-thumbnail">
                <div className="preview-wrapper" style={{ "--preview-url": `url(${data.media_url})` }}>
                  <img src={data.media_url} className="preview-image"/>
                </div>
              </div>
            }
          </>
        );

      case "question":
        return (
          <>
            <div>
              <div className='post-caption'>
                <p>{data.title}</p>
              </div>
              <div className="post-question-answer-preview"  
              onClick={(e) =>{ 
                    e.stopPropagation(); 
                    navigate(`/answer/${post?.id}/${post?.data?.id}/${post?.data?.question_type}`)}}>
                {data.question_type === "closedend" && (
                  <div className="yesno-div render-qa-post">
                            <div className="yes-chip">
                              Yes
                            </div>

                            <div className="no-chip">
                              No
                            </div>
                  </div>
                )}
                {data.question_type === "range" && (
                   <div className='range-preview-option'>
                                  <label id="min-label">{data.range_min}</label>

                <div className="range-wrapper">
                    <input
                    type="range"
                    min={data.range_min}
                    max={data.range_max}
                    step={data.step}
                    value={Math.min(Math.max(data.default_range_value, data.range_min), data.range_max)}
                    readOnly
                    />
                        <div
                    className="custom-thumb"
                    style={{
                        left: `${Math.min(Math.max(((data.default_range_value - data.range_min) / (data.range_max - data.range_min)) * 100, 0), 100)}%`
                    }}
                    >
                    {data.default_range_value}
                    </div>
                </div>
                <label id="max-label">{data.range_max}</label>
                          </div>
                )}
                {data.question_type === "singlechoice" && (
                  <ul className='choice-ul'>
                    {
                      data.choices?.map(
                        (c, i) => (
                          <li key={i} className = 'choice-li'>
                            <FontAwesomeIcon icon={faCircle} className='tool-answer-icon'/> {c.choice_text}
                          </li>
                        )
                      )
                    }
                  </ul>
                )}
                {data.question_type === "multiplechoice" && (
                  <ul className ='choice-ul'>
                    {
                      data.choices?.map((c,i) => (
                        <li key={i} className ='choice-li'>
                         <BorderOutlined className='tool-answer-icon'/>  {c.choice_text}
                        </li> 
                      ))
                    }
                  </ul>
                )}
                {data.question_type === "rankingorder" && (  
                  <ul className='choice-ul'>
                    {data.items?.map((item, i) => (
                    <li className = 'choice-li' key={i}>
                              {i + 1}. {item.item_text}
                    </li>
                      )
                        
                        )}
                  </ul>
                )}
                {data.question_type === "rating" && (
                  <div className='render-qa-post'>
                    {Array.from({length:5}).map((_,i)=>(
                      <FontAwesomeIcon 
                      key={i}
                      icon={iconOptions.find((opt) => opt.id === data.rating_icon_id)?.icon}
                      style={{ fontSize: "24px", color: "grey" }}
                      />
                    ))}
                  </div>
                )}
                {data.question_type === "openend" && (
                  null
                )}
              </div>
            </div>
            {
                post.post_type !== "question" && data.media_url && (
                  <div className="post-thumbnail">
                    <div className="preview-wrapper" style={{ "--preview-url": `url(${data.media_url})` }}>
                      <img src={data.media_url} className="preview-image"/>
                    </div>
                  </div>
                )
              }
          </>
        );

      default:
        return null;
    } 
  };

  const handleLike = async (postId, ownerId) => {
    if (likingPosts) return;
    setLikingPosts(true);

    const previousPost = { ...post };
    setPost({
      ...post,
      is_liked: !post.is_liked,
      likes_count: post.is_liked ? Number(post.likes_count) - 1 : Number(post.likes_count) + 1
    });

    try {
  
      await api.post(`/api/posts/${postId}/${ownerId}/like`);
    } catch (err) {
      setPost(previousPost);
      console.log(err);
    } finally {
      setLikingPosts(false);
    }
  };

  const handleFavorite = async (postId) => {
    if (favoritingPosts) return;
    setFavoritingPosts(true);

    const previousPost = { ...post };
    setPost({
      ...post,
      is_favorited: !post.is_favorited
    });

    try {
      await api.post(`/api/posts/${postId}/favorite`, {});
    } catch (err) {
      setPost(previousPost);
      console.log(err);
    } finally {
      setFavoritingPosts(false);
    }
  };

  return (
    <div className='home-container'>

      <article id="feed-article">
        
        <div className="about-posts">
          <div className='post-header'>
            <div className='post-user-profile'>
              <button type='button' className='back-btn-about-post' onClick={() => navigate(-1)}><LeftOutlined /></button>

              <div id="author-pf-div" 
                  style={{ backgroundColor: post?.is_anonymous === 1 ? post.anonymous_bg_color : "", cursor: post?.is_anonymous === 1 ? 'none' : 'pointer' }}
                  onClick = {Number( post.is_anonymous) !== 1 ? () => navigate('/accounts', { state: {userId: post.user_id}}) : null}
              >
                <img src={post?.is_anonymous === 1 ? nahIdeaAuth : (post?.avatar_url || nahideaIcon)} id="author-pf" alt="avatar" />
              </div>

              <div className='user-post-info'>
                <p className='post-username' 
                >
                   <span 
                                  style={{cursor: post.is_anonymous === 1 ? 'none' : 'pointer'}}
                                  onClick={Number(post.is_anonymous) !== 1 ? () => {navigate('/accounts', {state: {userId: post.user_id}})} : null}
                                > 
                                  {post?.is_anonymous === 1 ? post?.anonymous_name : post?.username}
                                  <PostAuthorBadge userId={post.user_id} isAnonymous={post.is_anonymous === 1} />
                                </span>
                  <div className='dot'></div>
                  <div className='category-post-div'>
                    <span className="post-type-label">{post?.data?.type}</span> 
                  </div>
                </p>
                <p className='post-at'>{post?.created_at}</p>
              </div> 
            </div>
            <DotDropDown 
              ownerId={post?.user_id} 
              post_type={post?.post_type} 
              post_id={post?.id}
              text_body={post?.data?.text_body || ""} 
              contentId={post?.data?.id || 1}
            />
          </div>

          <div className='post-body'>
            {renderPostContent(post)}
          </div>

          <div className='post-footer'>
            <div className='post-footer-left'>
                <button
                                                    className={`button-action-footer like-button ${
                                                      post.is_liked ? "liked" : ""
                                                    }`}
                                                    type="button"
                                                    onClick={(e) => {
                                                      e.preventDefault();
                                                      handleLike(post.id, post.user_id);
                                                    }}
                                                  >
                                                    <motion.div
                                                      className="action-icon-wrapper"
                                                      whileTap={{ scale: 0.75 }}
                                                      animate={
                                                        likingPosts
                                                          ? {
                                                              scale: [1, 1.35, 1],
                                                              rotate: [0, -15, 15, 0]
                                                            }
                                                          : { scale: 1, rotate: 0 }
                                                      }
                                                      transition={{
                                                        duration: 0.45,
                                                        ease: "easeInOut"
                                                      }}
                                                    >
                                                      <AnimatePresence mode="wait">
              
                                                        {post.is_liked ? (
              
                                                          <motion.div
                                                            key="liked"
                                                            initial={{
                                                              scale: 0.4,
                                                              opacity: 0,
                                                              rotate: -25
                                                            }}
                                                            animate={{
                                                              scale: 1,
                                                              opacity: 1,
                                                              rotate: 0
                                                            }}
                                                            exit={{
                                                              scale: 0.4,
                                                              opacity: 0,
                                                              rotate: 25
                                                            }}
                                                            transition={{
                                                              type: "spring",
                                                              stiffness: 500,
                                                              damping: 22
                                                            }}
                                                          >
                                                            <Heart
                                                              size={19}
                                                              className="button-action-footer-icon liked-heart"
                                                              fill="currentColor"
                                                            />
                                                          </motion.div>
              
                                                        ) : (
              
                                                          <motion.div
                                                            key="unliked"
                                                            initial={{
                                                              scale: 0.4,
                                                              opacity: 0
                                                            }}
                                                            animate={{
                                                              scale: 1,
                                                              opacity: 1
                                                            }}
                                                            exit={{
                                                              scale: 0.4,
                                                              opacity: 0
                                                            }}
                                                            transition={{
                                                              duration: 0.2
                                                            }}
                                                          >
                                                            <Heart
                                                              size={19}
                                                              className="button-action-footer-icon"
                                                            />
                                                          </motion.div>
              
                                                        )}
              
                                                      </AnimatePresence>
                                                    </motion.div>
              
                                                    <p>
                                                      <span>{post.likes_count}</span>
                                                      <span className="count-label"> Like</span>
                                                    </p>
                </button>
            </div>
            <div className='post-footer-right'>
               <button
                                                className={`button-action-footer button-action-footer-last favorite-button ${
                                                  post.is_favorited ? "favorited" : ""
                                                }`}
                                                onClick={(e) => {
                                                  e.preventDefault();
                                                  handleFavorite(post.id);
                                                }}
                                              >
                                                <motion.div
                                                  className="action-icon-wrapper"
                                                  whileTap={{ scale: 0.75 }}
                                                  animate={
                                                    favoritingPosts
                                                      ? {
                                                          scale: [1, 1.35, 1],
                                                          rotate: [0, -15, 15, 0]
                                                        }
                                                      : { scale: 1, rotate: 0 }
                                                  }
                                                  transition={{
                                                    duration: 0.4,
                                                    ease: "easeInOut"
                                                  }}
                                                >
                                                  <AnimatePresence mode="wait">
              
                                                    {post.is_favorited ? (
              
                                                      <motion.div
                                                        key="favorited"
                                                        initial={{
                                                          scale: 0.4,
                                                          opacity: 0,
                                                          y: 10
                                                        }}
                                                        animate={{
                                                          scale: 1,
                                                          opacity: 1,
                                                          y: 0
                                                        }}
                                                        exit={{
                                                          scale: 0.4,
                                                          opacity: 0,
                                                          y: 10
                                                        }}
                                                        transition={{
                                                          type: "spring",
                                                          stiffness: 500,
                                                          damping: 22
                                                        }}
                                                      >
                                                        <Bookmark
                                                          size={18}
                                                          className="button-action-footer-icon favorited-bookmark"
                                                          fill="currentColor"
                                                        />
                                                      </motion.div>
              
                                                    ) : (
              
                                                      <motion.div
                                                        key="unfavorited"
                                                        initial={{
                                                          scale: 0.4,
                                                          opacity: 0
                                                        }}
                                                        animate={{
                                                          scale: 1,
                                                          opacity: 1
                                                        }}
                                                        exit={{
                                                          scale: 0.4,
                                                          opacity: 0
                                                        }}
                                                        transition={{
                                                          duration: 0.2
                                                        }}
                                                      >
                                                        <Bookmark
                                                          size={18}
                                                          className="button-action-footer-icon"
                                                        />
                                                      </motion.div>
              
                                                    )}
              
                                                  </AnimatePresence>
                                                </motion.div>
              </button>  
            </div>
          </div>
          <div className="comment-box">
            {post?.post_type === "question" ? (
              <>
                <div className='radio-button-div-aboutpost'>
                  {[
                    { id: 1, label: "Answers"},
                    { id: 2, label: "Comments"}
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => {
                        setSelectedTab(opt.id);
                        if (opt.id === 2 && !commentsFetched.current) {
                          fetchComments(1, true);
                          commentsFetched.current = true;
                        } else if (opt.id === 1 && !answersFetched.current) {
                          fetchAnswers(1);
                          answersFetched.current = true;
                        }
                      }}
                      style={{
          
                        color: selectedTab === opt.id ? "var(--font-color)" : "grey",
                      }}
                      className='radio-button-aboutpost'
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                
                {selectedTab === 1 && (
                  <div>
                    <button
                      onClick={() => navigate(`/answer/${post?.id}/${post?.data?.id}/${post?.data?.question_type}`)}
                      className="comment-btn"
                    >
                      <FontAwesomeIcon icon={faPen} style={{fontSize:'12px'}}/> Answer this question
                    </button>
                    {/* Average Answer Display */}
                    {averageData && post?.data?.question_type !== "openend"  && (
                      <AverageAnswerDisplay 
                        averageData={averageData} 
                        questionType={post?.data?.question_type}
                        ratingIcon = {post?.data?.question_type === "rating" ? post?.data?.rating_icon_id : null}
                      />
                    )}  
                    {/* All Answers */}
                    <div className="all-answers-section">
                      {answers.map(answer => (
                        <AnswerCard
                          key={answer.id}
                          ratingIcon = {post?.data?.question_type === "rating" ? post?.data?.rating_icon_id : null}
                          answer={answer}
                          onUpvote={() => handleUpvoteAnswer(answer.id)}
                          onDownvote={() => handleDownvoteAnswer(answer.id)}
                          isVoting={votingAnswerId === answer.id}
                          highlightedAnswerId={highlightedAnswerId}
                        />
                      ))}
                      
                      <div ref={answerObserverRef} style={{ height: "20px" }} />
                      {loadingAnswers && <p className="loading-text">Loading answers...</p>}
                      {answers.length === 0 && !loadingAnswers && (
                        <div id='no-com-div'>
                          <FontAwesomeIcon icon={faMartiniGlassEmpty} className='no-com-p'/>
                          <p className='no-com-p'>No answers yet. Be the first to answer!</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                 
                {selectedTab === 2 && (
                  <>
                    <button
                      onClick={() => navigate(`/comment`, { 
                        state: { 
                          postId: id,
                          postType: post?.post_type,
                          mode: 'comment',

                          isAnnoymous: post?.is_anonymous,
                          annoymousBG: post?.anonymous_bg_color || null,
                    
                          authorName: Number(post?.is_anonymous) === 1 ? post?.anonymous_name: post?.username,
                          authorPf: Number(post?.is_anonymous) === 1 ? null : post?.avatar_url,

                          content: post?.data?.title,
                          img: parseJSON(post?.data?.media_url)[0]

                        } 
                      })}
                      className="comment-btn"
                    >
                      <FontAwesomeIcon icon={faPen} style={{fontSize:'12px'}}/> Write a comment
                    </button>
                    {comments.map(c => (
                      <CommentCard 
                        key={c.id}
                        c={c}
                        postType = {post?.post_type}
                        is_anonymous = {c.is_anonymous}
                        isReply={false}
                        postId={id}
                        expandedReplies={expandedReplies}
                        onToggleReplies={toggleReplies}
                        onLikeComment={toggleLikeComment}
                        onReplyClick={handleReplyClick}
                        highlightedId={highlightedId}
                        timeAgoFn={timeAgo}
                        renderNameFn={renderName}
                        renderColorFn={renderColor}
                        renderAvatarFn={renderAvatar}
                        likingCommentId={likingCommentId}
                        onDeleteComment={handleDeleteComment}
                      />
                    ))}
                  
                    {comments.length === 0 && !loadingComments && (
                      <div id='no-com-div'>
                        <FontAwesomeIcon icon={faMartiniGlassEmpty} className='no-com-p'/>
                        <p className='no-com-p'>No comments yet. Start the conversation!</p>
                      </div>
                    )}

                    <div ref={observerRef} style={{ height: "20px" }} />
                    {loadingComments && <p className="loading-text">Loading comments...</p>}
                  </>
                )}
              </>
              ) : (
                <>
                  <span id='label-com-count'>{post?.comments_count} Comment{post?.comments_count > 1 && "s"}</span>
                  <button
                  onClick={() => navigate(`/comment`, { 
                      state: { 
                        postId: id,
                        postType: post?.post_type,
                        mode: 'comment',

                        isAnnoymous: post?.is_anonymous,
                        annoymousBG: post?.anonymous_bg_color || null,
                  
                        authorName: Number(post?.is_anonymous) === 1 ? post?.anonymous_name: post?.username,
                        authorPf: Number(post?.is_anonymous) === 1 ? null : post?.avatar_url,

                        content: post?.data?.title,
                        img: parseJSON(post?.data?.media_url)[0]

                      } 
                    })}
                    className="comment-btn"
                  >
                    <FontAwesomeIcon icon={faPen} style={{fontSize:'12px'}}/> Write a comment
                  </button>
                  {comments.map(c => (
                    <CommentCard 
                      key={c.id}
                      c={c}
                      postType = {post?.post_type}
                      is_anonymous = {c.is_anonymous}
                      isReply={false}
                      postId={id}
                      expandedReplies={expandedReplies}
                      onToggleReplies={toggleReplies}
                      onLikeComment={toggleLikeComment}
                      onReplyClick={handleReplyClick}
                      highlightedId={highlightedId}
                      timeAgoFn={timeAgo}
                      renderNameFn={renderName}
                      renderColorFn={renderColor}
                      renderAvatarFn={renderAvatar}
                      likingCommentId={likingCommentId}
                      onDeleteComment={handleDeleteComment}
                    />
                  ))}
                
                  {comments.length === 0 && !loadingComments && (
                    <div id='no-com-div'>
                      <FontAwesomeIcon icon={faMartiniGlassEmpty} className='no-com-p'/>
                      <p className='no-com-p'>Be the first to comment or answer</p>
                    </div>
                  )}

                  <div ref={observerRef} style={{ height: "20px" }} />
                  {loadingComments && <p className="loading-text">Loading comments...</p>}
                </>
              )}
          </div>
        </div>
      </article>

      <article id='his-article'>
        <Rule setRule={post?.post_type === "question" ? "question Comment" : post?.post_type === "content" ? "content Comment" : "confession Comment"} />
      </article>

    </div>
  );
};

export default AboutPost;

function PostAuthorBadge({ userId, isAnonymous }) {
  const { badgeTier, loadings } = useUserRanking(isAnonymous ? null : userId);

  if (isAnonymous || loadings || !badgeTier) return null;

  return <RankBadge rank={badgeTier} size="sm" />;
}

function PostAuthorBadgeCm({ userId, isAnonymous }) {
  const { badgeTier, loadings } = useUserRanking(isAnonymous ? null : userId);

  if (isAnonymous || loadings || !badgeTier) return null;

  return <RankBadge rank={badgeTier} size="s" />;
}