// React State
import React,{ useState, useEffect, useRef, memo } from 'react';
import { useNavigate, useOutletContext } from "react-router-dom";

import Select from "react-select";
import api from "../api/axiosInstance";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBookmark, faCopy, faFlag, faHeart, faMessage, faPenToSquare, faTrashCan} from "@fortawesome/free-regular-svg-icons";
import { faCircleDot,faEllipsisVertical, faRetweet} from "@fortawesome/free-solid-svg-icons";

import {TagInput }from "../util/tagInput";
import { useAnonymousTokens, AnonymousTokensCoolDown, AnonymousName, AnonymousProfile} from "../util/anonymousTokens";
import toast from "react-hot-toast";
import { question_options,iconOptions, question_type } from "../data/post_type_data";


// util
import Rule from "../util/upload/Rule";
import PreviewRadio from "../util/upload/PreviewRadio";
import NahideaInfo from "../util/upload/NahideaInfo";
import {MoreFieldsConAndQues} from "../util/moreFlieds";
import{TagsPreview} from "../util/tagInput";

// import question type
import ClosedEnd from './questionType/ClosedEnd';
import OpenEnd from './questionType/OpenEnd';
import Range from './questionType/Range';
import SingleChoice from './questionType/SingleChoice';
import MultipleChoice from './questionType/MultipleChoice';
import RankingOrder from './questionType/RankingOrder';
import Rating from './questionType/Rating';

// ant
import { Skeleton, Menu, Switch, Dropdown, Space  } from 'antd';
import { EditOutlined ,TagsOutlined,CloudUploadOutlined,LayoutOutlined,ArrowLeftOutlined,AppstoreOutlined, MailOutlined, SettingOutlined,
         PlusOutlined,UserOutlined, MenuFoldOutlined, MenuUnfoldOutlined,SearchOutlined, BellOutlined, QuestionOutlined, FormOutlined, SoundOutlined,
         LogoutOutlined, MoonFilled, SunFilled, ExceptionOutlined, QuestionCircleOutlined, PlusSquareOutlined, SunOutlined, MoonOutlined, LeftOutlined, LoadingOutlined
        } from '@ant-design/icons';



// style 
import "../style/upload/tag.css";
import "../style/upload/Postpreview.css";
import "../style/upload/Content.css";

const AnonymousPf = memo(AnonymousProfile);
const AnonymousNm = memo(AnonymousName);

export default function Questiion(){


  const [loading, setLoading] = useState(false);
  // question setence
  const [title, setTitle] = useState('');

  // question topic related
  const [selectType, setSelectType] = useState(null);

  // tag state
  const [tags, setTags] = useState([]);


  // question type state
  const [questionType, setQuestionType] = useState('openend');


    // Range state
    const [min, setMin] = useState(0);
    const [max, setMax] = useState(100);
    const [step, setStep] = useState(1);
    const [rangeValue, setRangeValue] = useState(0);

    // single choice
    const [singleChoices, setSingleChoices] = useState(["", "", ""]);

    // multiple choice
    const [multipleChoices, setMultipleChoices] = useState(["", "", ""]);
    const [includeAllAbove, setIncludeAllAbove] = useState(0);
  
    // ranking order
    const [rankingChoices, setRankingChoices] = useState(["", "", ""]);

    // rating 
    const [ratingIconId, setRatingIconId] = useState(1);

  const [isAnonymous, setIsAnonymous] = useState(false);
  const [anonymousName, setAnonymousName] = useState(null);
  const { tokens, countdown, consume } = useAnonymousTokens();

  // preview toggle
  const [openPreview, setOpenPreview] = useState(false);

  const resetMain = () => {setAnonymousName(null),setSelectType(null), setQuestionType(null), setTitle(""), setTags([])};
  const resetRange = () => { setMin(0); setMax(100); setStep(1); setRangeValue(0); };
  const resetSingleChoice = () => { setSingleChoices(["", "", ""]); };
  const resetMultipleChoice = () => { setMultipleChoices(["","",""]); setIncludeAllAbove(0); };
  const resetRanking = () => { setRankingChoices(["","",""]); };
  const resetRating = () => { setRatingIconId(1); };
  
  // resetMap
  const resetMap = {
    openend:        [ resetRange, resetSingleChoice, resetMultipleChoice, resetRanking, resetRating],
    closedend:      [resetRange, resetSingleChoice, resetMultipleChoice, resetRanking, resetRating],
    range:          [ resetSingleChoice, resetMultipleChoice, resetRanking, resetRating],
    singlechoice:   [ resetRange, resetMultipleChoice, resetRanking, resetRating],
    multiplechoice: [ resetRange, resetSingleChoice, resetRanking, resetRating],
    rankingorder:   [ resetRange, resetSingleChoice, resetMultipleChoice, resetRating],
    rating:         [ resetRange, resetSingleChoice, resetMultipleChoice, resetRanking],
  };

  const handlePostType = () => {
    (resetMap[questionType?.value] || []).forEach(fn => fn());
  };
  const hasGapInMiddle = (arr) => {
    let seenEmpty = false;
    for (const item of arr) {
      const isEmpty = !item?.toString().trim();
      if (isEmpty) {
        seenEmpty = true;
      } else if (seenEmpty) {
        return true;
      }
    }
    return false;
  };

  const compactChoices = (arr) => arr.map((c) => c.trim()).filter(Boolean);

  const validateChoiceList = (arr, label) => {
    if (hasGapInMiddle(arr)) {
      toast.error(`Please fill in ${label} without leaving empty fields in between`);
      return null;
    }
    const compacted = compactChoices(arr);
    if (compacted.length < 3) {
      toast.error(`Please fill in all 3 ${label}`);
      return null;
    }
    return compacted;
  };

  // Dusplay question type
  function QuestionTypeRenderer() {
    switch (questionType?.value) {
      case "openend":
        return <OpenEnd />;
      case "closedend":
        return (
          <ClosedEnd
          />
        );
      case "range":
        return (
          <Range
            min={min}
            max={max}
            step={step}
            SetStep={setStep}
            SetMin={setMin}
            SetMax={setMax}
            value={rangeValue}
            onChange={(e) => setRangeValue(Number(e.target.value))}
          />
        );
      case "singlechoice":
        return <SingleChoice value={singleChoices} onChange={setSingleChoices} />;
      case "multiplechoice":
        return (
          <MultipleChoice
            value={multipleChoices}
            onChange={setMultipleChoices}
            includeAllAbove={includeAllAbove}
            setIncludeAllAbove={setIncludeAllAbove}
          />
        );
      case "rankingorder":
        return <RankingOrder value={rankingChoices} onChange={setRankingChoices} />;
      case "rating":
        return <Rating value={ratingIconId} onChange={setRatingIconId} />;
      default:
        return <OpenEnd />;
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if(loading) return;
    setLoading(true);
    try {
      if (!title.trim()) {
        toast.error("Please enter question title");
        return;
      }
      if(selectType === null) {
            toast.error("Please select question type");
            return;
      }
      // if(tags.length === 0 ) {
      //       toast.error("Please add some #hashtags");
      //       return;
      // }
      if(questionType === null) {
            toast.error("Please select question type");
            return;
      }

      // --- Type-specific integrity checks (gap protection) ---
      let compactedSingleChoices, compactedMultipleChoices, compactedRankingChoices;

      if (questionType?.value === "singlechoice") {
        compactedSingleChoices = validateChoiceList(singleChoices, "choices");
        if (!compactedSingleChoices) return;
      }
      if (questionType?.value === "multiplechoice") {
        compactedMultipleChoices = validateChoiceList(multipleChoices, "choices");
        if (!compactedMultipleChoices) return;
      }
      if (questionType?.value === "rankingorder") {
        compactedRankingChoices = validateChoiceList(rankingChoices, "ranking items");
        if (!compactedRankingChoices) return;
      }
      if (questionType?.value === "range" && Number(min) >= Number(max)) {
        toast("Range minimum must be less than maximum");
        return;
      }

      const formData = new FormData();
      tags?.forEach((t) => formData.append("tags[]", t));
      formData.append("post_type", "question");
      formData.append("question_related_to", selectType?.label ?? "general");
      formData.append("isAnonymous", isAnonymous === true ? 1 : 0);
      if(anonymousName) formData.append("anonymousName", anonymousName);
      formData.append("question_title", title);

      switch(questionType?.value){
        case "openend":
          formData.append("question_type", "openend");
          break;
        case "closedend":
          formData.append("question_type", "closedend");
          break;
        case "range": 
          formData.append("question_type", "range");
          formData.append("rangeMin", min);
          formData.append("rangeMax", max);
          formData.append("rangeStep", step);
          formData.append("defaultRangeValue", rangeValue);
          break;
        case "singlechoice":
          formData.append("question_type", "singlechoice");
          compactedSingleChoices.forEach((c) => formData.append("choices", c));
          break;
        case "multiplechoice": 
          formData.append("question_type", "multiplechoice");
          compactedMultipleChoices.forEach((c) => formData.append("choices", c));
          formData.append("include_all_above", includeAllAbove);
          break;
        case "rankingorder":
          formData.append("question_type", "rankingorder");
          compactedRankingChoices.forEach((c, i) => formData.append(`ranking[${i+1}]`, c));
          break;
        case "rating":
          formData.append("question_type", "rating");
          formData.append("rating_icon_id", ratingIconId);
          break;
        default:
          formData.append("question_type", "openend");
          break;
      }

      const res = await api.post(
        `/api/create-posts`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        }
      );
    
      if (res.status === 201 || res.status === 200) {
        toast.success(res.data.message || "Question posted successfully");
        if (isAnonymous) consume();
        (resetMap[questionType?.value] || []).forEach(fn => fn());
      }
      else {
        toast.error(res.data.message || "Failed to post question");
      }
    } 
    catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Something went wrong. Please try again.");
    }
    finally{
      setLoading(false);
    }
  };

  return (
    <div id="content-container">
      <article id='tool-article' className={openPreview ? "hidden" : "flex-container"}>

        <form onSubmit={handleSubmit} id="content-form">
          <div id='form-header-label'>
            <p id="content-label">Create Question</p> 
            <button id='preview-toggle' type="button" onClick={() => setOpenPreview(true)} ><LayoutOutlined /> Preview</button>
          </div>
            
          <Select
            options={question_options} 
            value={selectType}
            onChange={(option) => {
              setSelectType(option);        
            }}
            classNamePrefix="custom"
            placeholder="Select Question Topic"
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
            <p className="title-label" >Question Text</p>
                
            <textarea
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Write your question here..."
              type="text"
              required
              id="title-input"
              maxLength={300} 
            />
            <div className="char-counter">
              {title.length}/300
            </div>
          </div>
{/* 
          <Select
            options={question_type} 
            value={questionType}
            onChange={(value) => {
              setQuestionType(value);
              handlePostType(value);   
            }}
            classNamePrefix="custom"
            placeholder='Select Question Type'
          /> */}
            <Select
            options={question_type}
            value={questionType}
            onChange={(value) => {
              handlePostType(questionType?.value); // reset fields belonging to the OLD type
              setQuestionType(value);              // then set the new type
            }}
            classNamePrefix="custom"
            placeholder='Select Question Type'
          />

          {QuestionTypeRenderer()}

          <MoreFieldsConAndQues
            tags={tags}
            setTags={setTags}
            isAnonymous={isAnonymous}
            setIsAnonymous={setIsAnonymous}
            tokens={tokens}
            countdown={countdown}
          />

          <div id="form-footer">
            <button type="submit" disabled={loading} id="content-post-button">
              {loading ? <LoadingOutlined spin style={{ fontSize: 16 }} /> : "Upload"}
            </button>
          </div>

        </form>
        <div id="article-rule">
          <Rule setRule="question" />
        </div>
      </article>

      <article id='preview-article' style={{display: openPreview ? "block" : "none"}}> 
            <PreviewRadio
              title={title} 
              postTag={tags} selectType={selectType?.value}
              isAnonymous={isAnonymous} setOpenPreview={setOpenPreview} 
              post_type='question'
              questionType={questionType?.value}
              singleChoices={singleChoices}
              multipleChoices={multipleChoices}
              includeAllAbove={includeAllAbove}
              min={min}
              max={max}
              step={step}
              rangeValue={rangeValue}
              ratingIconId={ratingIconId}
              rankingChoices={rankingChoices}
            />
      </article>

      <NahideaInfo />

    </div>
  );
}
