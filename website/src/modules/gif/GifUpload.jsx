import React, { useState } from "react";
import api from "../../assets/api/axiosInstance";
import toast from "react-hot-toast";
import "./GifUpload.css";
import { gif_category } from "../../assets/data/post_type_data";
import { LeftOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

export default function GifUpload() {
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const gif_name = formData.get("gif_name");
    const gif_label = formData.get("gif_label");
    const gif_url = formData.get("gif_url");
    const gif_type = formData.get("gif_type");

    if (!gif_url.toLowerCase().endsWith(".gif")) {
      toast.error("Only .gif links are allowed.");
      return;
    }

    try {
      setLoading(true);

      const res = await api.post(
        `/api/gifs/upload`,
        { gif_name, gif_label, gif_url, gif_type }
      );
      if (res.data.success) {
        toast.success("Thanks for your contribution :)");
        setPreviewUrl("");
        e.target.reset();
        setLoading(false);
      } else {
        toast.error(res.data.error);
      }
    } catch (err) {
      console.error(err);
      toast.error("Upload failed :(");
    } finally {
      setLoading(false);
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      document.querySelector("input[name='gif_url']").value = text;
      setPreviewUrl(text);
    } catch {
      toast.error("Failed to paste from clipboard");
    }
  };
  const navigate = useNavigate();
  return (
    <div className="gif-upload-container">
       <button type='button' className='back-btn-about-post' onClick={() => navigate(-1)}><LeftOutlined /></button>
      <div className="gif-upload-header">
        <p className="p-head">Upload Your Favorite GIF Is Very Easy</p>
        <p>Support only .gif</p>
      </div>

      <form onSubmit={handleSubmit} className="gif-form">

        <div className="form-row">
          <input name="gif_name" placeholder="GIF Name (e.g. Dancing SpongeBob)" required />
          
          <select name="gif_type" required>
            <option value="">Select GIF Category</option>
            {gif_category.map((cat) => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
        </div>

        <div className="form-row">
          <input name="gif_label" placeholder="Describe:(e.g. SpongeBob dancing in the ocean)" required />
          <div className="url-input">
            <input
              name="gif_url"
              placeholder="Paste GIF URL"
              required
              onChange={(e) => setPreviewUrl(e.target.value)}
            />
            <button type="button" onClick={handlePaste}>Paste</button>
          </div>
        </div>

        {previewUrl && previewUrl.toLowerCase().endsWith(".gif") && (
          <div className="gif-preview">
            <img src={previewUrl} alt="GIF Preview" />
          </div>
        )}

        <button type="submit" disabled={loading} className="submit-btn">
          {loading ? "Uploading..." : "Upload"}
        </button>
      </form>
    </div>
  );
}
