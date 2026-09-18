import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api/axiosInstance";
import { Input, Tag, Empty, Spin } from "antd";
import {
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  EyeOutlined,
  HeartOutlined,
  FormOutlined,
  QuestionCircleOutlined,
  SoundOutlined,
} from "@ant-design/icons";
import {
  Coffee,
         SquareText, 
        } from 'lucide-react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faNewspaper, faMessage } from "@fortawesome/free-regular-svg-icons";
import { faPen} from "@fortawesome/free-solid-svg-icons";
import "../style/page/YourPosts.css";

export default function YourPosts() {
  const [posts, setPosts] = useState([]);
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [search, setSearch] = useState("");

  const loadMoreRef = useRef(null);

  const fetchPosts = async () => {
    if (loading || !hasMore) return;

    try {
      setLoading(true);

      const res = await api.get(`/api/user/yourposts?page=${page}`);

      // --- Normalize: backend nests type-specific fields inside `data` ---
      const normalized = (res.data.data || []).map((post) => ({
        ...post,
        contentId: post.data?.id ?? null,
        text_body: post.data?.text_body ?? null,
        title: post.data?.title ?? "",
        media_url: post.data?.media_url ?? null,
        status:
          typeof post.status === "string"
            ? post.status.replace(/^'|'$/g, "")
            : post.status,
        question_status: post.question_status ?? post.data?.status ?? null,
      }));

      setPosts((prev) => [...prev, ...normalized]);
      setHasMore(res.data.hasMore);
      setPage((prev) => prev + 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMore && !loading) {
          fetchPosts();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [loading, hasMore]);

  const handleSolved = async (postId) => {
    const confirmed = window.confirm(
      "By marking this post as solved, Which mean the your question is solved."
    );
    if (!confirmed) return;
    try {
      await api.patch(`/api/posts/${postId}/solve`, {});

      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId ? { ...post, question_status: "solved" } : post
        )
      );
    } catch (err) {
      console.error("Failed to mark post as solved:", err);
      toast.error("Failed to mark as solved");
    }
  };

  const handleDeletePost = async (postId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this post? This can't be undone."
    );
    if (!confirmed) return;

    try {
      await api.delete(`/api/delete-post/${postId}`);
      setPosts((prev) => prev.filter((post) => post.id !== postId));
      toast.success("Post deleted successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete post");
    }
  };

  const filteredPosts = posts.filter((post) =>
    (post.title || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="history-page">
      <div className="history-header">
        <h3 className="history-title"  style={{display: 'flex', alignItems: 'center', gap: '5px', margin: 0}}>
          <SquareText /> Your Feed
        </h3>
        <div className="history-sub-div">
          <p className="history-subtitle" style={{margin:'5px 0px 0px 0px'}}>Manage all published content</p>
        </div>
      </div>

      <Input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        prefix={<SearchOutlined />}
        placeholder="Search feeds..."
        id="search-chat"
        className='search-btn-personal'
      />
      <br />
      <br />

      {filteredPosts.length === 0 && !loading ? (
        <div className='empty-gif'>
          <Coffee />
          <span>No feed yet</span>
        </div>
      ) : (
        <div className="posts-list">
          {filteredPosts.map((post) => {
            let safeImg = null;
            try {
              if (typeof post.media_url === "string") {
                if (post.media_url.trim().startsWith("[")) {
                  const arr = JSON.parse(post.media_url);
                  if (Array.isArray(arr) && arr.length > 0) {
                    safeImg = arr[0];
                  }
                } else {
                  safeImg = post.media_url;
                }
              }
            } catch (err) {
              console.warn("Invalid mediaSrc format", err);
            }

            return (
              <div
                className="post-row"
                key={post.id}
                style={{ cursor: "pointer" }}
                onClick={() => navigate(`/aboutpost/${post.id}`)}
              >
                {safeImg && (
                  <div
                    className="media-holders"
                    style={{ "--preview-url-history-post": `url(${safeImg})` }}
                  >
                    <img src={safeImg} alt="post-media" />
                  </div>
                )}

                <div className="post-main">
                  <div className="post-title-row">
                    <h3>{post.title}</h3>
                  </div>
                  <p className="post-date">{post.created_at}</p>

                  <div className="stats-row">
                    <Tag style={{ alignItems: "center" }}>
                      {post.post_type === "content" ? (
                        <FormOutlined />
                      ) : post.post_type === "question" ? (
                        <QuestionCircleOutlined />
                      ) : (
                        <SoundOutlined />
                      )}
                      {post.post_type}
                    </Tag>
                    <span>
                      <EyeOutlined />
                      {post.views_count}
                    </span>
                    <span>
                      <HeartOutlined />
                      {post.likes_count}
                    </span>
                    {post.post_type === "question" && (
                      <span>
                       <FontAwesomeIcon icon={faPen} />
                        {post.answers_count}
                      </span>
                    )}
                    <span>
                      <FontAwesomeIcon icon={faMessage} />
                      {post.comments_count}
                    </span>
                  </div>
                </div>

                <div className="post-actions">
                  {post.post_type === "content" && (
                    <button
                      className="edit-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                         navigate("/edit/content", {
                          state: { postId:  post.id, contentId: post.contentId, bodyText: post.text_body, mode: "edit" },
                        });
                      }}
                    >
                      <EditOutlined />
                      Edit Text Body
                    </button>
                  )}

                  {post.post_type === "question" && (
                    <button
                      className={
                        post.question_status === "solved"
                          ? "solve-btn solved-btn"
                          : "solve-btn"
                      }
                      disabled={post.question_status === "solved"}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (post.question_status !== "solved") {
                          handleSolved(post.id);
                        }
                      }}
                    style={
                          post.question_status === "solved" 
                            ? { background: "#E2F0D9", color: "#385723" }
                            : { background: "#FFF2CC", color: "#7F6000" }
                        }

                    >
                      <CheckCircleOutlined />
                      {post.question_status === "solved"
                        ? "Solved"
                        : "Mark Solved"}
                    </button>
                  )}

                  <button
                    className="delete-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeletePost(post.id);
                    }}
                  >
                    <DeleteOutlined />
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div ref={loadMoreRef} />

      {/* {loading && (
        <div className="loading">
          <Spin style={{color: 'var(--primary-color)'}}/>
        </div>
      )} */}
    </div>
  );
}