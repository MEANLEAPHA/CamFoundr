import React, { useState, useEffect } from "react";
import nahIdeaAuth from "../../assets/img/nahIdeaAuth.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import nahideaIcon from '../../assets/img/nahideaIcon.png';
import { iconOptions } from "../../assets/data/post_type_data";
import { LoadingOutlined, BorderOutlined } from "@ant-design/icons";
import "./UnsolvedQA.css";
import { useNavigate } from "react-router-dom";
import api from "../../assets/api/axiosInstance";
import { faCircle } from "@fortawesome/free-regular-svg-icons";
import { Spin } from "antd";

const UnsolvedQA = () => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchUnsolvedQuestions = async (pageNum = 1, isLoadMore = false) => {
    try {
      if (isLoadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      const response = await api.get(`/api/questions/unsolved?page=${pageNum}&limit=20`);

      if (response.data && response.data.data) {
        if (isLoadMore) {
          setQuestions(prev => [...prev, ...response.data.data]);
          setHasMore(response.data.data.length === 20);
        } else {
          setQuestions(response.data.data);
          setHasMore(response.data.data.length === 20);
        }
      }
    } catch (err) {
      console.error("Error fetching unsolved questions:", err);
      setError(err.response?.data?.message || "Failed to load questions");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchUnsolvedQuestions(1, false);
  }, []);

  const loadMore = () => {
    if (!loadingMore && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchUnsolvedQuestions(nextPage, true);
    }
  };

  const renderQuestionPreview = (post) => {
    const { question_type, data: qData } = post;

    switch (question_type) {
      case "openend":
        return (
          null
        );

      case "closedend":
        return (
          <div className="question-preview-card ">
            <div className="yesno-div">
              <div className="yes-chip">Yes</div>
              <div className="no-chip">No</div>
            </div>
          </div>
        );

      case "range":
        return (
          <div className="question-preview-card">
             <div className='range-preview-option'>
                  <label id="min-label">{qData.range_min ?? 0}</label>
                  <div className="range-wrapper" style={{width: '80%', margin: 'auto'}}>
                      <input
                      type="range"
                      min={qData.range_min ?? 0}
                      max={qData.range_max ?? 100}
                      step={qData.step ?? 1}
                      value={qData.default_range_value ?? 50}
                      readOnly
                      />
                          <div
                      className="custom-thumb"
                      style={{
                        left: `${
                          (((qData.default_range_value ?? 50) - (qData.range_min ?? 0)) /
                            ((qData.range_max ?? 100) - (qData.range_min ?? 0))) *
                          100
                        }%`,
                      }}
                      >
                      {qData.default_range_value ?? 50}
                      </div>
                  </div>
                  <label id="max-label">{qData.range_max ?? 100}</label>
              </div>
          </div>
        );

      case "singlechoice":
        return (
          <div className="question-preview-card ">
              <ul className='choice-ul'>
                  {
                    qData.choices?.slice(0, qData.choices?.length > 4 ? 3 : 4).map(
                      (c, i) => (
                        <li key={i} className = 'choice-li'>
                          <FontAwesomeIcon icon={faCircle} className='tool-answer-icon'/> {c.choice_text}
                        </li>
                      )
                    )
                  }
                  {qData.choices?.length > 4 && (
                    <li className = 'choice-li'>
                         +{qData.choices?.length - 3} more
                    </li>
                  )}
              </ul>
          </div>
        );

      case "multiplechoice":

        return (
          <div className="question-preview-card">

            <ul className ='choice-ul'>
              {
                qData.choices?.slice(0, qData.choices?.length > 4 ? 3 : 4).map((c,i) => (
                  <li key={i} className ='choice-li'>
                    <BorderOutlined className='tool-answer-icon'/>  {c.choice_text}
                  </li> 
                ))
              }
              {qData.choices?.length > 4 && (
                <li className ='choice-li' style={{color:'grey', fontSize:'smaller'}}>
                    +{qData.choices?.length - 3} more
                </li>
                )}
            </ul>
          </div>
        );

      case "rankingorder":

        return (
          <div className="question-preview-card ">
         
               <ul className='choice-ul'>
                    {qData.items?.slice(0, qData.items?.length > 4 ? 3 : 4).map((item, i) => (
                      <li className = 'choice-li'>
                          {i + 1}. {item.item_text}
                      </li>
                    ))}
                    {qData.items?.length > 4 && (
                      <li className = 'choice-li' style={{color:'grey', fontSize:'smaller'}}>
                        +{qData.items?.length - 3} more
                      </li>
                    )}
                </ul>
          </div>
        );

      case "rating":

        return (
          <div className="question-preview-card">
            <div className="rating-preview-icons">
              {Array.from({length:5}).map((_,i)=>(
                  <FontAwesomeIcon 
                  key={i}
                  icon={iconOptions.find((opt) => opt.id === qData.rating_icon_id)?.icon}
                  style={{ fontSize: "24px", color: "grey" }}
                  />
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const handleCardClick = (post) => {
    const QaData = {
      question_id: post.data?.id || post.question_id,
      title: post.title,
      question_type: post.question_type,
    };
    
    if (post.question_type === "range") {
      QaData.range_min = post.data?.range_min;
      QaData.range_max = post.data?.range_max;
      QaData.step = post.data?.step;
      QaData.default_range_value = post.data?.default_range_value;
    }
    
    if (post.question_type === "singlechoice") {
      QaData.choice = post.data?.choices || [];
    }
    
    if (post.question_type === "multiplechoice") {
      QaData.choices = post.data?.choices || [];
      QaData.include_all_above = post.data?.include_all_above;
    }
    
    if (post.question_type === "rankingorder") {
      QaData.items = post.data?.items || [];
    }
    
    if (post.question_type === "rating") {
      QaData.rating_icon_id = post.data?.rating_icon_id;
    }
    
    sessionStorage.setItem("QaStore", JSON.stringify(QaData));
    navigate(`/answer/${post.id}/${post.data?.id || post.question_id}/${post.question_type}`);
  };

  if (loading) {
    return (
      <div className="unsolved-loading">
        <LoadingOutlined style={{ fontSize: 48 }} />
        <p style={{color: 'grey'}}>Loading unsolved questions...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="unsolved-error">
        <p style={{color: 'grey'}}>{error}</p>
        <button onClick={() => fetchUnsolvedQuestions(1, false)}>Retry</button>
      </div>
    );
  }

  return (
    <div className="unsolved-questions-container">
      <div id='qa-header'>
        <div id="qa-header-left">
          <h3 className="section-title">Unsolved Questions</h3>
          <p className="section-subtitle">Help others like you want to be helped</p>
        </div>
        <button type='button' onClick={() => navigate('/create/question')} id='go-to-create-qa'>
          Post Question
        </button>
      </div>

      <div className="questions-grid">
        {questions.length === 0 ? (
          <div className="no-questions">
            <p>No unsolved questions found.</p>
            <button onClick={() => navigate('/create/question')}>Be the first to ask!</button>
          </div>
        ) : (
          questions.map((post) => (
            <div
              key={post.id}
              className="question-card"
              onClick={() => handleCardClick(post)}
            >
              <div className="question-title">
                <p>{post.title || post.data?.question_text}</p>
              </div>
              
              {renderQuestionPreview(post)}
              
           
              <div className="tags">
                <div className="user-info">
                  <div
                    id="author-pf-div"
                    style={{
                      backgroundColor: post.is_anonymous === 1 ? post.anonymous_bg_color : "",
                    }}
                  >
                    <img
                      src={post.is_anonymous === 1 ? nahIdeaAuth : post.avatar_url || nahideaIcon}
                      alt="user-profile"
                      id="author-pf"
                    />
                  </div>
                  <div id='user-info-p'>
                    <span className="username">
                      {post.is_anonymous ? (post?.anonymous_name || "Anonymous") : post.username}
                    </span>
                    <span className="created-at">{post.created_at}</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {hasMore && questions.length > 0 && (
        <div className="load-more-container">
          <button 
            onClick={loadMore} 
            disabled={loadingMore}
            className="load-more-btn"
          >
            {loadingMore ? <Spin style={{color: 'var(--primary-color)'}} /> : "Load More"}
          </button>
        </div>
      )}
    </div>
  );
};

export default UnsolvedQA;
