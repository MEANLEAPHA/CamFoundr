// React state import
import React, {useState, useRef, useEffect, memo} from "react";
import { useNavigate, useOutletContext} from "react-router-dom";

// ant import
import { Skeleton, Menu, Switch, Dropdown, Space  } from 'antd';
import{SignatureOutlined, FolderOpenOutlined, BorderOutlined} from '@ant-design/icons';

// fontAwesome import
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBookmark, faCircle, faHeart, faMessage} from "@fortawesome/free-regular-svg-icons";
import { faThumbsDown, faThumbsUp,  faHandPointer, faHandPeace, faHand, faLocationCrosshairs, faStar, faRankingStar, faPen} from "@fortawesome/free-solid-svg-icons";

// util import
import { AnonymousName, AnonymousProfile } from "../anonymousTokens";
import MoreDropDown from "./MoreDropDown";
import { MarkdownPreview} from "../moreFlieds";
import {MediaPreview} from "../mediaUploader";
import{TagsPreview} from "../tagInput";

//data
import { iconOptions } from "../../data/post_type_data";

//auth

import { useAuth } from '../../context/AuthContext';


// memo on annoymous prevnet re-render
const AnonymousPf = memo(AnonymousProfile);
const AnonymousNm = memo(AnonymousName);

export default function PreviewPost ({
    // primary
    titleValue, filesMediaValues, postTagsValue, selectTypeValue, selectTypeIcon, isAnonymousValue, displaySelected,
    post_type,

    //content
    textBodyValue, 

    // question
    questionTypeValue, 
  
    singleChoices,

    multipleChoices,
    includeAllAbove,

    min,
    max,
    step,
    rangeValue,

    ratingIconId, 

    rankingChoices

}){
    const {user} = useAuth();
     const navigate = useNavigate();
    const [displayPostOpt, setDisplayPostOpt] = useState("none");
    const [displayBgMoreIcon, setBgMoreIcon] = useState("none");
    const wrapperRef = useRef(null);
    const handlePostOpt = () => {
        const Mode = localStorage.getItem("darkMode");
       if(displayPostOpt === "none"){
            setDisplayPostOpt("block");
            Mode === "true" ? setBgMoreIcon("rgb(40, 40, 40)") : setBgMoreIcon("rgb(245, 245, 245)");
       } 
       else{
            setDisplayPostOpt("none");
            setBgMoreIcon("none") 
       } 
    }
    useEffect(() => {
        function handleClickOutside(event) {
          if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
            setDisplayPostOpt("none");
            setBgMoreIcon("none") 
          }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
          document.removeEventListener("mousedown", handleClickOutside);
        };
      }, []);

    function QuesitionType () {  
    switch (questionTypeValue) {
        case "openend":
            return null;
        case "closedend":
            return  <div className="yesno-div render-qa-post">
                        <div className="yes-chip">
                            Yes
                        </div>
                        <div className="no-chip">
                            No
                        </div>
                    </div>;
        case "singlechoice":
            return <ul className='choice-ul'>
                        {
                            singleChoices?.slice(0, singleChoices.length > 4 ? 3 : 4).map(
                            (c, i) => (
                                <li key={i} className = 'choice-li'>
                                <FontAwesomeIcon icon={faCircle} className='tool-answer-icon'/> {c}
                                </li>
                            )
                            )
                        }
                        {singleChoices.length > 4 && (
                            <li className = 'choice-li'>
                                <FontAwesomeIcon icon={faCircle} className='tool-answer-icon'/>  +{singleChoices.length - 3} more
                            </li>
                        )}
                    </ul>;
        case "multiplechoice":
            return  <ul className ='choice-ul'>
                        {
                        multipleChoices?.slice(0, multipleChoices?.length > 4 ? 3 : 4).map((c,i) => (
                            <li key={i} className ='choice-li'>
                            <BorderOutlined className='tool-answer-icon'/>  {c}
                            </li> 
                        ))
                        }
                        {multipleChoices?.length > 4 && (
                        <div className ='choice-li'>
                            <BorderOutlined className='tool-answer-icon'/> +{multipleChoices?.length - 3} more
                        </div>
                        )}
                    </ul>
                    
        case "range":
            return  <div className='range-preview-option'>
                        <label id="min-label">{min}</label>
                        <div className="range-wrapper">
                            <input
                            type="range"
                            min={min}
                            max={max}
                            step={step}
                            value={rangeValue}
                            readOnly
                            />
                                <div
                            className="custom-thumb"
                            style={{
                                left: `${((rangeValue - min) / (max - min)) * 100}%`
                            }}
                            >
                            {rangeValue}
                            </div>
                        </div>
                        <label id="max-label">{max}</label>
                    </div>
        case "rating":
            return  <div className='render-qa-post'>
                        {Array.from({length:5}).map((_,i)=>(
                            <FontAwesomeIcon 
                            key={i}
                            icon={iconOptions.find((opt) => opt.id === ratingIconId)?.icon}
                            style={{ fontSize: "24px", color: "grey" }}
                            />
                        ))}
                    </div>

        case "rankingorder":
            return  <ul className='choice-ul'>
                        {rankingChoices?.slice(0, rankingChoices?.length > 4 ? 3 : 4).map((item, i) => (
                        <li className = 'choice-li'>
                            {i + 1}. {item}
                        </li>
                        ))}
                        {rankingChoices?.length > 4 && (
                        <li className = 'choice-li' style={{color:'grey', fontSize:'smaller'}}>
                            +{rankingChoices?.length - 3} more
                        </li>
                        )}
                    </ul>;
    default:
        return null;
    }
    }
    return(
        <div className="posts preview-posts" style={{display:displaySelected}}>
            <div className='post-header'>
                <div className='post-user-profile'>
                    
                <AnonymousPf enabled={isAnonymousValue} realPf={user?.avatar_url || 'https://api.dicebear.com/9.x/adventurer/svg?seed=Felix'}/> 
                    <div className='user-post-info'>
                        <p className='post-username'>
                            <AnonymousNm enabled={isAnonymousValue} realName={user?.username || 'guest'}/>
                                <div className='dot'></div>
                            <div className='category-post-div'>
                                    <span className="post-type-label">{selectTypeValue}</span>    
                            </div>
                       
                        </p>
                        <p className='post-at'>Just now</p>
                    </div>
                </div>
                <MoreDropDown post_type={post_type}/> 
            </div>
            <div className='post-body'> 
                {
                    titleValue === "" && postTagsValue.length === 0 ? <div className='post-skeleton-holder'>
                        <Skeleton active style={{marginTop:"10px"}}/></div> : (
                    <>
                        <div className='post-caption'>
                            <p>{titleValue}</p>
                        </div>
                        <div className='post-body-text'>
                            {questionTypeValue !== "" && QuesitionType()}
                        </div>
                        {
                            textBodyValue && (
                                <div className='post-body-text'>
                                    <MarkdownPreview content={textBodyValue}/>
                                </div>
                            )
                        }
                       
                       {/* {
                        postTagsValue.length !== 0 && (
                            <div className='post-tags'>
                                <TagsPreview tagsValue={postTagsValue}/>
                            </div>
                        )
                       } */}
                    </>
                    )
                }
                <div  className='post-thumbnail'>   
                    {titleValue === "" && postTagsValue.length === 0 ?
                        <Skeleton.Image active/>
                        :
                        <MediaPreview files={filesMediaValues}/>
                    }
                </div>
            </div>

            <div className='post-footer'>
                <div className='post-footer-left'>
                    <button className='button-action-footer'><FontAwesomeIcon icon={faHeart} className='button-action-footer-icon'/> <p><span>0</span><span className='count-label'> Like</span></p></button>
                    {post_type === "question" && <button className='button-action-footer'><FontAwesomeIcon icon={faPen} className='button-action-footer-icon'/><p><span className='count-label'> Answer</span></p></button>}
                    <button className='button-action-footer'><FontAwesomeIcon icon={faMessage} className='button-action-footer-icon'/><p><span>0</span><span className='count-label'> Comment</span></p></button>
                </div>
                <div className='post-footer-right'>
                    <button className='button-action-footer button-action-footer-last'><FontAwesomeIcon icon={faBookmark} /></button>
                </div>  
            </div>

        </div>
    )
}

