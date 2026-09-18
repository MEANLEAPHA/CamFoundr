import React, { useState, useEffect, useRef } from "react";
import "../style/page/Trending.css";
import { useNavigate, useOutletContext } from "react-router-dom";
import nahideaIcon from '../img/nahideaIcon.png';
// antd
import { List, Spin, Typography } from "antd";
const { Text } = Typography;
import { BorderOutlined, FolderOpenOutlined, RiseOutlined, SignatureOutlined } from "@ant-design/icons";

// fontAwesome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircle, faMessage } from "@fortawesome/free-regular-svg-icons";
import {
  faThumbsDown,
  faThumbsUp,
  faHandPointer,
  faHandPeace,
  faHand,
  faLocationCrosshairs,
  faStar,
  faPen,
} from "@fortawesome/free-solid-svg-icons";

// lucide
import { Heart, Bookmark } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// util
import { MediaPreview } from "../util/mediaUploader";
import MutualFriend from "../util/mutualFriend";
import RecentHistory from "../util/recentHistory";
import parseJSON from "./util/parseJson";
import DotDropDown from "./util/dotDropDown";
import { useUserRanking } from "./util/useUserRanking";
import RankBadge from "../components/RankBadge";

// img
import nahIdeaAuth from "../img/nahIdeaAuth.png";

// data
import { iconOptions } from "../data/post_type_data";
import Rule from "./util/rule";

// api
import api from "../api/axiosInstance";

const Trending = () => {
  const navigate = useNavigate();
  const { onlineUsers } = useOutletContext();


  // loading
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState(null);
  const fetchingRef = useRef(false);

  // posts
  const [posts, setPosts] = useState([]);
  const [likingPosts, setLikingPosts] = useState(new Set());
  const [favoritingPosts, setFavoritingPosts] = useState(new Set());
  const [hoveredPostId, setHoveredPostId] = useState(null);

  // INITIAL LOAD
  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;

    try {
      setFetching(true);
      setLoading(true);

      const res = await api.get(`/api/all-trending`);
      const payload = res.data;

      if (!payload || !Array.isArray(payload.data)) {
        throw new Error("Bad response");
      }

      setPosts(payload.data);
      setError(null);
    } catch (err) {
      setError("Failed to load post");
      console.error("Fetch error:", err);
    } finally {
      fetchingRef.current = false;
      setFetching(false);
      setLoading(false);
    }
  };

 
  const openPost = (post) => {
    const HisData = {
      id: post.id,
      title: post.data?.title,
      mediaSrc: post.data?.media_url,
      author: post.is_anonymous === 1 ? post.anonymous_name : post.username,
      authurPf: post.is_anonymous === 1 ? nahIdeaAuth : post.avatar_url,
      isAnonymous: post.is_anonymous,
      anonymousBg: post.anonymous_bg_color,
      localTime: new Date().toLocaleString()
    };

    let recentDataHis = [];
    try {
      recentDataHis = JSON.parse(localStorage.getItem("recentPostHis")) || [];
    } catch {
      recentDataHis = [];
    }

    const withoutCurrent = recentDataHis.filter((item) => item.id !== post.id);
    const newList = [HisData, ...withoutCurrent].slice(0, 50);
    localStorage.setItem("recentPostHis", JSON.stringify(newList));

    navigate(`/aboutpost/${post.id}`);
  };
    const openPostByComment = (post) => {
        const HisData = {
          id: post.id,
          title: post.data.title,
          mediaSrc: post.data.media_url,
          author: post.is_anonymous === 1 ? post.anonymous_name : post.username,
          authurPf: post.is_anonymous === 1 ? nahIdeaAuth : post.avatar_url,
          isAnonymous: post.is_anonymous,
          anonymousBg: post.anonymous_bg_color,
          localTime: new Date().toLocaleString()
        };
  
        let recentDataHis = [];
        try {
          recentDataHis = JSON.parse(localStorage.getItem("recentPostHis")) || [];
        } catch {
          recentDataHis = [];
        }
  
        const withoutCurrent = recentDataHis.filter(item => item.id !== post.id);
        const newList = [HisData, ...withoutCurrent].slice(0, 50);
        localStorage.setItem("recentPostHis", JSON.stringify(newList));
  
        navigate(`/aboutpost/${post.id}#comments`);
      };

  const renderPostContent = (post) => {
    const data = post.data;
    if (!data) return <Text type="secondary">No content</Text>;

    switch (post.post_type) {
      case "content":
        return (
          <>
            <div className="post-caption" onClick={() => openPost(post)}>
              <p>{data.title}</p>
            </div>
            <div className="post-thumbnail">
              <MediaPreview files={parseJSON(data.media_url)} />
            </div>
          </>
        );

      case "confession":
        return (
          <>
            <div className="post-caption" onClick={() => openPost(post)}>
              <p>{data.title}</p>
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
           <div className="post-caption" onClick={() => openPost(post)}>
              <p>{data.title}</p>
            </div>
            <div className="post-question-answer-preview" 
               onClick={(e) =>{ 
                    e.stopPropagation(); 
                    navigate(`/answer/${post?.id}/${post?.data?.id}/${post?.data?.question_type}`)}}
            >
              {data.question_type === "closedend" && (

                        <div className="yesno-div">
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
                      data.choices?.slice(0, data.choices?.length > 4 ? 3 : 4).map(
                        (c, i) => (
                          <li key={i} className = 'choice-li'>
                            <FontAwesomeIcon icon={faCircle} className='tool-answer-icon'/> {c.choice_text}
                          </li>
                        )
                      )
                    }
                    {data.choices?.length > 4 && (
                      <li className = 'choice-li' style={{color:'grey', fontSize:'smaller'}}>
                           +{data.choices?.length - 3} more
                      </li>
                    )}
                </ul>
              )}

              {data.question_type === "multiplechoice" && (
                         <ul className ='choice-ul'>
                          {
                            data.choices?.slice(0, data.choices?.length > 4 ? 3 : 4).map((c,i) => (
                              <li key={i} className ='choice-li'>
                                <BorderOutlined className='tool-answer-icon'/>  {c.choices_text}
                              </li> 
                            ))
                          }
                          {data.choices?.length > 4 && (
                            <div className ='choice-li' style={{color:'grey', fontSize:'smaller'}}>
                              +{data.choices?.length - 3} more
                            </div>
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
              {data.question_type === "rankingorder" && (
                        <ul className='choice-ul'>
                              {data.items?.slice(0, data.items?.length > 4 ? 3 : 4).map((item, i) => (
                                <li className = 'choice-li' key={i}>
                                    {i + 1}. {item.item_text}
                                </li>
                              ))}
                              {data.items?.length > 4 && (
                                <li className = 'choice-li' style={{color:'grey', fontSize:'smaller'}}>
                                  +{data.items?.length - 3} more
                                </li>
                              )}
                          </ul>
                      )}
              {data.question_type === "openend" && ( null
                      )}
            </div>
            {
              post.post_type !== 'question' && (
                <div className="post-thumbnail">
                  <div
                    className="preview-wrapper"
                    style={{ "--preview-url": `url(${data.media_url})` }}
                  >
                    <img src={data.media_url} className="preview-image" alt="img-post" />
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
    if (likingPosts.has(postId)) return;
    setLikingPosts((prev) => new Set(prev).add(postId));

    setPosts((prev) =>
      prev.map((post) =>
        post.id !== postId
          ? post
          : {
              ...post,
              is_liked: !post.is_liked,
              likes_count: post.is_liked 
                ? Number(post.likes_count) - 1
                : Number(post.likes_count) + 1
            }
      )
    );

    try {
      await api.post(`/api/posts/${postId}/${ownerId}/like`, {});
    } catch (err) {
      setPosts((prev) =>
        prev.map((post) =>
          post.id !== postId
            ? post
            : {
                ...post,
                is_liked: !post.is_liked,
                likes_count: post.is_liked   
                  ? Number(post.likes_count) - 1
                  : Number(post.likes_count) + 1
              }
        )
      );
      console.error(err);
    } finally {
      setLikingPosts((prev) => {
        const next = new Set(prev);
        next.delete(postId);
        return next;
      });
    }
  };

  const handleFavorite = async (postId) => {
    if (favoritingPosts.has(postId)) return;
    setFavoritingPosts((prev) => new Set(prev).add(postId));

    setPosts((prev) =>
      prev.map((post) =>
        post.id !== postId ? post : { ...post, is_favorited: !post.is_favorited }
      )
    );

    try {
      await api.post(`/api/posts/${postId}/favorite`, {});
    } catch (err) {
      setPosts((prev) =>
        prev.map((post) =>
          post.id !== postId ? post : { ...post, is_favorited: !post.is_favorited }
        )
      );
      console.error(err);
    } finally {
      setFavoritingPosts((prev) => {
        const next = new Set(prev);
        next.delete(postId);
        return next;
      });
    }
  };

  return (
    <div className="home-container">
      <article id="feed-article">
        <div className="feed-header" style={{maarginTop: '15px'}}>
          <p className="feed-title"><RiseOutlined /> Trending Posts</p>
          <p className="feed-subtitle">Most popular posts of the day</p>
        </div>
        <br />

        {error && posts.length === 0 ? (
          <div className="error-container">
            <Spin style={{color: 'var(--primary-color)'}}/>
            <p>Opps! Failed to load</p>
            <button onClick={fetchPosts} className="retry-btn">
              Retry
            </button>
          </div>
        ) : posts.length === 0 && !loading ? (
          <div className="error-container">
            <Spin style={{color: 'var(--primary-color)'}}/>
            <p>No posts found</p>
          </div>
        ) : (
          <>
            <List
              dataSource={posts}
              renderItem={(post) => (
                <List.Item key={post.id}>
                  <div
                    className="posts"
                    onMouseEnter={() => setHoveredPostId(post.id)}
                    onMouseLeave={() => setHoveredPostId(null)}
                  >
                    <div className="post-header">
                      <div className="post-user-profile">
                        <div
                          id="author-pf-div"
                          style={{
                            backgroundColor: post.is_anonymous === 1 ? post.anonymous_bg_color : "grey",
                            cursor: post.is_anonymous === 1 ? "none" : "pointer",
                          }}
                          onClick={
                            Number(post.is_anonymous) !== 1
                              ? () => navigate("/accounts", { state: { userId: post.user_id } })
                              : null
                          }
                        >
                          <img
                            src={
                              post.is_anonymous === 1
                                ? nahIdeaAuth
                                : post.avatar_url ||
                                  nahideaIcon
                            }
                            id="author-pf"
                            alt="avatar"
                          />
                        </div>

                        <div className="user-post-info">
                          <p className="post-username">
                            <span
                              style={{ cursor: post.is_anonymous === 1 ? "none" : "pointer" }}
                              onClick={
                                Number(post.is_anonymous) !== 1
                                  ? () => navigate("/accounts", { state: { userId: post.user_id } })
                                  : null
                              }
                            >
                              {post?.is_anonymous === 1 ? post?.anonymous_name : post?.username}
                                  <PostAuthorBadge userId={post.user_id} isAnonymous={post.is_anonymous === 1} />
                            </span>
                            <div className="dot"></div>
                            <div className="category-post-div">
                              <span className="post-type-label">{post?.data?.type}</span>
                            </div>
                          </p>
                          <p className="post-at">{post.created_at}</p>
                        </div>
                      </div>

                      <DotDropDown
                        ownerId={post.user_id}
                        post_type={post.post_type}
                        post_id={post.id}
                        text_body={post?.data?.text_body || ""}
                        contentId={post?.data?.id || 1}
                      />
                    </div>

                    <div className="post-body">{renderPostContent(post)}</div>

                    <div className="post-footer">
                      <div className="post-footer-left">
                        <button
                          className={`button-action-footer like-button ${post.is_liked ? "liked" : ""}`}
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
                              likingPosts.has(post.id)
                                ? { scale: [1, 1.35, 1], rotate: [0, -15, 15, 0] }
                                : { scale: 1, rotate: 0 }
                            }
                            transition={{ duration: 0.45, ease: "easeInOut" }}
                          >
                            <AnimatePresence mode="wait">
                              {post.is_liked ? (
                                <motion.div
                                  key="liked"
                                  initial={{ scale: 0.4, opacity: 0, rotate: -25 }}
                                  animate={{ scale: 1, opacity: 1, rotate: 0 }}
                                  exit={{ scale: 0.4, opacity: 0, rotate: 25 }}
                                  transition={{ type: "spring", stiffness: 500, damping: 22 }}
                                >
                                  <Heart size={19} className="button-action-footer-icon liked-heart" fill="currentColor" />
                                </motion.div>
                              ) : (
                                <motion.div
                                  key="unliked"
                                  initial={{ scale: 0.4, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  exit={{ scale: 0.4, opacity: 0 }}
                                  transition={{ duration: 0.2 }}
                                >
                                  <Heart size={19} className="button-action-footer-icon" />
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </motion.div>
                          <p>
                            <span>{post.likes_count}</span>
                            <span className="count-label"> Like</span>
                          </p>
                        </button>

                        {post.post_type === "question" && <button className='button-action-footer' type='button' onClick={() => navigate(`/answer/${post?.id}/${post?.data?.id}/${post?.data?.question_type}`)}><FontAwesomeIcon icon={faPen} className='button-action-footer-icon'/><p><span>{post.answers_count}</span><span className='count-label'> Answer</span></p></button>}
                             <button className='button-action-footer' type='button' onClick={()=> openPostByComment(post)}><FontAwesomeIcon icon={faMessage} className='button-action-footer-icon' /><p><span>{post.comments_count}</span><span className='count-label'> Comment</span></p></button>
                      </div>

                      <div className="post-footer-right">
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
                              favoritingPosts.has(post.id)
                                ? { scale: [1, 1.25, 1], y: [0, -5, 0] }
                                : { scale: 1, y: 0 }
                            }
                            transition={{ duration: 0.4, ease: "easeInOut" }}
                          >
                            <AnimatePresence mode="wait">
                              {post.is_favorited ? (
                                <motion.div
                                  key="favorited"
                                  initial={{ scale: 0.4, opacity: 0, y: 10 }}
                                  animate={{ scale: 1, opacity: 1, y: 0 }}
                                  exit={{ scale: 0.4, opacity: 0, y: 10 }}
                                  transition={{ type: "spring", stiffness: 500, damping: 22 }}
                                >
                                  <Bookmark size={18} className="button-action-footer-icon favorited-bookmark" fill="currentColor" />
                                </motion.div>
                              ) : (
                                <motion.div
                                  key="unfavorited"
                                  initial={{ scale: 0.4, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  exit={{ scale: 0.4, opacity: 0 }}
                                  transition={{ duration: 0.2 }}
                                >
                                  <Bookmark size={18} className="button-action-footer-icon" />
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </motion.div>
                        </button>
                      </div>
                    </div>
                  </div>
                </List.Item>
              )}
            />

            {loading && (
              <div className="nextPost-load-div">
                <Spin style={{color: 'var(--primary-color)'}}/>
              </div>
            )}
          </>
        )}
      </article>

      <article id="his-article">
        <RecentHistory />
        <MutualFriend onlineUsers={onlineUsers} />
        <Rule />
      </article>
    </div>
  );
};

export default Trending;


function PostAuthorBadge({ userId, isAnonymous }) {
  const { badgeTier, loadings } = useUserRanking(isAnonymous ? null : userId);

  if (isAnonymous || loadings || !badgeTier) return null;

  return <RankBadge rank={badgeTier} size="sm" />;
}
