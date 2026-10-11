import React, { useRef, useMemo, useState } from "react";
import { RightOutlined, CloseOutlined, TagsOutlined, CloudUploadOutlined, DeleteOutlined, PlusOutlined, ClearOutlined, LeftOutlined } from '@ant-design/icons';
import { Carousel } from 'antd';
import { Skeleton } from 'antd';
import toast from "react-hot-toast";

// Adjust these to your actual limits
const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const BLOCKED_TYPES = ["image/gif"]; // explicit block for GIFs
const isVideoType = (type = "") => type.startsWith("video/");


const validateFile = (file) => {
  const type = file.type || "";

  if (isVideoType(type)) {
    return { valid: false, reason: `"${file.name}" is a video — only images are allowed.` };
  }

  if (BLOCKED_TYPES.includes(type)) {
    return { valid: false, reason: `"${file.name}" is a GIF — GIFs aren't allowed.` };
  }

  if (!type.startsWith("image/")) {
    return { valid: false, reason: `"${file.name}" isn't a supported image file.` };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return { valid: false, reason: `"${file.name}" is too large — max ${MAX_FILE_SIZE_MB}MB.` };
  }

  return { valid: true };
};

/**
 * Filters a FileList/array down to valid files, toasting a reason for each rejection.
 */
const filterValidFiles = (files) => {
  const accepted = [];
  for (const file of files) {
    const result = validateFile(file);
    if (result.valid) {
      accepted.push(file);
    } else {
      toast.error(result.reason);
    }
  }
  return accepted;
};

export function MediaUploader({ maxFiles = 5, value = [], onChange }) {
  const multiInputRef = useRef(null);

  const handleMultiSelect = (e) => {
    const selected = Array.from(e.target.files || []);
    if (!selected.length) return;

    const validFiles = filterValidFiles(selected);
    if (!validFiles.length) {
      if (multiInputRef.current) multiInputRef.current.value = "";
      return;
    }

    const next = [...value];
    for (let i = 0; i < maxFiles && validFiles.length; i++) {
      if (!next[i]) next[i] = validFiles.shift() || null;
    }

    if (validFiles.length > 0) {
      // Some valid files didn't fit because maxFiles was reached
      toast.error(`Only ${maxFiles} files allowed — ${validFiles.length} file${validFiles.length > 1 ? "s" : ""} skipped.`);
    }

    onChange?.(next.filter(Boolean));
    if (multiInputRef.current) multiInputRef.current.value = "";
  };

  const handleSingleSelect = (index, e) => {
    const file = e.target.files[0];
    if (!file) return;

    const result = validateFile(file);
    if (!result.valid) {
      toast.error(result.reason);
      e.target.value = "";
      return;
    }

    const next = [...value];
    next[index] = file;
    onChange?.(next.filter(Boolean));
    e.target.value = "";
  };

  const handleRemove = (index) => {
    const next = [...value];
    next.splice(index, 1);
    onChange?.(next);
  };

  const handleRemoveAll = () => {
    onChange?.([]);
    if (multiInputRef.current) multiInputRef.current.value = "";
  };

  const filledCount = value.length;
  const remaining = maxFiles - filledCount;

  const mediaFileUrl = (file) => URL.createObjectURL(file);

  return (
    <div className="media-uploader">

      {filledCount === 0 ? (
        <label className="upload-placeholder">
          <CloudUploadOutlined id='cloud-icon' />
          <input
            ref={multiInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleMultiSelect}
            className="file-input"
          />
          <small className="upload-hint">
            You can select up to {maxFiles} files at once. GIFs and videos aren't supported, max {MAX_FILE_SIZE_MB}MB each.
          </small>
        </label>
      ) : (

        <Carousel arrows infinite={true} className="media-carousel" swipe={true} draggable={true} autoplay={{ pauseOnHover: true }} autoplaySpeed={10000}
          prevArrow={<button className="slick-arrow slick-prev"><LeftOutlined /></button>}
          nextArrow={<button className="slick-arrow slick-next"><RightOutlined /></button>}>
          {value.map((file, idx) => (
            <div className="carousel-slide" key={idx}>
              {file ? (
                <>
                  {(file.type || "").startsWith("image/") ? (
                    <div
                      className="preview-wrapper"
                      style={{ "--preview-url": `url(${mediaFileUrl(file)})` }}
                    >
                      <img src={mediaFileUrl(file)} alt={file.name} className="preview-image" />
                      <button type="button" onClick={() => handleRemove(idx)} className="remove-btn"><DeleteOutlined /></button>
                    </div>

                  ) : (
                    <div className="video-placeholder">Video file selected</div>
                  )}
                </>
              ) : (
                <label className="add-file-label">
                  <div className="add-file-text">Add file</div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleSingleSelect(idx, e)}
                    className="file-input"
                  />
                </label>
              )}
            </div>
          ))}
        </Carousel>

      )}
      {
        filledCount > 0 && (
          <div className="uploader-footer">

            {remaining > 0 && (
              <div className="add-more">
                <label className="add-more-label">
                  <button className="add-more-text" type="button" onClick={() => multiInputRef.current.click()}>
                    <PlusOutlined /> Add up to {remaining} more file{remaining > 1 ? "s" : ""}
                  </button>
                  <input
                    ref={multiInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleMultiSelect}
                    className="file-input"
                  />
                </label>
              </div>
            )}
            {remaining === 0 && (
              <button type="button" disabled='true' style={{ visibility: 'hidden' }}>Empty</button>
            )}
            <div className="uploader-footer-right">
              <button
                type="button"
                onClick={handleRemoveAll}
                disabled={filledCount === 0}
                className="remove-all-btn"
                style={filledCount > 1 ? { display: "block" } : { display: "none" }}
              >
                Remove all
              </button>
              <div className="media-count">
                {filledCount} / {maxFiles}
              </div>
            </div>
          </div>
        )
      }
    </div>
  );
}

export function MediaPreview({ files = [] }) {
  const normalizedFiles = Array.isArray(files) ? files : [files];
  const safeFiles = normalizedFiles.filter(Boolean);

  if (!safeFiles.length) return null;

  const mediaFileUrl = (file) =>
    file instanceof File ? URL.createObjectURL(file) : file;

  return (
    <Carousel
      arrows
      infinite
      className="media-preview-carousel"
      swipe
      draggable
      autoplay={{ pauseOnHover: true }}
      autoplaySpeed={8000}
      prevArrow={
        <button className="slick-arrow slick-prev">
          <LeftOutlined />
        </button>
      }
      nextArrow={
        <button className="slick-arrow slick-next">
          <RightOutlined />
        </button>
      }
    >
      {safeFiles.map((file, idx) => {
        const isImage =
          typeof file === "string" ||
          (file && file.type && file.type.startsWith("image/"));

        return (
          <div className="carousel-slide" key={idx}>
            {isImage ? (
              <div
                className="preview-wrapper"
                style={{ "--preview-url": `url(${mediaFileUrl(file)})` }}
              >
                <img
                  src={mediaFileUrl(file)}
                  alt={file?.name || `preview-${idx}`}
                  className="preview-image"
                />
              </div>
            ) : (
              <div className="video-placeholder">Video file selected</div>
            )}
          </div>
        );
      })}
    </Carousel>
  );
}