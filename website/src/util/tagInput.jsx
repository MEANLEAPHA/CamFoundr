import React,{ useState, useEffect, useRef, memo } from 'react';
import { CloseOutlined,ClearOutlined,TagOutlined  } from '@ant-design/icons';
export  function TagInput({ value = [], onChange, maxTags = 5 }) {
  const [input, setInput] = useState("");
  const [error, setError] = useState("");

  const normalize = (t) => t.trim().toLowerCase();

  const addTag = (raw) => {
    const newTag = raw.split(",").map(s => s.trim()).filter(Boolean);
    if (newTag.length === 0) return;

    let next = [...value];
    for (const t of newTag) {
      const n = normalize(t);
      if (!n) continue;
      if (next.map(normalize).includes(n)) continue; 
      if (next.length >= maxTags) {
        setError(`Maximum ${maxTags} tags allowed`);
        break;
      }
      next.push(t);
    }
    onChange?.(next);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === "," || e.key === " ") {
      e.preventDefault();
      addTag(input);
      setInput("");
    } else if (e.key === "Backspace" && input === "" && value.length) {
      const next = value.slice(0, -1);
      onChange?.(next);
    }
  };

  const handleBlur = () => {
    if (input.trim()) {
      addTag(input);
      setInput("");
    }
  };

  const removeTag = (index) => {
    const next = value.filter((_, i) => i !== index);
    setError("");
    onChange?.(next);
  };

  const clearAll = () => {
    setError("");
    onChange?.([]);
  };

  return (
    <div className="tags-input-wrapper">
      <div className="tags-label">
       <div id="tags-label-header">Tags </div> <div style={{opacity: '0.8'}}>Press Enter or comma to add tags</div>
      </div>
      
          <div className={`tags-input ${error ? "has-error" : ""}`}>
      <div id='tag-preview'>
        {value.map((t, i) => (
          <span className="tag" key={t + i}>
            <span className="tag-text">{t}</span>
            <CloseOutlined className="tag-remove"
              onClick={() => removeTag(i)}
              aria-label={`Remove ${t}`}/>
          </span>
        ))}

      </div>
      </div>
    
      <input
          className="tag-input"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            if (error) setError("");
          }}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          placeholder={value.length >= maxTags ? "" : "Type tag and press Enter or comma..."}
          disabled={value.length >= maxTags}
          style={value.length >= maxTags ? {display:"none"} : {display:"block"}}
          aria-describedby="tags-help"
        />

      <div className="tags-controls">
        <button type="button" className="btn-clear" onClick={clearAll} disabled={!value.length}>
    Remove all
        </button>
        <div id="tags-help" className="tags-count">
          {value.length} / {maxTags}
        </div>
      </div>

      {error && <div className="tags-error">{error}</div>}
     
    </div>
  );
}


export const TagsPreview = ({ tagsValue}) => {
  return (
    <>
      {/* {tagsValue.length !== 0 && <TagOutlined id='tag-icon'/>} */}
      {tagsValue.map((t, i) => (
          <span className="tag-text">#{t}</span> // will use as link later
      ))}
    </>
  );
}