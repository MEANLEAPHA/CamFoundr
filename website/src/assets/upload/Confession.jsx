// React import
import React, { useState, useRef, useCallback, useEffect} from "react";
import { useNavigate, useOutletContext  } from "react-router-dom";
import Select from "react-select";
import axios from "axios";
import api from "../api/axiosInstance";
import toast from "react-hot-toast";

// data import
import { confession_options } from "../data/post_type_data";

// util import
import {MoreFieldsCon} from "../util/moreFlieds";
import Rule from "../util/upload/Rule";
import PreviewRadio from "../util/upload/PreviewRadio";
import { useAnonymousTokens, AnonymousTokensCoolDown} from "../util/anonymousTokens";
import NahideaInfo from "../util/upload/NahideaInfo";


// ant import
import {  PlusOutlined,UserOutlined, MenuFoldOutlined, MenuUnfoldOutlined,SearchOutlined, BellOutlined, QuestionOutlined, 
          FormOutlined, SoundOutlined, LogoutOutlined, MoonFilled,
          SunFilled, ExceptionOutlined, QuestionCircleOutlined, PlusSquareOutlined, SunOutlined, MoonOutlined,
          EditOutlined ,TagsOutlined,CloudUploadOutlined,LayoutOutlined,ArrowLeftOutlined,AppstoreOutlined, MailOutlined, SettingOutlined,
          LeftOutlined, LoadingOutlined } from '@ant-design/icons';
import { Dropdown, Space, Skeleton, Menu, Switch  } from 'antd';

// fontAwesome import
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleDot,faEllipsisVertical, faRetweet} from "@fortawesome/free-solid-svg-icons";
import { faBookmark, faCopy, faFlag, faHeart, faMessage, faPenToSquare, faTrashCan} from "@fortawesome/free-regular-svg-icons";

// style
import "../style/upload/tag.css";
import "../style/upload/Content.css";
import "../style/upload/Postpreview.css";




export default function Confession() {

  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [selectType, setSelectType] = useState(null);
  const [selectedIcon, setSelectedIcon] = useState(null);
  const [confessionFile, setFile] = useState(null);
  const refFile = useRef(null);
  const [tags, setTags] = useState([]);
  const [isAnonymous, setIsAnonymous] = useState(false);

  const { tokens, countdown, consume } = useAnonymousTokens();
  const [openPreview, setOpenPreview] = useState(false);

  const resetAll = () => {
    setTitle("");
    setTags([]);
    setFile(null);
    setIsAnonymous(false);
    setSelectType(null);
    setLoading(false);
    if(refFile.current){
      refFile.current.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (loading) return;
    setLoading(true);

    if (!title.trim()) {
      toast.error("Please enter confession title");
      setLoading(false);
      return;
    }
    if(selectType === null) {
              toast("Please select confession topic");
              setLoading(false);
              return;
    }
    // if(tags.length === 0 ) {
    //       toast("Please add some #hashtags");
    //       setLoading(false);
    //       return;
    // }

    const formData = new FormData();
    tags?.forEach((t) => formData.append("tags[]", t));
    formData.append("post_type", "confession");
    formData.append("confession_title", title);
    formData.append("confession_type", selectType?.label ?? "general");
    formData.append("isAnonymous", isAnonymous === true ? 1 : 0);
    if (confessionFile) {
      formData.append("confessionFile", confessionFile);
    }

    try {
      const res = await api.post(`/api/create-posts`, formData, { headers: {'Content-Type': 'multipart/form-data'}})

      if (res.status === 201 || res.status === 200) {
        toast.success(res.data.message || "Confession posted successfully");
        if (isAnonymous) consume();
        resetAll();
      } else {
        toast.error("Ops! Our server is Error. Please try again later.");
        resetAll();
      }
    } catch (err) {
      console.error(err);
      toast.error(
        "Server error, please try again later"
      );
      resetAll();
    }
    finally {
      setLoading(false);
    }
    
  };

  return (
    <div id="content-container">
      <article id='tool-article' className={openPreview ? "hidden" : "flex-container"}>
        <form onSubmit={handleSubmit} id="content-form">
          <div id='form-header-label'>
            <p id="content-label">Create Confession</p> 
            <button id='preview-toggle' type="button" onClick={() => setOpenPreview(true)} ><LayoutOutlined /> Preview</button>
          </div>

          <Select
              options={confession_options}
              value={selectType}
              onChange={(option) => {
                setSelectType(option);       
              }}
              classNamePrefix="custom"
              placeholder="Select Confession Topic"
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
              <p className="title-label" >Confession Text</p>
              <textarea
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Write your confession here..."
                type="text"
                required
                id="title-input"
                maxLength={300}
              />
              <div className="char-counter">
                {title.length}/300
              </div>
            </div>
            <MoreFieldsCon
              tags={tags}
              setTags={setTags}
              isAnonymous={isAnonymous}
              setIsAnonymous={setIsAnonymous}
              tokens={tokens}
              countdown={countdown}
              conAndQuesFileValue={confessionFile}
              setConAndQuesFileValue={setFile}
              fileInputRef={refFile}
            />
       
            <div id="form-footer">
              <button type="submit" disabled={loading} id="content-post-button">
                {loading ? <LoadingOutlined spin style={{ fontSize: 16 }} /> : "Confess"}
              </button>
            </div>
        
        </form>
        <div id="article-rule">
          <Rule setRule="confession" />
        </div>
      </article>

      <article id='preview-article' style={{display: openPreview ? "block" : "none"}}> 
        <PreviewRadio  
          title={title} filesMedia= {confessionFile} postTag={tags} selectType={selectType?.value} 
          isAnonymous={isAnonymous} setOpenPreview={setOpenPreview} post_type='confession'
          />
      </article>

      <NahideaInfo />
      
    </div>
  );
}
