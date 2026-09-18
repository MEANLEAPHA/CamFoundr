import "../../style/upload/questionType/multiplechoice.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSquare, faTrashCan} from "@fortawesome/free-regular-svg-icons";
import { faPlus, faUpDown } from "@fortawesome/free-solid-svg-icons";
export default function MultipleChoice({
  value,
  onChange,
  includeAllAbove,
  setIncludeAllAbove,
}) {
  const maxChoices = 10;

  const handleChange = (index, newValue) => {
    const updated = [...value];
    updated[index] = newValue;
    onChange(updated);
  };

  const addChoice = () => {
    if (value.length < maxChoices) {
      onChange([...value, ""]);
    }
  };

  const deleteChoice = (index) => {
    if (value.length > 3) {
      const updated = value.filter((_, i) => i !== index);
      onChange(updated);
    }
  };

  const removeAll = () => {
    if (value.length > 3) {
      onChange(value.slice(0, 3));
    }
  };

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
              onChange={(e) => handleChange(index, e.target.value)}
            />

            {value.length > 3 && (
              <button
                className="btn-delete-multiple-choice"
                onClick={() => deleteChoice(index)}
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
          onClick={addChoice}
          disabled={value.length >= maxChoices}
          type="button"
          className="btn-multiple-choice"
        >
          <FontAwesomeIcon icon={faPlus} /> Add more
        </button>

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
        
        {value.length > 3 && (
          <button
            onClick={removeAll}
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