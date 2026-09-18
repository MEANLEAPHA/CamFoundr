// React import
import React, { useState, useRef, useCallback, useEffect} from "react";
import { useNavigate, useOutletContext  } from "react-router-dom";
import Select from "react-select";
import api from "../api/axiosInstance";
import toast from "react-hot-toast";

// util import
import {MoreFields} from "../util/moreFlieds";
import { useAnonymousTokens, AnonymousTokensCoolDown } from "../util/anonymousTokens";
import Rule from "../util/upload/Rule";
import PreviewRadio from "../util/upload/PreviewRadio";
import NahideaInfo from "../util/upload/NahideaInfo";


// data import
import { content_options } from "../data/post_type_data";

// ant import
import { Skeleton, Menu, Switch, Dropdown, Space  } from 'antd';
import {  PlusOutlined,UserOutlined, MenuFoldOutlined, MenuUnfoldOutlined,
          SearchOutlined, BellOutlined, QuestionOutlined, FormOutlined,
          SoundOutlined, LogoutOutlined, MoonFilled, SunFilled, ExceptionOutlined,
          QuestionCircleOutlined, PlusSquareOutlined, SunOutlined, MoonOutlined,
          EditOutlined ,TagsOutlined,CloudUploadOutlined,LayoutOutlined,ArrowLeftOutlined,
          AppstoreOutlined, MailOutlined, SettingOutlined,
          LeftOutlined, LoadingOutlined } from '@ant-design/icons';

// fontAwesome import
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleDot,faEllipsisVertical, faRetweet} from "@fortawesome/free-solid-svg-icons";
import { faBookmark, faCopy, faFlag, faHeart, faMessage, faPenToSquare, faTrashCan} from "@fortawesome/free-regular-svg-icons";

// style import
import "../style/upload/tag.css";
import "../style/upload/Content.css";
import "../style/upload/Postpreview.css";


// get token
const token = localStorage.getItem("token");


// Content component start here
export default function Content() {
  const [loading, setLoading] = useState(false);
  const [openPreview, setOpenPreview] = useState(false);

  const [title, setTitle] = useState("");
  const [selectType, setSelectType] = useState(null);
  const [tags, setTags] = useState([]);
  const [mediaFiles, setMediaFiles] = useState([]);

  const [textBody, setTextBody] = useState("");

  const [isAnonymous, setIsAnonymous] = useState(false);
  const { tokens, countdown, consume } = useAnonymousTokens();

  // reset all function()
  const resetAll = () => {
    setLoading(false);
    setTitle("");
    setTextBody("");
    setTags([]);
    setMediaFiles([]);
    setIsAnonymous(false);
    setSelectType(null);
  }

  // handle submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;
    setLoading(true);

    if (!title.trim()) {
      toast("Please enter content title");
      setLoading(false);
      return;
    }
    if(!textBody.trim()) {
      toast("Please enter content body");
      setLoading(false);
      return;
    }
    // if(tags.length === 0 ) {
    //   toast("Please add some #hashtags");
    //   setLoading(false);
    //   return;
    // }
    if(selectType === null) {
      toast("Please select content type");
      setLoading(false);
      return;
    }

    const formData = new FormData();
      formData.append("post_type", "content");
      formData.append("content_title", title);
      formData.append("text_body", textBody);
      formData.append("content_type", selectType?.label ?? "general");
      formData.append("isAnonymous", isAnonymous === true ? 1 : 0);
      tags?.forEach((t) => formData.append("tags[]", t));
      mediaFiles.forEach((f) => formData.append("contentFile", f));

    try {
      const res = await api.post(`/api/create-posts`, formData, { headers: {"Content-Type": "multipart/form-data"}})
      if (res.status === 200 || res.status === 201) {
        toast.success("Post created");
        if (isAnonymous) consume();

       resetAll();
       
      }
      } catch (err) {
        toast.error("Ops! Our server is Error. Please try again later.");
        resetAll();
      }
      finally{
        setLoading(false);
      };
  };

  return (

    <div id="content-container">
      <article id='tool-article' className={openPreview ? "hidden" : "flex-container"}>
   
        <form onSubmit={handleSubmit} id="content-form">
          <div id='form-header-label'>
            <p id="content-label">Create Content</p> 
            <button id='preview-toggle' type="button" onClick={() => setOpenPreview(true)} ><LayoutOutlined /> Preview</button>
          </div>

          <Select
          options={content_options}
          value={selectType}
          onChange={(option) => {
            setSelectType(option);      
          }}
          classNamePrefix="custom"
          placeholder="Select Content Topic"
          formatOptionLabel={(option) => (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >


              <span>{option.label}</span>
            </div>
          )}
        />

          <div className="title-wrapper">
            <p className="title-label" >Title</p>
            <textarea
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Title*"
                type="text"
                required
                id="title-input"
                maxLength={300} 
            />
            <div className="char-counter">
              {title.length}/300
            </div>
          </div>

          <MoreFields
            tags={tags}
            setTags={setTags}
            mediaFiles={mediaFiles}
            setMediaFiles={setMediaFiles}
            isAnonymous={isAnonymous}
            setIsAnonymous={setIsAnonymous}
            tokens={tokens}
            countdown={countdown}
            textBodyValue={textBody}
            setTextBodyValue = {setTextBody}
          />

          <div id="form-footer">
              <button type="submit" disabled={loading} id="content-post-button">
                    {loading ? <LoadingOutlined spin style={{ fontSize: 16 }} /> : "Post"}
            </button>
          </div>

        </form>
        <div id="article-rule">
          <Rule setRule="content" />
        </div>
        
      </article>

      <article id='preview-article' style={{display: openPreview ? "block" : "none"}}> 
        <PreviewRadio 
          textBody={textBody} title={title} filesMedia= {mediaFiles} postTag={tags} 
          selectType={selectType?.value} 
          isAnonymous={isAnonymous} setOpenPreview={setOpenPreview} 
          post_type ='content'

        />
      </article>
      
      <NahideaInfo />
    
    </div>
    
  );
}

