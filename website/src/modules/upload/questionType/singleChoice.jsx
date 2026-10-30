import "./singlechoice.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircle, faTrashCan} from "@fortawesome/free-regular-svg-icons";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import {handleChange, deleteChoice, addChoice, removeAll, maxChoices} from "./util/choiceType";

export default function SingleChoice ({ value, onChange}) {

  return (
     <div className="question-type-wrapper">
        <div className="single-choice-parent">
          {value.map((choice, index) => (
            <div key={index} className="single-choice-row">
              <div
                className="square-div"
              >
                <FontAwesomeIcon icon={faCircle} />
              </div>

              <input
                type="text"
                className="single-choice-input"
                placeholder={`Choice ${index + 1}`}
                value={choice}
                onChange={(e) => handleChange(index, e.target.value, onChange, value)}
              />

              {value.length > 3 && (
                <button
                  type="button"
                  className="btn-delete-single-choice"
                  onClick={() => deleteChoice(index, onChange, value)}
                >
                  <FontAwesomeIcon icon={faTrashCan} />
                </button>
              )}
            </div>
          ))}
        </div>
        <div className="single-choice-actions">
          <button
            onClick={() => addChoice(onChange, value)}
            disabled={value.length >= maxChoices}
            type="button"
            className="btn-multiple-choice"
          >
            <FontAwesomeIcon icon={faPlus} /> Add more
          </button>

          {value.length > 3 && ( <span  className="btn-multiple-choice">|</span> )}


          {value.length > 3 && (
            <button
              onClick={() => removeAll(onChange, value)}
              type="button"
              className="btn-multiple-choice btn-remove-all"
            >
              Remove all
            </button>
          )}
        </div>
    </div>
  );
};

