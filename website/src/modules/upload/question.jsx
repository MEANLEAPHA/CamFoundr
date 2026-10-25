// React State
import React, {useState} from 'react';
import Select from "react-select";
import api from "../../api/axiosInstance";

import { useAnonymousTokens} from "../../util/anonymousTokens";
import toast from "react-hot-toast";
import { question_options, question_type } from "../../data/post_type_data";

// util
import Rule from "../../util/rule";
import PreviewRadio from "../../util/previewRadio";
import NahideaInfo from "../../util/cdlinfo.jsx";
import {MoreFieldsConAndQues} from "../../util/moreFlieds";

// import question type
import ClosedEnd from './questionType/closedEnd';
import OpenEnd from './questionType/openEnd';
import Range from './questionType/range';
import SingleChoice from './questionType/singleChoice';
import MultipleChoice from './questionType/multipleChoice';
import RankingOrder from './questionType/rankingOrder';
import Rating from './questionType/rating';
import MatchingFlow from "./questionType/MatchingFlow";

// ant
import { LayoutOutlined, LoadingOutlined, StarOutlined } from '@ant-design/icons';



// style 
import "./tag.css";
import "./postPreview.css";
import "./content.css";
import { ChevronLeft } from 'lucide-react';

export default function Questiion(){


  const [loading, setLoading] = useState(false);
  // question setence
  const [title, setTitle] = useState('');

  // question topic related
  const [selectType, setSelectType] = useState(null);

  // tag state
  const [tags, setTags] = useState([]);


  // question type state
  const [questionType, setQuestionType] = useState(null);
  const [generatingQuestion, setGeneratingQuestion] = useState(false);


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
    const [matchingPairs, setMatchingPairs] = useState([
      { left: "", right: "" },
      { left: "", right: "" },
      { left: "", right: "" },
    ]);

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
  const resetMatching = () => {
    setMatchingPairs([
      { left: "", right: "" },
      { left: "", right: "" },
      { left: "", right: "" },
    ]);
  };
  const resetRating = () => { setRatingIconId(1); };
  
  // resetMap
  const resetMap = {
    openend:        [ resetRange, resetSingleChoice, resetMultipleChoice, resetRanking, resetRating, resetMatching],
    closedend:      [resetRange, resetSingleChoice, resetMultipleChoice, resetRanking, resetRating, resetMatching],
    range:          [ resetSingleChoice, resetMultipleChoice, resetRanking, resetRating, resetMatching],
    singlechoice:   [ resetRange, resetMultipleChoice, resetRanking, resetRating, resetMatching],
    multiplechoice: [ resetRange, resetSingleChoice, resetRanking, resetRating, resetMatching],
    rankingorder:   [ resetRange, resetSingleChoice, resetMultipleChoice, resetRating, resetMatching],
    rating:         [ resetRange, resetSingleChoice, resetMultipleChoice, resetRanking, resetMatching],
    matching:       [ resetRange, resetSingleChoice, resetMultipleChoice, resetRanking, resetRating],
  };

  const handlePostType = () => {
    (resetMap[questionType?.value] || []).forEach(fn => fn());
  };

  const handleGenerateQuestion = async () => {
    if (!selectType || !questionType || generatingQuestion) return;

    const type = questionType.value;
    const choiceCount = {
      singlechoice: singleChoices.length,
      multiplechoice: multipleChoices.length,
      rankingorder: rankingChoices.length,
      matching: matchingPairs.length,
    }[type];

    setGeneratingQuestion(true);
    try {
      const { data } = await api.post("/api/ai/generate-question", {
        topic: selectType.label,
        questionType: type,
        ...(choiceCount ? { choiceCount } : {}),
      });

      if (typeof data?.question !== "string" || !data.question.trim()) {
        throw new Error("The AI did not return a question. Please try again.");
      }

      if (choiceCount && (
        !Array.isArray(data.choices) ||
        data.choices.length !== choiceCount ||
        data.choices.some((choice) => typeof choice !== "string" || !choice.trim())
      )) {
        throw new Error("The AI returned invalid choices. Please try again.");
      }

      if (type === "range") {
        const { min: generatedMin, max: generatedMax, step: generatedStep, value } = data.range || {};
        const rangeValues = [generatedMin, generatedMax, generatedStep, value];
        if (
          !rangeValues.every(Number.isSafeInteger) ||
          generatedMax <= generatedMin ||
          generatedStep <= 0 ||
          generatedStep > generatedMax - generatedMin ||
          (generatedMax - generatedMin) % generatedStep !== 0 ||
          value < generatedMin ||
          value > generatedMax ||
          (value - generatedMin) % generatedStep !== 0
        ) {
          throw new Error("The AI returned invalid range settings. Please try again.");
        }

        setMin(generatedMin);
        setMax(generatedMax);
        setStep(generatedStep);
        setRangeValue(value);
      }

      setTitle(data.question.trim());
      if (type === "singlechoice") setSingleChoices(data.choices);
      if (type === "multiplechoice") setMultipleChoices(data.choices);
      if (type === "rankingorder") setRankingChoices(data.choices);
      if (type === "matching") setMatchingPairs(data.matchingPairs);
      toast.success("Question generated");
    } catch (error) {
      const requestId = error?.response?.data?.requestId
        || error?.response?.headers?.["x-request-id"];
      const errorMessage = error?.response?.data?.message
        || error.message
        || "Could not generate a question. Please try again.";
      console.error("Question generation failed:", {
        status: error?.response?.status || null,
        code: error?.code || null,
        requestId: requestId || null,
        url: error?.config?.url || "/api/ai/generate-question",
        message: errorMessage,
        hasHttpResponse: Boolean(error?.response),
      });
      toast.error(
        requestId ? `${errorMessage} (Reference: ${requestId})` : errorMessage
      );
    } finally {
      setGeneratingQuestion(false);
    }
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
            SetValue={setRangeValue}
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
      case "matching":
        return (
          <div className="matching-editor">
            <MatchingFlow
              mode="edit"
              pairs={matchingPairs}
              onPairsChange={setMatchingPairs}
            />
            <div className="matching-editor-actions">
              <button
                type="button"
                onClick={() => setMatchingPairs((current) => [
                  ...current,
                  { left: "", right: "" },
                ])}
                disabled={matchingPairs.length >= 5}
              >
                Add pair
              </button>
              <button
                type="button"
                onClick={() => setMatchingPairs((current) => (
                  current.length > 3 ? current.slice(0, -1) : current
                ))}
                disabled={matchingPairs.length <= 3}
              >
                Remove last pair
              </button>
              <span>{matchingPairs.length}/5 pairs (minimum 3)</span>
            </div>
          </div>
        );
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

      if(tags.length === 0 ) {
            toast.error("Please add some #hashtags");
            return;
      }

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
      let compactedMatchingPairs;
      if (questionType?.value === "matching") {
        if (matchingPairs.length < 3 || matchingPairs.length > 5) {
          toast.error("Matching questions must have between 3 and 5 pairs.");
          return;
        }
        if (matchingPairs.some((pair) => !pair.left.trim() || !pair.right.trim())) {
          toast.error("Please fill in both sides of every matching pair.");
          return;
        }
        compactedMatchingPairs = matchingPairs.map((pair) => ({
          left: pair.left.trim(),
          right: pair.right.trim(),
        }));
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
        case "matching":
          formData.append("question_type", "matching");
          formData.append("matchingPairs", JSON.stringify(compactedMatchingPairs));
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
            <p id="content-label" style={{display: 'flex', alignItems: 'center', gap: '10px'}}><ChevronLeft style={{width: '25px', border: 'var(--secondary-color) 1px solid', padding: '2px', fontSize: '15px', borderRadius:'20px', cursor: 'pointer'}}/>Create Question</p> 
            <div style={{display:"flex", gap:"10px", alignItems:"center", }}>
              {
                selectType && questionType && <button
                type="button"
                className='preview-toggle generate-quiz-btn'
                onClick={handleGenerateQuestion}
                disabled={!selectType || !questionType || generatingQuestion}
                aria-label="Generate a question using the selected topic and question type"
              >
                {generatingQuestion
                  ? <><StarOutlined spin /> Generating</>
                  : <div style={{display:'flex', alignItems: 'center', gap: '5px'}}><StarOutlined /> Generate</div>}
              </button>
              }
              <button className='preview-toggle' type="button" onClick={() => setOpenPreview(true)} ><LayoutOutlined /> Preview</button>
            </div>
            
          </div>

          <p className="title-label" >Topic<sup style={{color:'red'}}>*</sup></p>
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
            <p className="title-label" >Title<sup style={{color:'red'}}>*</sup></p>
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
          <p className="title-label" >Question Type<sup style={{color:'red'}}>*</sup></p>
          <Select
            options={question_type}
            value={questionType}
            onChange={(value) => {
              handlePostType(questionType?.value); 
              setQuestionType(value);              
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
              matchingPairs={matchingPairs}
            />
      </article>

      <NahideaInfo />

    </div>
  );
}
