import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useSearchParams, useOutletContext } from "react-router-dom";
import "../style/page/Trending.css"; // reuse same post styles
import "../style/page/SearchForm.css";
import { List, Typography, Spin } from "antd";
const { Text } = Typography;
import { BorderOutlined, LeftOutlined, RiseOutlined } from "@ant-design/icons";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircle, faMessage } from "@fortawesome/free-regular-svg-icons";
import { faBloggerB } from "@fortawesome/free-brands-svg-icons";
import { faUser, faMagnifyingGlass, faPen } from "@fortawesome/free-solid-svg-icons";

import { Heart, Bookmark } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { MediaPreview } from "../util/mediaUploader";
import parseJSON from "./util/parseJson";
import DotDropDown from "./util/dotDropDown";
import { useUserRanking } from "./util/useUserRanking";
import RankBadge from "../components/RankBadge";


import nahIdeaAuth from "../img/nahIdeaAuth.png";
import nahideaIcon from '../img/nahideaIcon.png';
import { iconOptions } from "../data/post_type_data";

import api from "../api/axiosInstance";
import RecentHistory from "../util/recentHistory";
import MutualFriend from "../util/mutualFriend";
import Rule from "./util/rule";

const USER_LIMIT = 5;
const POST_LIMIT = 5;

const SearchForm = () => {
  const navigate = useNavigate();
   const { user, onlineUsers } = useOutletContext();

  const [searchParams] = useSearchParams();
  const q = searchParams.get("q") || "";

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [hasMoreUsers, setHasMoreUsers] = useState(false);
  const [hasMorePosts, setHasMorePosts] = useState(false);

  // "see all" expanded mode: 'none' | 'users' | 'posts'
  const [expandMode, setExpandMode] = useState("none");
  const [expandLoading, setExpandLoading] = useState(false);

  const [likingPosts, setLikingPosts] = useState(new Set());
  const [favoritingPosts, setFavoritingPosts] = useState(new Set());
  const [hoveredPostId, setHoveredPostId] = useState(null);

  const fetchingRef = useRef(false);

  useEffect(() => {
    if (!q) return;
    setExpandMode("none");
    fetchInitial();
  }, [q]);

  const fetchInitial = async () => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const res = await api.get(`/api/search`, {
        params: { q, userLimit: USER_LIMIT, postLimit: POST_LIMIT },
      });

      setUsers(res.data.users || []);
      setPosts(res.data.posts || []);
      setHasMoreUsers(!!res.data.hasMoreUsers);
      setHasMorePosts(!!res.data.hasMorePosts);
    } catch (err) {
      console.error("search fetch error:", err);
      setError("Failed to load search results");
    } finally {
      fetchingRef.current = false;
      setLoading(false);
    }
  };

  // ===== SEE ALL - USERS =====
  const seeAllUsers = async () => {
    setExpandMode("users");
    setExpandLoading(true);
    try {
      const res = await api.get(`/api/search`, {
        params: { q, userLimit: 30, postLimit: 0 },
      });
      setUsers(res.data.users || []);
      setHasMoreUsers(!!res.data.hasMoreUsers);
    } catch (err) {
      console.error("see all users error:", err);
    } finally {
      setExpandLoading(false);
    }
  };

  const loadMoreUsers = async () => {
    try {
      const res = await api.get(`/api/search`, {
        params: { q, userLimit: 20, userOffset: users.length, postLimit: 0 },
      });
      setUsers((prev) => [...prev, ...(res.data.users || [])]);
      setHasMoreUsers(!!res.data.hasMoreUsers);
    } catch (err) {
      console.error("load more users error:", err);
    }
  };

  // ===== SEE ALL - POSTS =====
  const seeAllPosts = async () => {
    setExpandMode("posts");
    setExpandLoading(true);
    try {
      const res = await api.get(`/api/search`, {
        params: { q, postLimit: 20, userLimit: 0 },
      });
      setPosts(res.data.posts || []);
      setHasMorePosts(!!res.data.hasMorePosts);
    } catch (err) {
      console.error("see all posts error:", err);
    } finally {
      setExpandLoading(false);
    }
  };

  const loadMorePosts = async () => {
    try {
      const res = await api.get(`/api/search`, {
        params: { q, postLimit: 15, postOffset: posts.length, userLimit: 0 },
      });
      setPosts((prev) => [...prev, ...(res.data.posts || [])]);
      setHasMorePosts(!!res.data.hasMorePosts);
    } catch (err) {
      console.error("load more posts error:", err);
    }
  };

  const backToBoth = () => {
    setExpandMode("none");
    fetchInitial();
  };



  const openUser = (userId) => {
    navigate("/accounts", { state: { userId } });
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
            <div className="post-thumbnail">
              <div
                className="preview-wrapper"
                style={{ "--preview-url": `url(${data.media_url})` }}
              >
                <img src={data.media_url} className="preview-image" alt="confession" />
              </div>
            </div>
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
              likes_count: post.is_liked ? Number(post.likes_count) - 1 : Number(post.likes_count) + 1,
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
                likes_count: post.is_liked ? Number(post.likes_count) - 1 : Number(post.likes_count) + 1,
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

  const noUsers = users.length === 0;
  const noPosts = posts.length === 0;

  return (
    <div className="home-container">
      <article id="feed-article">
        <div className="feed-header">
          <p className="feed-title">
            <FontAwesomeIcon icon={faMagnifyingGlass} /> Search results for ' {q} '
          </p>
        
          {expandMode !== "none" && (
            <>
              <br />
              <span className="feed-subtitle" onClick={backToBoth} style={{ cursor: "pointer" }}>
                <LeftOutlined /> Back to all results
              </span>
            </>
          )}
        </div>

        

        <br />

        {loading ? (
          <div className="error-container">
            <Spin style={{color: 'var(--primary-color)'}}/>
          </div>
        ) : error ? (
          <div className="error-container">
            <p>Opps! Failed to load</p>
            <button onClick={fetchInitial} className="retry-btn see-all-btn">
              Retry
            </button>
          </div>
        ) : noUsers && noPosts ? (
          <div className="error-container">
            <p>No results found for "{q}"</p>
          </div>
        ) : (
          <>
            {/* ================= USERS SECTION ================= */}
            {(expandMode === "none" || expandMode === "users") && !noUsers && (
              <div className="search-result dev-res">
                <label>
                  <FontAwesomeIcon icon={faUser} /> People
                </label>
                <ul className="query-result-ul">
                  {users.map((u) => (
                    <li key={u.id} className="query-card" onClick={() => openUser(u.id)}>
                      <img
                        src={u.avatar_url || nahideaIcon}
                        alt={u.username}
                        className="search-icon-query"
                        style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover" }}
                      />
                      <div className="dev-info">
                        <p className="query-title">{u.username}<PostAuthorBadge userId={u.user_id} isAnonymous={u.is_anonymous === 1} /></p>
                        {u.nickname && <p className="query-description">{u.nickname}</p>}
                      </div>
                    </li>
                  ))}
                </ul>

                {expandMode === "none" && hasMoreUsers && (
                  <div className="see-all-container">
                     <button className="see-all-btn" onClick={seeAllUsers}>
                          See all people
                     </button>
                  </div>
                 
                )}

                {expandMode === "users" && (
                  <>
                     {expandLoading && <div className="see-all-container">
                               <Spin style={{color: 'var(--primary-color)'}}/>
                          </div>}
                    {hasMoreUsers && !expandLoading && (
                      <div className="see-all-container">
                          <button className="see-all-btn" onClick={loadMoreUsers}>
                          Load more
                        </button>
                      </div>

                    )}
                  </>
                )}
              </div>
            )}

            {/* ================= POSTS SECTION ================= */}
            {(expandMode === "none" || expandMode === "posts") && !noPosts && (
              <>
              <div className="search-result dev-res">
                 <label style={{color: 'var(--font-color)'}}>
                  <FontAwesomeIcon icon={faBloggerB} /> Posts
                </label>
              </div>

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
                                backgroundColor:
                                  post.is_anonymous === 1 ? post.anonymous_bg_color : "grey",
                                cursor: post.is_anonymous === 1 ? "none" : "pointer",
                              }}
                              onClick={
                                Number(post.is_anonymous) !== 1
                                  ? () => openUser(post.user_id)
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
                                      ? () => openUser(post.user_id)
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

                {expandMode === "none" && hasMorePosts && (
                          <div className="see-all-container">
                                <button className="see-all-btn" onClick={seeAllPosts}>
                    See all posts
                  </button>
                          </div>
              
                )}

                {expandMode === "posts" && (
                  <>
                    {expandLoading && <div className="see-all-container">
                               <Spin style={{color: 'var(--primary-color)'}}/>
                          </div>}
                    {hasMorePosts && !expandLoading && (
                          <div className="see-all-container">
                               <button className="see-all-btn" onClick={loadMorePosts}>
                        Load more
                      </button>
                          </div>
                   
                    )}
                  </>
                )}
              </>
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

export default SearchForm;
function PostAuthorBadge({ userId, isAnonymous }) {
  const { badgeTier, loadings } = useUserRanking(isAnonymous ? null : userId);

  if (isAnonymous || loadings || !badgeTier) return null;

  return <RankBadge rank={badgeTier} size="sm" />;
}
