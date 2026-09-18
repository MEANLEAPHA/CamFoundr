// react state
import React, { useState, useEffect, useRef, memo, useLayoutEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';

// antd
import { List, Typography, Spin } from "antd";
const { Text } = Typography;
import { BorderOutlined, } from '@ant-design/icons';

// fontAwesome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen} from "@fortawesome/free-solid-svg-icons";
import { faMessage, faCircle } from "@fortawesome/free-regular-svg-icons";

// lucide
import { Heart, Bookmark } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";


// util
import { MediaPreview } from "../util/mediaUploader";
import { saveScroll, getScroll } from "./util/scrollStore";
import MutualFriend from "../util/mutualFriend";
import RecentHistory from "../util/recentHistory";
import parseJSON from './util/parseJson';
import DotDropDown from "./util/dotDropDown";


import RankBadge from "../components/RankBadge";
import { useUserRanking } from "./util/useUserRanking";

// style
import "../style/page/Home.css";
import "../style/upload/Postpreview.css";
import "../style/upload/MultipleMedia.css";

// img
import nahIdeaAuth from "../img/nahIdeaAuth.png";
import DailyNews from './DailyNews';

// data
import { iconOptions } from "../data/post_type_data";
import Rule from './util/rule';


// api token
import api from "../api/axiosInstance";



export default function Home() {

  const navigate = useNavigate();
  const { onlineUsers } = useOutletContext();
  

  // posts
  const [posts, setPosts] = useState([]);
  const [likingPosts, setLikingPosts] = useState(new Set());
  const [favoritingPosts, setFavoritingPosts] = useState(new Set());

  // loading
  const [loading, setLoading] = useState(false); 
  const [fetching, setFetching] = useState(false); 
  const [error, setError] = useState(null);

  // pagination
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const [isRestoringScroll, setIsRestoringScroll] = useState(false);

  // Refs for latest values
  const hasRestoredScroll = useRef(false);
  const pageRef = useRef(page);
  const postsRef = useRef(posts);
  const hasMoreRef = useRef(hasMore);
  const isNavigating = useRef(false);

  const scrollYRef = useRef(0);
  const fetchingRef = useRef(false);

  // Update refs when state changes
  useEffect(() => {
    pageRef.current = page;
  }, [page]);

  useEffect(() => {
    postsRef.current = posts;
  }, [posts]);

  useEffect(() => {
    hasMoreRef.current = hasMore;
  }, [hasMore]);

  // INITIAL LOAD
  useEffect(() => {
    const saved = getScroll("home"); 
    const loadInitial = async () => {
      try {
        setLoading(true);

        if (saved.page <= 1) {
          await fetchPosts(1);
          setPage(1);
        } else {
          // Fetch all pages up to saved page
          for (let p = 1; p <= saved.page; p++) {
            await fetchPosts(p);
            if (!hasMoreRef.current) break;
          }
          setPage(saved.page);
        }
      } catch (error) {
        console.error('Error loading initial posts:', error);
      } finally {
        setLoading(false);
        setInitialLoadDone(true);
      }
    };

    loadInitial();
  }, []);

  useEffect(() => {
    scrollYRef.current = window.scrollY;
  }, []);

  // RESTORE SCROLL
  useLayoutEffect(() => {
    if (initialLoadDone && posts.length > 0 && !hasRestoredScroll.current) {
      const saved = getScroll("home");

      const attemptScroll = (attempts = 0) => {
        if (attempts > 5) return;

        const scrollY = saved.y || 0;

        window.scrollTo({
          top: scrollY,
          behavior: 'instant'
        });
        
        scrollYRef.current = scrollY;

        requestAnimationFrame(() => {
          const currentScroll = window.scrollY;
          if (Math.abs(currentScroll - scrollY) > 10 && attempts < 5) {
            setTimeout(() => attemptScroll(attempts + 1), 100);
          } else {
            hasRestoredScroll.current = true;
            setIsRestoringScroll(false);
            console.log('Scroll restored to:', window.scrollY);
          }
        });
      };

      setIsRestoringScroll(true);
      attemptScroll(0);
    }
  }, [initialLoadDone, posts.length]);

  // SAVE SCROLL - FIXED VERSION with proper refs
  useEffect(() => {

    const saveCurrentScroll = () => {
      saveScroll("home", {
        y: scrollYRef.current,
        page: pageRef.current,
      });

      console.log(
        "Saving",
        scrollYRef.current,
        pageRef.current
      );
};
    // Save on page unload or navigation
    const handleBeforeUnload = () => {
      saveCurrentScroll();
    };

    // Throttled save while scrolling
    let scrollTimeout = null;
   const handleScroll = () => {
      scrollYRef.current = window.scrollY;

      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }

      scrollTimeout = setTimeout(() => {
        saveCurrentScroll();
      }, 150);
    };

    // Save on visibility change (tab switch)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        saveCurrentScroll();
      }
    };

    // Save on click events (catch navigation clicks)
    const handleClick = (e) => {
      // Check if click is on a navigation link
      const target = e.target.closest('a, button');
      if (target) {
        const href = target.getAttribute('href');
        const onClick = target.getAttribute('onclick');
        // If it's a navigation link (internal link)
        if ((href && !href.startsWith('http') && !href.startsWith('#') && !href.startsWith('mailto:')) ||
            (onClick && onClick.includes('navigate'))) {
          saveCurrentScroll();
        }
      }
    };

    // Intercept navigation for React Router
    const originalNavigate = navigate;
    // We can't override navigate directly, so we'll use the click handler

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('scroll', handleScroll);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('click', handleClick, true);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("click", handleClick, true);

      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }

      // save last known position
      saveCurrentScroll();
    };
  }, []); 

  // SCROLL LISTENER for infinite scroll
  useEffect(() => {
    if (!initialLoadDone || isRestoringScroll) return;

    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 200 &&
        !loading &&
        !fetching &&
        hasMore
      ) {
        const next = pageRef.current + 1;
        setPage(next);
        fetchPosts(next);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loading, fetching, hasMore, initialLoadDone, isRestoringScroll]);

  // FETCH POSTS - improved version
  const fetchPosts = async (nextPage = 1) => {
    if (fetchingRef.current) return;

    fetchingRef.current = true;

    try {
      setFetching(true);
      setLoading(true);

      const res = await api.get(
        `/api/all-posts?page=${nextPage}`
      );

      const payload = res.data;
      const newPosts = payload.data;

      if (!payload || !Array.isArray(newPosts)) {
        throw new Error("Bad response");
      }

      if (newPosts.length < 25) {
        setHasMore(false);
      }

      setPosts((prev) => [...prev, ...newPosts]);
      setError(null); 
    } catch (error) {
      setError("Failed to load post");
      console.error('Fetch error:', error);
    } finally {
  fetchingRef.current = false;
  setLoading(false);
  setFetching(false);
}
  };

  const openPost = (post) => {
      saveScroll("home", { y: window.scrollY, page: pageRef.current });

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

      navigate(`/aboutpost/${post.id}`);
    };

     const openPostByComment = (post) => {
      saveScroll("home", { y: window.scrollY, page: pageRef.current });

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
  // Render post style
  const renderPostContent = (post) => {

    const data = post.data;
    if (!data) return <Text type="secondary">No content</Text>;

    switch (post.post_type) {
      case "content":
        return (
          <>
                <div className='post-caption' onClick={ () => { openPost(post) }}>
                    <p>{data.title}</p>
                </div>
              <div  className='post-thumbnail'>         
                <MediaPreview files={parseJSON(data.media_url)}/>
              </div>
          </>
        );

      case "confession":
        return (
          <>
              <div className='post-caption' onClick={ () => { openPost(post) }}>
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
                 <div className='post-caption' onClick={ () => { openPost(post) }}>
                  <p>{data.title}</p>
                </div>
                 <div className="post-question-answer-preview"
                  onClick={(e) =>{ 
                    e.stopPropagation(); 
                    navigate(`/answer/${post?.id}/${post?.data?.id}/${post?.data?.question_type}`)}}
                  style={{cursor: "pointer"}}>

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
                                <BorderOutlined className='tool-answer-icon'/>  {c.choice_text}
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

                      {data.question_type === "openend" && ( null
                      )}
                  
              </div>
              {
                post.post_type !== "question" && (
                  <div className="post-thumbnail">
                    <div className="preview-wrapper"  style={{ "--preview-url": `url(${data.media_url})` }}>
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
if (likingPosts.has(postId)) return;
setLikingPosts(prev => new Set(prev).add(postId));
  // optimistic update
  setPosts(prev =>
    prev.map(post => {

      if (post.id !== postId) return post;

      return {
        ...post,
        is_liked: !post.is_liked,
        likes_count: post.is_liked
          ? Number(post.likes_count) - 1
          : Number(post.likes_count) + 1
      };
    })
  );

  try {
   await api.post(
      `/api/posts/${postId}/${ownerId}/like`, {}
    );
  } catch (err) {

    // rollback on fail
    setPosts(prev =>
      prev.map(post => {

        if (post.id !== postId) return post;

        return {
          ...post,
          is_liked: !post.is_liked,
          likes_count: post.is_liked
            ? Number(post.likes_count) - 1
            : Number(post.likes_count) + 1
        };
      })
    );

    console.log(err);
  }
  finally {
  setLikingPosts(prev => {
    const next = new Set(prev);
    next.delete(postId);
    return next;
  });
}
}
const handleFavorite = async (postId) => {

  if (favoritingPosts.has(postId)) return;

  setFavoritingPosts(prev => new Set(prev).add(postId));

  // optimistic update
  setPosts(prev =>
    prev.map(post => {

      if (post.id !== postId) return post;

      return {
        ...post,
        is_favorited: !post.is_favorited
      };
    })
  );

  try {
    await api.post( `/api/posts/${postId}/favorite`, {})
  } catch (err) {

    // rollback
    setPosts(prev =>
      prev.map(post => {

        if (post.id !== postId) return post;

        return {
          ...post,
          is_favorited: !post.is_favorited
        };
      })
    );

    console.log(err);

  } finally {

    setFavoritingPosts(prev => {

      const next = new Set(prev);

      next.delete(postId);

      return next;

    });
  }
};

  return (
    <div className='home-container'>
      <article id="feed-article">
        <DailyNews/>
  
            {error && posts.length === 0 ? (
                <div className='error-container'><Spin style={{color: 'var(--primary-color'}}/> <br /><p>Opps! Failed to load</p></div>
              ) : posts.length === 0 && !loading ? (
                <div className='error-container'><Spin style={{color: 'var(--primary-color'}}/> <br /><p>No posts found</p></div>
              ) : (
              <>
                <List
                  dataSource={posts}
                  renderItem={(post) => (
                    <List.Item key={post.id}>
                      <div className="posts" >

                        <div className='post-header'>

                          <div className='post-user-profile'>

                            <div id="author-pf-div" 
                              style={{backgroundColor : post.is_anonymous === 1 ? post.anonymous_bg_color : "grey", cursor: post.is_anonymous === 1 ? 'none' : 'pointer'}}
                              onClick={Number(post.is_anonymous) !== 1 ? () => {navigate('/accounts', {state: {userId: post.user_id}})} : null}
                            >
                              <img 
                                src={post.is_anonymous === 1 ? nahIdeaAuth : (post.avatar_url || "https://nahidea.picocolor.site/img/content/1781684371148-nahidea-favicon.webp")} id="author-pf"
                              />
                            </div>

                            <div className='user-post-info'>
                              <p className='post-username'>
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
                              <p className='post-at'>{post.created_at}</p>
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
                                          likingPosts.has(post.id)
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
                             {post.post_type === "question" && <button className='button-action-footer' type='button' onClick={() => navigate(`/answer/${post?.id}/${post?.data?.id}/${post?.data?.question_type}`)}><FontAwesomeIcon icon={faPen} className='button-action-footer-icon'/><p><span>{post.answers_count}</span><span className='count-label'> Answer</span></p></button>}
                             <button className='button-action-footer' type='button' onClick={()=> openPostByComment(post)}><FontAwesomeIcon icon={faMessage} className='button-action-footer-icon' /><p><span>{post.comments_count}</span><span className='count-label'> Comment</span></p></button>
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
                                      favoritingPosts.has(post.id)
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

                                                      </div>
                                                    </List.Item>
                                                  )}
                                                />
                                            {loading && <div className="nextPost-load-div"><Spin /></div>}
                                            {error && posts.length > 0 && <p className="inline-error">Couldn't load more — <button onClick={() => fetchPosts(pageRef.current)}>retry</button></p>}
                                          </>
                                        )}
      </article>
      <article id='his-article'>
        <RecentHistory />
        <MutualFriend onlineUsers={onlineUsers} />
        <Rule />    
      </article>
    </div>
  );
};

function PostAuthorBadge({ userId, isAnonymous }) {
  const { badgeTier, loadings } = useUserRanking(isAnonymous ? null : userId);

  if (isAnonymous || loadings || !badgeTier) return null;

  return <RankBadge rank={badgeTier} size="sm" />;
}






