import "./multiplechoice.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSquare, faTrashCan} from "@fortawesome/free-regular-svg-icons";
import { faPlus} from "@fortawesome/free-solid-svg-icons";
import {handleChange, deleteChoice, addChoice, removeAll, maxChoices} from "./util/choiceType";

export default function MultipleChoice({
  value,
  onChange,
  includeAllAbove,
  setIncludeAllAbove,
}) {
  return (
    <div className="question-type-wrapper">
      <div className="multiple-choice-parent ">
        {value.map((choice, index) => (
          <div key={index} className="multiple-choice-row">

            <div
              className="square-div"
            >
             <FontAwesomeIcon icon={faSquare} />
            </div>

            <input
              type="text"
              className="multiple-choice-input"
              placeholder={`Choice ${index + 1}`}
              value={choice}
              onChange={(e) => handleChange(index, e.target.value, onChange, value)}
            />

            {value.length > 3 && (
              <button
                className="btn-delete-multiple-choice"
                onClick={() => deleteChoice(index, onChange, value)}
                type="button"
              >
                 <FontAwesomeIcon icon={faTrashCan} />
              </button>
            )}
          </div>
        ))}

        {/* ALL ABOVE */}
        {includeAllAbove === 1 && (
          <div className="multiple-choice-row all-above-row">
            <div
              className="square-div"
            >
             <FontAwesomeIcon icon={faSquare} />
            </div>
            <input
              type="text"
              className="multiple-choice-input all-above-input"
              value="All Above"
              readOnly
              disabled
            />
          </div>
        )}
      </div>


      <div className="multiple-choice-actions">
        <button
          onClick={() => addChoice(onChange, value)}
          disabled={value.length >= maxChoices}
          type="button"
          className="btn-multiple-choice"
        >
        <FontAwesomeIcon icon={faPlus} /> Add more
        </button>

        <span  className="btn-multiple-choice">|</span>

        {!includeAllAbove && (
          <button
            onClick={() => setIncludeAllAbove(1)}
            type="button"
            className="btn-multiple-choice btn-all-above"
          >
            Add "All Above"
          </button>
        )}
      
    
        {includeAllAbove === 1 && (
          <button
            onClick={() => setIncludeAllAbove(0)}
            type="button"
            className="btn-multiple-choice btn-remove-all-above"
          >
            Remove "All Above"
          </button>
          
        )}
        
        { value.length > 3 && (
          <span  className="btn-multiple-choice">|</span>
        )}

        
        {value.length > 3 && (
          <button
            onClick={() => removeAll(onChange, value)}
            type="button"
            className="btn-multiple-choice btn-remove-multiple"
          >
            Remove all
          </button>
        )}
      </div>
    </div>
  );
}