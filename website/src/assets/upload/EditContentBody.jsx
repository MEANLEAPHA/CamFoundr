import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { EditOutlined, LoadingOutlined, LeftOutlined } from "@ant-design/icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBold,
  faItalic,
  faUnderline,
  faStrikethrough,
  faHeading,
  faSubscript,
  faSuperscript,
  faQuoteLeft,
  faLink,
  faCode,
  faList,
  faList12,
} from "@fortawesome/free-solid-svg-icons";

import toast from "react-hot-toast";
import api from "../api/axiosInstance";

import { useEditorState } from "@tiptap/react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Markdown } from "@tiptap/markdown";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";

import "../style/upload/TextBody.css";
import "../style/upload/EditTextBody.css";

const CustomLink = Link.extend({
  inclusive: false,
});

const STATE_KEY = "edit_content_nav_state";
const draftKey = (postId, contentId) => `edit_content_draft_${postId}_${contentId}`;

function TiptapEditor({ onChange, value, disabled }) {
  const [linkModal, setLinkModal] = useState({
    open: false,
    url: "",
    text: "",
  });

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        link: false, // avoid duplicate link extension
      }),
      Markdown,
      CustomLink.configure({
        openOnClick: false,
        autolink: false,
        linkOnPaste: true,
        validate: (href) => {
          try {
            const url = new URL(href);
            return ["http:", "https:"].includes(url.protocol);
          } catch {
            return false;
          }
        },
        HTMLAttributes: {
          class: "editor-link",
          rel: "noopener noreferrer",
          target: "_blank",
        },
      }),
      Placeholder.configure({
        placeholder: "Write Something Amazing...",
        showOnlyWhenEditable: true,
        showOnlyCurrent: false,
      }),
    ],
    content: value || null,
    contentType: "markdown",
    editable: !disabled,
    onUpdate: ({ editor }) => {
      onChange(editor.getMarkdown());
    },
    shouldRerenderOnTransaction: false,
  });

  const editorState = useEditorState({
    editor,
    selector: ({ editor }) => {
      if (!editor) return {};
      return {
        bold: editor.isActive("bold"),
        italic: editor.isActive("italic"),
        strike: editor.isActive("strike"),
        link: editor.isActive("link"),
        bulletList: editor.isActive("bulletList"),
        orderedList: editor.isActive("orderedList"),
        codeBlock: editor.isActive("codeBlock"),
        blockquote: editor.isActive("blockquote"),
        h1: editor.isActive("heading", { level: 1 }),
        h2: editor.isActive("heading", { level: 2 }),
        h3: editor.isActive("heading", { level: 3 }),
      };
    },
  });

  // Keep the editor's editable state in sync with `disabled` (e.g. while submitting)
  useEffect(() => {
    if (!editor) return;
    editor.setEditable(!disabled);
  }, [disabled, editor]);

  // Sync external value (e.g. restored draft) into the editor
  useEffect(() => {
    if (!editor) return;
    const current = editor.getMarkdown();
    if (value !== current) {
      editor.commands.setContent(value, { contentType: "markdown" });
    }
  }, [value, editor]);

  const isValidUrl = (url) => {
    try {
      const parsed = new URL(url);
      return ["http:", "https:"].includes(parsed.protocol);
    } catch {
      return false;
    }
  };

  const normalizeUrl = (url) => {
    if (!url) return "";
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      return "https://" + url;
    }
    return url;
  };

  const openLinkModal = () => {
    if (!editor) return;
    const { from, to } = editor.state.selection;
    const selectedText = editor.state.doc.textBetween(from, to);
    setLinkModal({
      open: true,
      url: "",
      text: selectedText || "",
    });
  };

  const applyLink = () => {
    if (!editor || !linkModal.url) return;

    const url = normalizeUrl(linkModal.url);
    if (!isValidUrl(url)) {
      toast.error("That doesn't look like a valid URL.");
      return;
    }

    const text = linkModal.text || url;

    editor
      .chain()
      .focus()
      .insertContent({
        type: "text",
        text: text,
        marks: [
          {
            type: "link",
            attrs: { href: url },
          },
        ],
      })
      .run();

    editor.commands.blur();
    setLinkModal({ open: false, url: "", text: "" });
  };

  if (!editor) return null;

  return (
    <div className="text-body-container">
      <div className="toolbar-text-body">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editorState.bold ? "active-btn" : ""}
          type="button"
          disabled={disabled}
        >
          <FontAwesomeIcon icon={faBold} />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editorState.italic ? "active-btn" : ""}
          type="button"
          disabled={disabled}
        >
          <FontAwesomeIcon icon={faItalic} />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={editorState.strike ? "active-btn" : ""}
          type="button"
          disabled={disabled}
        >
          <FontAwesomeIcon icon={faStrikethrough} />
        </button>

        <span style={{ fontSize: "large" }}> | </span>

        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={editorState.h1 ? "active-btn" : ""}
          type="button"
          disabled={disabled}
        >
          <FontAwesomeIcon icon={faHeading} />1
        </button>

        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={editorState.h2 ? "active-btn" : ""}
          type="button"
          disabled={disabled}
        >
          <FontAwesomeIcon icon={faHeading} />2
        </button>

        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={editorState.h3 ? "active-btn" : ""}
          type="button"
          disabled={disabled}
        >
          <FontAwesomeIcon icon={faHeading} />3
        </button>

        <span style={{ fontSize: "large" }}> | </span>

        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editorState.bulletList ? "active-btn" : ""}
          type="button"
          disabled={disabled}
        >
          <FontAwesomeIcon icon={faList} />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editorState.orderedList ? "active-btn" : ""}
          type="button"
          disabled={disabled}
        >
          <FontAwesomeIcon icon={faList12} />
        </button>

        <span style={{ fontSize: "large" }}> | </span>

        <button
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={editorState.codeBlock ? "active-btn" : ""}
          type="button"
          disabled={disabled}
        >
          <FontAwesomeIcon icon={faCode} />
        </button>

        <button
          onClick={openLinkModal}
          className={editorState.link ? "active-btn" : ""}
          type="button"
          disabled={disabled}
        >
          <FontAwesomeIcon icon={faLink} />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={editorState.blockquote ? "active-btn" : ""}
          type="button"
          disabled={disabled}
        >
          <FontAwesomeIcon icon={faQuoteLeft} />
        </button>
      </div>

      <EditorContent editor={editor} className="editor-body" />

      {linkModal.open && (
        <div className="link-modal">
          <input
            placeholder="Text"
            value={linkModal.text}
            onChange={(e) => setLinkModal({ ...linkModal, text: e.target.value })}
          />
          <input
            placeholder="https://..."
            value={linkModal.url}
            onChange={(e) => setLinkModal({ ...linkModal, url: e.target.value })}
          />
          <div className='link-model-action'>
            <button onClick={() => setLinkModal({ open: false, url: "", text: "" })} type="button">
              Cancel
            </button>
            <button onClick={applyLink} type="button">
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const EditContentBody = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Same recovery pattern used across the app: snapshot nav state on
  // arrival so a refresh, back/forward nav, or direct URL hit doesn't
  // strand us with `state.contentId` / `state.postId` undefined.
  const [state] = useState(() => {
    if (location.state) {
      try {
        sessionStorage.setItem(STATE_KEY, JSON.stringify(location.state));
      } catch {
        // ignore storage errors
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

  const missingState = !state?.contentId || !state?.postId;

  const [textBodyValue, setTextBodyValue] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const originalValue = useRef("");
  const hasRestoredDraft = useRef(false);

  useEffect(() => {
    if (missingState) {
      toast.error("We lost track of which post you were editing.");
      navigate(-1);
    }
  }, [missingState, navigate]);

  // Load the original body, then check for a newer unsaved draft
  useEffect(() => {
    if (missingState || hasRestoredDraft.current) return;
    hasRestoredDraft.current = true;

    const original = state?.bodyText || "";
    originalValue.current = original;

    try {
      const saved = sessionStorage.getItem(draftKey(state.postId, state.contentId));
      if (saved && saved !== original) {
        setTextBodyValue(saved);
        toast.success("Restored your unsaved edits.");
        return;
      }
    } catch {
      // ignore
    }
    setTextBodyValue(original);
  }, [missingState, state]);

  // Persist edits as a draft (debounced) so an accidental refresh doesn't lose them
  useEffect(() => {
    if (missingState) return;
    const handle = setTimeout(() => {
      try {
        const key = draftKey(state.postId, state.contentId);
        if (textBodyValue && textBodyValue !== originalValue.current) {
          sessionStorage.setItem(key, textBodyValue);
        } else {
          sessionStorage.removeItem(key);
        }
      } catch {
        // ignore storage errors
      }
    }, 400);
    return () => clearTimeout(handle);
  }, [textBodyValue, missingState, state]);

  const hasChanges = textBodyValue.trim() !== originalValue.current.trim();
  const isEmpty = !textBodyValue.trim();

  const clearDraft = () => {
    if (missingState) return;
    try {
      sessionStorage.removeItem(draftKey(state.postId, state.contentId));
      sessionStorage.removeItem(STATE_KEY);
    } catch {
      // ignore
    }
  };

  const handleUpdate = async () => {
    if (missingState || submitting) return;

    if (isEmpty) {
      toast.error("Content can't be empty.");
      return;
    }
    if (!hasChanges) {
      toast("Nothing to update.", { icon: "ℹ️" });
      return;
    }

    setSubmitting(true);
    try {
      await api.put(`/api/update-post-body-content/${state.contentId}/${state.postId}`, {
        bodyText: textBodyValue,
      });
      toast.success("Content updated.");
      clearDraft();
      navigate(-1);
    } catch (error) {
      console.error("Failed to update content", error);
      const message = error.response?.data?.message || "Couldn't save your changes. Please try again.";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (missingState) return null;

  return (
    <div className="edit-textbody-page">
      <h3 style={{ opacity: "0.9" }}>
        <EditOutlined /> Edit Content
      </h3>
      <div className="comments-header">
        <button
          type="button"
          className="back-btn-about-post"
          onClick={() => navigate(-1)}
          aria-label="Go back"
          disabled={submitting}
        >
          <LeftOutlined />
        </button>
        <button
          onClick={handleUpdate}
          className="submit-comm-btn"
          disabled={submitting || isEmpty || !hasChanges}
          aria-busy={submitting}
        >
          {submitting ? <LoadingOutlined spin /> : "Submit"}
        </button>
      </div>
      <br />
      <TiptapEditor value={textBodyValue} onChange={setTextBodyValue} disabled={submitting} />
    </div>
  );
};

export default EditContentBody;
