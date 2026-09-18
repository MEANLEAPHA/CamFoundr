import React, { useState, useEffect } from "react";
import {useLocation, Outlet, useNavigate, useOutletContext} from 'react-router-dom';
import "../style/page/Accounts.css";
import gossiperlogo from "../img/gossiperlogo.png";
// add at the top of Accounts.jsx
import toast from "react-hot-toast";
// antd
import { List, Card, Avatar, Typography, Tag, Space, Spin, Empty, Button, Dropdown, message} from "antd";
const { Title, Text } = Typography;
import {  PlusOutlined,UserOutlined, MenuFoldOutlined, MenuUnfoldOutlined,SearchOutlined, BellOutlined, QuestionOutlined,
          FormOutlined, MenuOutlined, SoundOutlined, LogoutOutlined, MoonFilled, SunFilled, ExceptionOutlined, QuestionCircleOutlined, 
          SettingOutlined, PlusSquareOutlined, SunOutlined, MoonOutlined, ReloadOutlined,FlagOutlined,LinkOutlined,DeleteOutlined,
          EditOutlined ,TagsOutlined,CloudUploadOutlined,LayoutOutlined,ArrowLeftOutlined,AppstoreOutlined, MailOutlined,
          ToolOutlined,
          CalendarOutlined,
          BorderOutlined,
      } from '@ant-design/icons';
import{SignatureOutlined, FolderOpenOutlined} from '@ant-design/icons';

// fontAwesome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen, faQuoteLeft, faQuoteRight, faRankingStar, faTriangleExclamation} from "@fortawesome/free-solid-svg-icons";
import { faCircleDot,faEllipsisVertical, faRetweet} from "@fortawesome/free-solid-svg-icons";
import { faBookmark, faCircle, faCopy, faFlag, faHeart, faMessage, faPenToSquare, faTrashCan} from "@fortawesome/free-regular-svg-icons";
import { faThumbsDown, faThumbsUp,  faHandPointer, faHandPeace, faHand, faLocationCrosshairs, faStar} from "@fortawesome/free-solid-svg-icons";

// lucide
import {
  Heart,
  HeartOff,
  Bookmark,
  LoaderCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// util
import {MediaPreview} from "../util/mediaUploader";

import RankBadge from "../components/RankBadge";
import { useUserRanking } from "../page/util/useUserRanking";


import MutualFriend from "../util/mutualFriend";
import RecentHistory from "../util/recentHistory";
import parseJSON from './util/parseJson';
import DotDropDown from "./util/dotDropDown";

// img
import nahIdeaAuth from "../img/nahIdeaAuth.png";
import nahideaIcon from '../img/nahideaIcon.png';


// data
import { iconOptions } from "../data/post_type_data";

// api
import api from "../api/axiosInstance";

export default function Accounts() {
    const { state } = useLocation(); 
    const navigate = useNavigate();
 
    

    const { user, onlineUsers } = useOutletContext();

    const targetId = state?.userId || sessionStorage.getItem("profileUserId") || user?.id;
    const { rank, score, badgeTier, loadings: rankLoading } = useUserRanking(targetId);

    // follow
    const [followState, setFollowState] =useState("follow");

    // loading
    const [loading, setLoading] = useState(false); 
    const [fetching, setFetching] = useState(false); 
    const [source, setSource] = useState("");
    const [error, setError] = useState(null);

    // pagination
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    
    // posts
    const [posts, setPosts] = useState([]);
    const [likingPosts, setLikingPosts] = useState(new Set());
    const [favoritingPosts, setFavoritingPosts] = useState(new Set());


    // data render
    const [usernames, setUsernames] = useState("");
    const [userId, setUserId] = useState("");
    const [nicknames, setNicknames] = useState("");
    const [avatar, setAvatar] = useState("");
    const [banner, setBanner] = useState("");
    const [workplace, setWorkplace] = useState("");
    const [bios, setBios] = useState("");
    const [professions, setProfessions] = useState("");
    const [followings, setFollowings] = useState(0);
    const [followers, setFollowers] = useState(0);
    const [postCount, setPostCount] = useState(0);
    const [joinAt, setJoinAt] = useState("");
 

    const [isOwnProfile, setIsOwnProfile] = useState(false);

    useEffect(() => {
      if (state?.userId) {
        sessionStorage.setItem("profileUserId", state.userId);
      }

      const targetId = state?.userId || sessionStorage.getItem("profileUserId") || user?.id;

      setIsOwnProfile(String(targetId) === String(user?.id));

      fetchPosts(1, Number(targetId));
      setPage(1);
      fetchFollowStatus();
      handleFetchProfile(targetId); // pass it through
    }, [targetId]);

    const handleFetchProfile = async (targetId) => {
      if (!targetId) return;

      // Reset immediately so a slow/failed fetch can never show the PREVIOUS profile's data
      setUsernames("");
      setUserId("");
      setNicknames("");
      setAvatar("");
      setBanner("");
      setWorkplace("");
      setBios("");
      setProfessions("");
      setFollowings(0);
      setFollowers(0);
      setPostCount(0);
      setJoinAt("");
      

      try {
        const res = await api.get(`/api/get-user-info/${targetId}`); // use the param, not state?.userId

        const data = res.data.userData;
        setUsernames(data.username);
        setUserId(data.id);
        setNicknames(data.nickname);
        setAvatar(data.avatar_url);
        setBanner(data.banner_url);
        setWorkplace(data.work_place);
        setBios(data.bio);
        setProfessions(data.profession);
        setFollowings(data.following_count);
        setFollowers(data.followers_count);
        setPostCount(data.post_count || 0);
        setJoinAt(data.created_at);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load profile"); // surface it instead of silently failing
      }
    };
    useEffect(() => {
      const handleScroll = () => {
        if (
          window.innerHeight + window.scrollY >=
            document.body.offsetHeight - 200 &&
          !loading &&
          !fetching &&
          hasMore
        ){
          setPage((prev) => {
            const next = prev + 1;
            fetchPosts(next);
            return next;
          });
        }
      };
  
      window.addEventListener("scroll", handleScroll);
      return () => window.removeEventListener("scroll", handleScroll);
    }, [loading, fetching, hasMore]);

    const fetchPosts = async (nextPage = 1, userId) => {
        if (fetching) return;
        try {
            setFetching(true);
            setLoading(true);

            const res = await api.get(`/api/user/${userId}/posts?page=${nextPage}`);
            const payload = res.data;
            const newPosts = payload.data;

            if (!payload || !Array.isArray(newPosts)) {
              throw new Error("Bad response");
            }

            if (newPosts.length < 25) {
              setHasMore(false);
              
            }

            setPosts((prev) => [...prev, ...newPosts]);
            setSource(payload.source);
        } catch {
            setError("Failed to load post");
        } finally {
            setLoading(false);
            setFetching(false);
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
            {/* <div className="post-thumbnail">
              <div
                className="preview-wrapper"
                style={{ "--preview-url": `url(${data.media_url})` }}
              >
                <img src={data.media_url} className="preview-image" alt="confession" />
              </div>
            </div> */}
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
                navigate(`/answer/${post?.id}/${post?.data?.id}/${post?.data?.question_type}`)
              }}
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


          await api.post(`/api/posts/${postId}/${ownerId}/like`, {});

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
    };

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


        await api.post(`/api/posts/${postId}/favorite`, {});

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

    const handleFollow = async () => {
      if ( followState === "loading" ) {
        return;
      }
      try {
        setFollowState("loading");

        if (
          followState === "follow" ||
          followState === "follows_you"
        ) {

          const res = await api.post(`/api/add-follow/${state?.userId}`, {})

          /*
          MUTUAL FOLLOW
          */

          if (res.data.mutual) {

            setFollowState("mutual");

          } else {

            setFollowState("following");

          }

          return;
        }


        if (
          followState === "following" ||
          followState === "mutual"
        ) {

            const confirmed = window.confirm(
            `Are you sure you want to unfollow this user? This can't be undone.`
           );
          if (!confirmed) return;

          await api.delete(`/api/unfollow/${state?.userId}`);


          const res = await api.get(`/api/follow-status/${state?.userId}`);

          setFollowState(
            res.data.state
          );

        }

      } catch (err) {
        console.log(err);
        setFollowState("follow");
      }
    };

    const fetchFollowStatus = async () => {

        try {

          const res = await api.get(`/api/follow-status/${state?.userId}`);

          setFollowState(
            res.data.state
          );

        } catch (err) {

          console.log(err);

        }
    };

    const Unfollow = () => {
      const handleUnfollow = async () => {
        try{

          const response = await api.delete(`/api/unfollow/${state?.userId}`);

          const data = response.data;
          if(data.mutual === false){
            setFollowState("follow");
          }

        }
        catch(err){
          console.error('Full error:', err.response?.data); 
          console.error('Status:', err.response?.status);
        }
      }
      return(
        <button className="pf-act-btns" onClick={()=>{handleUnfollow()}}>
          Unfollow
        </button>
      )
    };

    const [hoveredPostId, setHoveredPostId] = useState(null);
  
  return (
    <div className="accounts-page">
      <div className="accounts-header">  
        <div id='acc-banner' style={{ "--preview-url-banner": `url(${banner || user?.banner_url || "https://nahidea.picocolor.site/img/content/1781684161514-Nahidea-Auth-bg.webp"})` }}>
            <img src={banner || user?.banner_url || "https://nahidea.picocolor.site/img/content/1781684161514-Nahidea-Auth-bg.webp"} id="img-banner"/>
        </div>
        <div id='acc-pf-info'>
            <div className='acc-pf-info-child acc-pf-info-child-left'>
                <div id='acc-pf-div'>
                    <img src={avatar || user?.avatar_url || nahideaIcon} id='acc-pf'/>
                </div>
                <div id="user-pf-iden">
                    <p id='username-pf'>
                      {usernames || user?.username || "N/A"}
                      {!rankLoading && badgeTier && <RankBadge rank={badgeTier} size="sm" />}
                    </p>
                    <p id='user-profession-pf'>{professions || user?.profession || "N/A"} at {workplace || user?.work_location || "N/A"}</p>
                </div>
            </div>
            <div className='acc-pf-info-child acc-pf-info-child-right'>
                <div style={{display:'flex', gap:'8px', alignItems: 'center'}}>
                  {
                    !isOwnProfile && !followState && followState !== "follows_you" && (
                    <button className='pf-act-btn' type="button" disabled style={{background: 'none', border:'none', fontFamily: 'monospace'}} >
                      {followState === "following" ? 'Following' : followState === 'mutual' ? 'Friends' : null}
                    </button>
                    ) 
                 } 
                  {
                    !isOwnProfile && (
                      <button className="pf-act-btn" type="button" onClick={()=> handleFollow()}>
                      { followState === "loading" && "Following..." }
                      { followState === "follow" && "Follow" }
                      { followState === "following" && "Unfollow"}
                      { followState === "follows_you" && "Follow Back" }
                      { followState === "mutual" && "Unfollow"}
                    </button>
                    ) 
                 } 
                {
                    !isOwnProfile && ( 
                      <button className='pf-act-btn' type="button" 
                       onClick={() => navigate('/chat', {state:{selected: followState === "mutual" ? 1 : 2, activeChat: {avatar_url: avatar, username: usernames, id: userId || state?.userId}}})}
                       >
                      <img src={gossiperlogo} className='sub-icon-logo' style={{width: '25px'}}/> <span className='label-brand'>Gossip</span></button>
                    )
                  }
                   {
                    !isOwnProfile && ( 
                      <button className='pf-act-btn' type="button" onClick={() => navigate('/nudge' , {
                        state: {
                          username: usernames,
                          id: userId || state?.userId,
                          avatar: avatar
                        }
                      })}><FontAwesomeIcon icon={faTriangleExclamation} fade style={{color: "rgb(255, 212, 59)",}} className='sub-icon'/> <span className='label-brand'>Spammy</span></button>
                      )
                   } 
                  {
                      isOwnProfile && (
                         <button className='pf-act-btn' type="button" onClick={()=>navigate('/editaccount', 
                          {state:
                             { username: user?.username, 
                               profession: user?.profession,
                               workplace: user?.work_location, 
                               bio: user?.bio, 
                               avatar: user?.avatar_url, 
                               avatarType: 
                                typeof user?.avatar_url === 'string' && user?.avatar_url.startsWith('https://api.dicebear.com') ? 'url' : 'file',
                               banner: user?.banner_url,
                               email: user?.email,
                               userId: user?.id,
                               nickname: user?.nickname
                              }}
                         )}><ToolOutlined /> Edit Profile</button>
                      )
                   }
                   
                </div>
                <MenuDropDown/>
            </div>
            
        </div>
      </div>
      <div className="accounts-body">  
        <div id="data-outlet">
         {error ?
                    (  
                      <div className='error-container'>
                          <Spin style={{color: "var(--primary-color)"}}/>
                          <br />
                          <p>Opps! Failed to load</p>
                      </div>
                    ) 
                    :
                    posts.length === 0 && !loading ? 
                    (
                        <div className='error-container'>
                            <Spin style={{color: "var(--primary-color)"}}/>
                            <p>No posts found</p>
                        </div>
                    ) 
                    : 
                    (
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
                              {post.is_anonymous === 1 ? post.anonymous_name : post.username}
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
                            )}/>

                            {loading && (
                                <div className="nextPost-load-div">
                                    <Spin style={{color: "var(--primary-color)"}}/>
                                </div>
                            )}
                        </>
                    )
                }

        </div>

        
        <div id='data-full-info'>

          
          <h3 className='fri-list-label'>About {usernames || user?.username || "N/A"}</h3>
          <div id='user-bio'>
           
             <div id='stats-data'>
            <div className='stats-data-items'>
              <span className='data-render-stats'>{followers}</span>
                <span className='label-render-stats'>Followers</span>
                
            </div>
            <div className='stats-data-items'>
              <span className='data-render-stats'>{followings}</span>
                <span className='label-render-stats'>Following</span>
              
            </div>
            <div className='stats-data-items'>
              <span className='data-render-stats'>{postCount}</span>
                <span className='label-render-stats'>Posts</span>
                
            </div>
          </div>
             
            <p id='bio'><FontAwesomeIcon icon={faQuoteLeft} className='q-bio'/> {bios || user?.bio || "N/A"} <FontAwesomeIcon icon={faQuoteRight} className='q-bio'/> - @{nicknames || user?.nickname || "N/A"}</p>
            
            {
              (state?.userId) === 1 && <p id='join-at'>
              <SunFilled style={{ color: "#F59E0B" }}/> Founder
            </p>
            }
            <p id='join-at'>
              <FontAwesomeIcon icon={faRankingStar} /> Rank: {rank ?? "Unranked"}, Score: {score}
            </p>
            <p id='join-at'>  <CalendarOutlined /> Join at: {formatJoinDate(joinAt) || "N/A"}</p>
          </div>
          <FriendList targetUsername={usernames} tagetUserId={state?.userId || user?.id}/>

         

        </div>
      </div>
    </div>
  );
}
const formatJoinDate = (dateString) => {
  if (!dateString) return "N/A";
  
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
};


  const MenuDropDown = () =>{
    const navigate = useNavigate();
    const { state } = useLocation();
    const upload_items = [
      {
        label: (
          <li onClick={(e) => {
            e.stopPropagation();
            navigate("/reportUser", {
              state: {
                userId:  state?.userId || sessionStorage.getItem("profileUserId") || user?.id
              }
            })
          }}>
            <FlagOutlined /> <span>Report User</span>
          </li>
        ),
        key: '0',
      },
      ];
    return(
      <Dropdown menu={{ items: upload_items }} trigger={['click']} classNames={{ root: "profile-dropdown create-dropdown"}}>
        <button className='pf-act-btn menu-btn' type="button"><MenuOutlined /></button>
    </Dropdown>
    )
  }

const FriendList = ({targetUsername, tagetUserId}) => {
  const [friendList, setFriendList] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { state } = useLocation();
  const { user } = useOutletContext();

  const fetchFriendList = async () => {
    try {
      setLoading(true);
      const targetUserId = state?.userId || user?.id;
      
      if (!targetUserId) {
        console.error("No user ID available");
        return;
      }

      const res = await api.get(`/api/get-friends-by-id/${targetUserId}`);
      
      if (res.data) {
        setFriendList(res.data.data || []);
      }
    } catch (err) {
      console.error("Error fetching friends:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFriendList();
  }, [state?.userId, user?.id]); // Fixed dependencies

  if (loading) {
    return (
      <div className='friend-list'>
        <div className='friend-list-header'>
          <h3 className='fri-list-label'>Friend List</h3>
        </div>
        <div className='friend-list-body'>
          <div className="loading-friends">Loading friends...</div>
        </div>
      </div>
    );
  }

  if (!friendList.length) {
    return null;
  }

  return (
    <div className='friend-list'>
      <div className='friend-list-header'>
        <h3 className='fri-list-label'>Friend List</h3>
        <button onClick={() => navigate('/friends', {state: {userId: tagetUserId || user?.id, username: targetUsername || user?.username}})} id='view-allfri-btn'>
          <span>View All</span>
        </button>
      </div>
      <div className='friend-list-body'>
        {friendList.map((friend, index) => (
          <div 
            className='friend-list-items' 
            key={friend.id || index}
            onClick={() => navigate(`/accounts`, { state: { userId: friend.id } })}
            style={{ cursor: 'pointer' }}
          >
            <img 
              src={friend.avatar_url || nahideaIcon} 
              alt={friend.username}  
              className="fri-img" 
            />
            <div className='fri-name'>
              {friend.username}
            </div>              
          </div>
        ))}
      </div>
    </div>
  );
};
