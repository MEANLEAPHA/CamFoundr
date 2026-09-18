import React, { useEffect, useState, useRef, useCallback, memo } from "react";
import axios from "axios";
import { useLocation, useNavigate, useOutletContext } from "react-router-dom";
import { DeleteOutlined, EnterOutlined, LeftOutlined, LoadingOutlined, RetweetOutlined } from "@ant-design/icons";
import toast from "react-hot-toast";
import Rule from "../util/upload/Rule";
import Masonry from "react-masonry-css";
import nahideaIcon from '../img/nahideaIcon.png';
import "../style/page/Comment.css";
import { faFaceGrinWink } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMask, faUserSecret } from "@fortawesome/free-solid-svg-icons";

import { AnonymousNameC, AnonymousProfileC } from "../util/anonymousTokens";

const AnonymousPf = memo(AnonymousProfileC);
const AnonymousNm = memo(AnonymousNameC);

import api from "../api/axiosInstance";

const STATE_KEY = "comment_nav_state";
const draftKey = (postId, mode, commentId) =>
  `comment_draft_${postId}_${mode === "edit" ? commentId : "new"}`;

const Comment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useOutletContext();

  const [state] = useState(() => {
    if (location.state) {
      try {
        sessionStorage.setItem(STATE_KEY, JSON.stringify(location.state));
      } catch {
       
      }
      return location.state;
    }
    try {
      const saved = sessionStorage.getItem(STATE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const missingState = !state?.postId;

  const [selectedGif, setSelectedGif] = useState(null);
  const [gifSearch, setGifSearch] = useState("");
  const [gifs, setGifs] = useState([]);
  const [gifLoading, setGifLoading] = useState(false);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [selected, setSelected] = useState(1);

  const [lockedAnon, setLockedAnon] = useState(false);
  const [anonIdentity, setAnonIdentity] = useState(null); 

  const [showAnnoy, setShowAnnoy] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [visible, setVisible] = useState(false);

  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const hasRestoredDraft = useRef(false);

  // --- Bail out early if we truly have nothing to work with ----------

  useEffect(() => {
    if (missingState) {
      toast.error("We lost track of which post this comment belongs to.");
      navigate(-1);
    }
  }, [missingState, navigate]);

  // --- Load anonymous-identity lock state -----------------------------
  useEffect(() => {
    if (missingState) return;

    let cancelled = false;

    const fetchAnon = async () => {
   try {
          const anonRes = await api.get(`/api/get-anon-identity/${state.postId}`);
          if (!cancelled && anonRes.data?.exists) {
            setAnonIdentity({
              anonymous_name: anonRes.data.anonymous_name,
              anonymous_bg_color: anonRes.data.anonymous_bg_color,
            });
            setLockedAnon(true);
          }
        } catch (anonErr) {
          console.error("anon identity fetch failed:", anonErr);
        }

      }
    fetchAnon();
    return () => {
      cancelled = true;
    };
  }, [missingState, state?.postId]);

  useEffect(() => {
    if (lockedAnon) setEnabled(true);
  }, [lockedAnon]);

  // --- Restore content: prefer explicit nav content, else a saved draft
  useEffect(() => {
    if (missingState || hasRestoredDraft.current) return;
    hasRestoredDraft.current = true;

    if (state?.content) {
      setContent(state.content);
      return;
    }

    try {
      const saved = sessionStorage.getItem(
        draftKey(state.postId, state.mode, state.commentId)
      );
      if (saved) {
        setContent(saved);
        toast("Restored your unsent draft.", { icon: "📝" });
      }
    } catch {
      // ignore
    }
  }, [missingState, state]);

  // --- Persist the draft as the user types (debounced) ----------------
  useEffect(() => {
    if (missingState) return;
    const handle = setTimeout(() => {
      try {
        const key = draftKey(state.postId, state.mode, state.commentId);
        if (content.trim()) {
          sessionStorage.setItem(key, content);
        } else {
          sessionStorage.removeItem(key);
        }
      } catch {
        // ignore storage errors
      }
    }, 400);
    return () => clearTimeout(handle);
  }, [content, missingState, state]);

  // --- GIF search -------------------------------------------------------
  useEffect(() => {
    if (!showGifPicker) return;

    const controller = new AbortController();
    const fetchGifs = async () => {
      setGifLoading(true);
      try {
        const endpoint =
          selected === 1
            ? `/api/search-gif?q=${encodeURIComponent(gifSearch)}`
            : `/api/search-gif-fav?q=${encodeURIComponent(gifSearch)}`;
        const res = await api.get(endpoint, { signal: controller.signal });
        setGifs(res.data);
      } catch (err) {
        if (!axios.isCancel(err) && err.name !== "CanceledError") {
          console.error("GIF fetch failed", err);
          toast.error("Couldn't load GIFs. Try again in a moment.");
        }
      } finally {
        setGifLoading(false);
      }
    };

    const debounce = setTimeout(fetchGifs, 300);
    return () => {
      clearTimeout(debounce);
      controller.abort();
    };
  }, [gifSearch, selected, showGifPicker]);

  // --- Anonymous-card enter/exit animation timing ----------------------
  useEffect(() => {
    if (enabled) {
      setVisible(true);
    } else {
      const timer = setTimeout(() => setVisible(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [enabled]);

  const clearDraft = useCallback(() => {
    if (missingState) return;
    try {
      sessionStorage.removeItem(draftKey(state.postId, state.mode, state.commentId));
    } catch {
      // ignore
    }
  }, [missingState, state]);

  const submit = async () => {
    if (missingState || submitting) return;

    if (!content.trim() && !selectedGif) {
      toast.error("Write something (or add a GIF) before submitting.");
      return;
    }

    setSubmitting(true);
    const payload = {
      content,
      username_mention: state?.username_mention || null,
      user_id_mention: state?.user_id_mention || null,
      username: user.username,
      gif_url: state?.gif_url || selectedGif?.gif_url || null,
      is_anonymous: enabled ? 1 : 0,
      comment_id: state?.comment_id || null,
    };

    try {
      if (state?.mode === "edit") {
        await api.put(`/api/comments/${state.commentId}`, payload);
        toast.success("Comment updated.");
        clearDraft();
        sessionStorage.removeItem(STATE_KEY);
        navigate(`/aboutpost/${state.postId}#${state.commentId}`);
      } else {
        const res = await api.post(`/api/posts/${state.postId}/comments`, payload);
        const newCommentId = res.data.comment_id;
        toast.success("Comment posted.");
        clearDraft();
        sessionStorage.removeItem(STATE_KEY);
        navigate(`/aboutpost/${state.postId}#${newCommentId}`);
      }
    } catch (err) {
      console.error("Comment submit failed", err);
      const message =
        err.response?.data?.message ||
        (state?.mode === "edit"
          ? "Couldn't update your comment. Please try again."
          : "Couldn't post your comment. Please try again.");
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (missingState) {
    
    return null;
  }

  return (
    <div className="home-container">
      <article id="feed-article">
        <div className="comment-page">

          <div className="comments-header">
            <button
              type="button"
              className="back-btn-about-post"
              onClick={() => navigate(-1)}
              aria-label="Go back"
            >
              <LeftOutlined />
            </button>
            <button
              onClick={submit}
              className="submit-comm-btn"
              disabled={submitting || (!content.trim() && !selectedGif)}
              aria-busy={submitting}
            >
              {submitting ? <LoadingOutlined spin /> : "Submit"}
            </button>
          </div>

          {(state?.mode === "comment" || state?.mode === "reply") && (
              <div className='replyto-holder'>
                <div className='holder-header'>
                  <img src={state?.authorPf ?? nahideaIcon} className='pf-holder' style={{backgroundColor: state?.annoymousBG}}/>
                  <p className='author-name-holder'>{state?.authorName || "N/A"}</p>
                </div>
                <div className='holder-body'>
                  {
                    state?.img && <img src={state?.img} className='media-holder' />
                  }
                  <p className='content-holder'>{state?.content || "N/A"}</p>
                </div>
              </div>
          )}
          

          <div className="comments-nav">
            <div className="comments-nav-header">
              <EnterOutlined style={{transform: 'scaleX(-1)', fontSize: "25px", color: 'grey'}}/>
              <AnonymousPf
                enabled={enabled}
                realPf={user?.avatar_url || nahideaIcon}
                anonBg={anonIdentity?.anonymous_bg_color}
              />
            </div>
            
            <div className="comms-body">
              <AnonymousNm
                enabled={enabled}
                realName={user?.username || "guest"}
                anonName={anonIdentity?.anonymous_name}
              />
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Comment something about this post..."
                className="comm-textarea"
                disabled={submitting}
              />
              <div className="comms-footer">
                {!lockedAnon && state?.mode !== "edit" && (
                  <button
                    className="gif-button"
                    onClick={() => setShowAnnoy(!showAnnoy)}
                    aria-label="Toggle anonymous mode options"

                  >
                    <FontAwesomeIcon icon={faMask} />
                  </button>
                )}

                {state?.mode !== "edit" && (
                  <button
                    className="gif-button"
                    onClick={() => setShowGifPicker(!showGifPicker)}
                    aria-label="Toggle GIF picker"
                  >
                    <FontAwesomeIcon icon={faFaceGrinWink} />
                  </button>
                )}
              </div>
              {showAnnoy && (
                <div className={`anonymous-card ${visible ? "show" : "hide"}`}>
                  <FontAwesomeIcon
                    icon={faUserSecret}
                    id="anonymous-icon"
                    className={enabled ? "show" : "hide"}
                  />

                  <div className="anonymous-header">
                    <div className="anonymous-title">Anonymous Mode</div>

                    <div className={`status-badge ${enabled ? "on" : "off"}`}>
                      {enabled ? "ON" : "OFF"}
                    </div>
                  </div>
                  <p className="token-text">
                    Once you turn on anonymous mode, your identity will always be hidden on this post.
                  </p>
                  <div
                    className={`toggle-container ${enabled ? "active" : ""}`}
                    role="switch"
                    aria-checked={enabled}
                    tabIndex={0}
                    onClick={() => setEnabled(!enabled)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setEnabled(!enabled);
                      }
                    }}
                  >
                    <div className="toggle-track">
                      <div className="toggle-thumb" />
                    </div>
                  </div>
                </div>
              )}
              {showGifPicker && (
                <div>
                  <div className="radio-button-div-chat">
                    {[{ id: 1, label: "All" }, { id: 2, label: "Favorite" }].map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => setSelected(opt.id)}
                        style={{
                          borderBottom: selected === opt.id ? "2px solid #fd7648" : "2px solid transparent",
                          color: selected === opt.id ? "#fd7648" : "grey",
                        }}
                        className="radio-button-chat"
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                  <div className="gif-picker">
                    <input
                      type="text"
                      placeholder="Search GIFs..."
                      value={gifSearch}
                      onChange={(e) => setGifSearch(e.target.value)}
                      className="gif-search"
                    />
                    {gifLoading ? (
                      <div className="gif-loading">
                        <LoadingOutlined spin /> Loading GIFs…
                      </div>
                    ) : gifs.length === 0 ? (
                      <div className="gif-empty">No GIFs found.</div>
                    ) : (
                      <Masonry
                        breakpointCols={{ default: 3, 700: 2, 500: 2, 350: 1 }}
                        className="gif-masonry"
                        columnClassName="gif-masonry-column"
                      >
                        {gifs.map((gif) => (
                          <img
                            key={gif.id}
                            src={gif.gif_url}
                            alt={gif.gif_label}
                            onClick={() => {
                              setSelectedGif(gif);
                              setShowGifPicker(false);
                            }}
                            className="gif-masonry-item"
                          />
                        ))}
                      </Masonry>
                    )}
                  </div>
                </div>
              )}
              {selectedGif && (
                <div className="selected-gif-preview">
                  <img src={selectedGif.gif_url} alt="gif" className='preview-gif-holder' />
                  <div className='preview-gif-holder-action'>
                    <button onClick={() => setSelectedGif(null)} className='preview-gif-btn'><DeleteOutlined /></button>
                    <button onClick={() => setShowGifPicker(!showGifPicker)} className='preview-gif-btn'><RetweetOutlined /></button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </article>
      <article id="his-article">
        <Rule
          setRule={
            state?.postType === "question"
              ? "question-comment"
              : state?.postType === "content"
              ? "content-comment"
              : "confession-comment"
          }
        />
      </article>
    </div>
  );
};

export default Comment;
