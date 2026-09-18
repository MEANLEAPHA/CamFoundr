import React, { useEffect, useState, memo } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { useParams, useOutletContext, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import "react-toastify/dist/ReactToastify.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleQuestion } from "@fortawesome/free-regular-svg-icons";
import {
  faThumbsDown, faThumbsUp, faHandPointer, faHandPeace, faHand,
  faLocationCrosshairs, faStar, faUpDown, faRankingStar,
  faArrowDown, faArrowUp, faUserSecret,
} from "@fortawesome/free-solid-svg-icons";
import { iconOptions } from "../data/post_type_data";
import { SignatureOutlined, FolderOpenOutlined, LeftOutlined, CloseCircleOutlined, CloseOutlined } from "@ant-design/icons";
import "../style/page/AnswerQa.css";

import { AnonymousName, AnonymousProfile } from "../util/anonymousTokens";
import api from "../api/axiosInstance";
import nahideaIcon from '../img/nahideaIcon.png';

const AnonymousPf = memo(AnonymousProfile);
const AnonymousNm = memo(AnonymousName);

const AnswerQa = () => {
  const { user } = useOutletContext();
  const { postId, questionId, questionType } = useParams();
  const navigate = useNavigate();

  const [QaData, setQaData] = useState({});
  const [openendInput, setOpenendInput] = useState("");
  const [rangeInput, setRangeInput] = useState(null);
  const [ratingInput, setRatingInput] = useState(0);
  const [closedendInput, setClosedendInput] = useState(null);
  const [singleChoiceInput, setSingleChoiceInput] = useState({ id: null, text: null });
  const [multipleChoice, setMultipleChoice] = useState([]);
  const [rankingOrderInput, setRankingOrderInput] = useState([]);
  const [rankingOrderValue, setRankingOrderValue] = useState([]);

  const [pageLoading, setPageLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [lockedAnon, setLockedAnon] = useState(false);
  const [anonLoading, setAnonLoading] = useState(true);
  const [showAnnoy, setShowAnnoy] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      setPageLoading(true);

      try {
        const alreadyRes = await api.get(`/api/answers/check-answered/${questionId}`);
        if (cancelled) return;

        if (alreadyRes.data.alreadyAnswered) {
          toast("You've already answered this question.");
          navigate(-1);
          return;
        }

        const QaStoreRaw = sessionStorage.getItem("QaStore");
        const cached = QaStoreRaw ? JSON.parse(QaStoreRaw) : null;

        if (cached && String(cached.question_id) === String(questionId)) {
          setQaData(cached);
        } else {
          await handleFetchQa();
        }
      } catch (err) {
        // console.error(err);
        if (!cancelled) {
          toast.error("Couldn't load this question.");
          navigate(-1);
        }
      } finally {
        if (!cancelled) setPageLoading(false);
      }
    };

    init();

    return () => {
      cancelled = true;
    };
  }, [questionId, questionType, navigate]);

  const handleFetchQa = async () => {
    try {
      const res = await api.get(`/api/answers/get-question/${questionId}/${questionType}`);
      const data = res.data.datas;
      setQaData(data);
    } catch (err) {
      console.error(err);
      setQaData(null);
      throw err;
    }
  };

  function renderQuestion(QaData) {
    if (!QaData) return null;
    switch (questionType) {
      case "openend":
        return (
          <textarea
            className="answer-textarea"
            placeholder="Type your answer here..."
            value={openendInput}
            onChange={(e) => setOpenendInput(e.target.value)}
          />
        );

      case "range":
        return (
          <div className="answer-range">
            <span className="answer-range-value">{QaData?.range_min}</span>

            <input
              className="answer-slider"
              type="range"
              min={QaData?.range_min}
              max={QaData?.range_max}
              step={QaData?.range_step}
              value={rangeInput ?? QaData?.default_range_value ?? QaData?.range_min}
              onChange={(e) => setRangeInput(e.target.value)}
            />

            <span className="answer-range-value">{QaData?.range_max}</span>

            <div className="answer-current-value">
              {rangeInput ?? QaData?.default_range_value ?? QaData?.range_min}
            </div>
          </div>
        );

      case "closedend":
        return (
          <div className="answer-yesno">
            <div
              className={`answer-yes ${closedendInput === "yes" ? "answer-yes-active" : ""}`}
              onClick={() => setClosedendInput("yes")}
            >
              YES
            </div>

            <div
              className={`answer-no ${closedendInput === "no" ? "answer-no-active" : ""}`}
              onClick={() => setClosedendInput("no")}
            >
              NO
            </div>
          </div>
        );

      case "singlechoice":
        return (
          <div className="answer-choice-list">
            {QaData?.choice?.map((c) => (
              <label
                key={c.id}
                className={`answer-choice-card ${singleChoiceInput?.id === c.id ? "answer-choice-active" : ""}`}
              >
                <input
                  hidden
                  type="radio"
                  checked={singleChoiceInput?.id === c.id}
                  onChange={() => setSingleChoiceInput({ id: c.id, text: c.choice_text })}
                />
                <div className="answer-radio" />
                <span>{c.choice_text}</span>
              </label>
            ))}
          </div>
        );

      case "multiplechoice": {
        const allSelected =
          QaData?.choices?.length > 0 && multipleChoice.length === QaData.choices.length;
        return (
          <div className="answer-choice-list">
            {QaData?.choices?.map((c) => (
              <label
                key={c.id}
                className={`answer-choice-card ${multipleChoice.some((m) => m.id === c.id) ? "answer-choice-active" : ""}`}
              >
                <input
                  hidden
                  type="checkbox"
                  checked={multipleChoice.some((m) => m.id === c.id)}
                  onChange={() => {
                    setMultipleChoice((prev) =>
                      prev.some((m) => m.id === c.id)
                        ? prev.filter((m) => m.id !== c.id)
                        : [...prev, { id: c.id, text: c.choice_text }]
                    );
                  }}
                />
                <div className="answer-checkbox" />
                <span>{c.choice_text}</span>
              </label>
            ))}

            {QaData?.include_all_above === 1 && QaData?.choices?.length > 0 && (
              <label className={`answer-choice-card ${allSelected ? "answer-choice-active" : ""}`}>
                <input
                  hidden
                  type="checkbox"
                  checked={allSelected}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setMultipleChoice(
                        QaData.choices.map((c) => ({ id: c.id, text: c.choice_text }))
                      );
                    } else {
                      setMultipleChoice([]);
                    }
                  }}
                />
                <div className="answer-checkbox" />
                <span>All of the Above</span>
              </label>
            )}
          </div>
        );
      }

      case "rankingorder":
        return (
          <DragDropContext
            onDragEnd={(result) => {
              if (!result.destination) return;

              const reordered = Array.from(QaData?.items || []);
              const [moved] = reordered.splice(result.source.index, 1);
              reordered.splice(result.destination.index, 0, moved);

              setRankingOrderInput(reordered.map((item) => item.id));
              setRankingOrderValue(reordered.map((item) => item.item_text));

              setQaData({ ...QaData, items: reordered });
            }}
          >
            <Droppable droppableId="ranking-list">
              {(provided) => (
                <div className="answer-ranking" {...provided.droppableProps} ref={provided.innerRef}>
                  {QaData?.items?.map((item, index) => (
                    <Draggable key={item.id} draggableId={String(item.id)} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`answer-ranking-row ${snapshot.isDragging ? "dragging" : ""}`}
                        >
                          <div className="answer-ranking-drag">
                            {index === 0 ? (
                              <FontAwesomeIcon icon={faArrowDown} />
                            ) : index === QaData?.items?.length - 1 ? (
                              <FontAwesomeIcon icon={faArrowUp} />
                            ) : (
                              <FontAwesomeIcon icon={faUpDown} />
                            )}
                          </div>

                          <div className="answer-ranking-number">{index + 1}.</div>
                          <div className="answer-ranking-text">{item.item_text}</div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        );

      case "rating":
        return (
          <div className="answer-rating">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className={`answer-rating-icon ${ratingInput >= i + 1 ? "answer-rating-active" : ""}`}
                onClick={() => setRatingInput(i + 1)}
              >
                <FontAwesomeIcon
                  icon={iconOptions.find((opt) => opt.id === QaData?.rating_icon_id)?.icon}
                />
              </div>
            ))}
          </div>
        );

      default:
        return null;
    }
  }

  function tutorialRender(questionType) {
    switch (questionType) {
      case "openend":
        return <span>Write Your Answer</span>;
      case "closedend":
        return <span>Choose yes or no</span>;
      case "singlechoice":
        return <span>Choose one option</span>;
      case "multiplechoice":
        return <span>Choose multiple options</span>;
      case "range":
        return <span>Move the dot to adjust value </span>;
      case "rating":
        return <span>Tap an icon to rate</span>;
      case "rankingorder":
        return <span>Hold or Grab then move to reorder</span>;
      default:
        return null;
    }
  }

  const validateBeforeSubmit = () => {
    switch (questionType) {
      case "openend":
        if (!openendInput.trim()) return "Please write an answer.";
        break;
      case "closedend":
        if (!closedendInput) return "Please choose yes or no.";
        break;
      case "singlechoice":
        if (!singleChoiceInput?.id) return "Please choose an option.";
        break;
      case "multiplechoice":
        if (multipleChoice.length === 0) return "Please choose at least one option.";
        break;
      case "rankingorder":
        if (rankingOrderInput.length === 0) return "Please reorder the items before submitting.";
        break;
      case "rating":
        if (!ratingInput) return "Please give a rating.";
        break;
      default:
        break;
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    const validationError = validateBeforeSubmit();
    if (validationError) {
      toast.error(validationError);
      return;
    }

    let payload = { is_anonymous: enabled ? 1 : 0 };

    switch (questionType) {
      case "openend":
        payload.answerText = openendInput;
        break;
      case "closedend":
        payload.answerYesNo = closedendInput;
        break;
      case "rating":
        payload.ratingValue = ratingInput;
        break;
      case "range":
        payload.rangeValue = rangeInput;
        break;
      case "singlechoice":
        payload.optionId = singleChoiceInput.id;
        payload.optionText = singleChoiceInput.text;
        break;
      case "multiplechoice":
        payload.optionIds = multipleChoice.map((c) => c.id);
        payload.optionTexts = multipleChoice.map((c) => c.text);
        break;
      case "rankingorder":
        payload.rankingIds = rankingOrderInput;
        payload.rankingTexts = rankingOrderValue;
        break;
    }

    setSubmitting(true);

    try {
    const res = await api.post(`/api/answers/answer-qa/${postId}/${questionId}/${questionType}`, payload);

      const QaStoreRaw = sessionStorage.getItem("QaStore");
      if (QaStoreRaw) {
        const cached = JSON.parse(QaStoreRaw);
        if (String(cached.question_id) === String(questionId)) {
          sessionStorage.removeItem("QaStore");
        }
      }

      
      if(res.status === 200) {
        const resData = res.data;
          toast.success("Answer submitted!");
          navigate(`/aboutpost/${postId}#answers-${Number(resData.answer_id)}`);
      }
    
    } catch (err) {
      if (err.response?.status === 409) {
        toast.warning("Oops! You can't answer this question twice.");
        navigate(-1);
        return;
      }
      console.error("POST ERROR:", err.response?.data || err.message);
      toast.error(err.response?.data?.message || "Error submitting answer.");
    } finally {
      setSubmitting(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="answer-page">
        <div className="answer-card">Loading...</div>
      </div>
    );
  }

  return (
    <div className="answer-page">
      <div className="answer-card">
        <div className="comments-header">
          <h3 id="h3-label">
            <FontAwesomeIcon icon={faCircleQuestion} /> Answer Qustion
          </h3>
          <button
            type="button"
            className="back-btn-about-post"
            onClick={() => navigate(-1)}
            aria-label="Go back"
          >
            <CloseOutlined />
          </button>
        </div>

        <div className="comments-header" style={{ alignItems: "center" }}>
          <div className="answer-author-div">
            {/* <div className="comms-avatar-div"> */}
              <AnonymousPf
                enabled={enabled}
                realPf={user?.avatar_url || nahideaIcon}
              />
            {/* </div> */}
            <AnonymousNm enabled={enabled} realName={user?.username || "guest"} />
          </div>

          <div className="anonymous-toggle-div">
            <FontAwesomeIcon icon={faUserSecret} className="annoy-icon" />
            <div
              className={`toggle-container ${enabled ? "active" : ""}`}
              role="switch"
              aria-checked={enabled}
              tabIndex={0}
              onClick={() => setEnabled(!enabled)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setEnabled(!enabled);
                }
              }}
            >
              <div className="toggle-track">
                <div className="toggle-thumb" />
              </div>
            </div>
          </div>
        </div>

        <h1 className="answer-title"> " {QaData?.title} "</h1>

        <form onSubmit={handleSubmit}>
          <div className="answer-body">{renderQuestion(QaData)}</div>
          <br />
          <p id="tutorial-label">Tutorial: {tutorialRender(questionType)}</p>
          <button type="submit" className="answer-submit" disabled={submitting}>
            {submitting ? "Submitting..." : "Submit Answer"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AnswerQa;