// React state import 
import React, { useState } from "react";

// util import
import PreviewPost from "./PreviewPost";

// ant import
import { ArrowLeftOutlined } from '@ant-design/icons';
import Rule from "./Rule";

export default function PreviewRadio ({
  // Primary
  title, filesMedia, postTag, selectType, isAnonymous, setOpenPreview,
  post_type,

  // Content
  textBody,

  // Question
  questionType,

  singleChoices, 

  multipleChoices, 
  includeAllAbove,

  min,
  max,
  step,
  rangeValue,

  ratingIconId,

  rankingChoices

}) {
  
  const [selected, setSelected] = useState(1);

  return (
  
    <div id="select-action-dev">
         <div id="select-radio">
          <button type="button" onClick={() => setOpenPreview(false)} id="preview-closed-arrow"><ArrowLeftOutlined /></button>
        <div  className='radio-button-div'>
             {[{id: 1, label: "Preview"}, {id: 2, label: `${post_type.slice(0, 1).toUpperCase() + post_type.slice(1)} Rule`}].map((opt) => (
          <button
            key={opt.id}
            onClick={() => setSelected(opt.id)}
            style={{
              borderBottom: selected === opt.id ? "2px solid #fd7648" : "2px solid transparent",
              color: selected === opt.id ? "#fd7648" : "grey",
            }}
            className='radio-button'
          >
            {opt.label}
          </button>
        ))}
        </div>
      </div>


      <div id="result-selected">
         {  
         selected === 1 &&
          <PreviewPost 
            // primary
            titleValue={title} filesMediaValues= {filesMedia} postTagsValue={postTag} selectTypeValue={selectType} isAnonymousValue={isAnonymous} displaySelected={selected === 1 ? "block" : "none" }
            post_type={post_type}

            // content
            textBodyValue={textBody} 

            // Question
            questionTypeValue={questionType}

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
          }
      
         {selected === 2 && (
          <div id="content-rule-div">
            <Rule setRule={post_type}/>
          </div>
         ) }

    </div>
     
    </div>
    

  );
};


