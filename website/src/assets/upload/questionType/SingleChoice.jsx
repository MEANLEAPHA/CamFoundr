import "../../style/upload/questionType/singlechoice.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircle, faTrashCan} from "@fortawesome/free-regular-svg-icons";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
export default function SingleChoice ({ value, onChange}) {
  const maxChoices = 10;

  // update a choice value
  const handleChange = (index, newValue) => {
    const updated = [...value];
    updated[index] = newValue;
    onChange(updated);
  };

  // add a new choice (up to maxChoices)
  const addChoice = () => {
    if (value.length < maxChoices) {
      onChange([...value, ""]);
    }
  };

  // delete a choice (only if > 3 remain)
  const deleteChoice = (index) => {
    if (value.length > 3) {
      const updated = value.filter((_, i) => i !== index);
      onChange(updated);
    }
  };

  // remove all but leave first 3
  const removeAll = () => {
    if (value.length > 3) {
      onChange(value.slice(0, 3));
    }
  };

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
        onChange={(e) => handleChange(index, e.target.value)}
      />

      {value.length > 3 && (
        <button
          type="button"
          className="btn-delete-single-choice"
          onClick={() => deleteChoice(index)}
        >
          <FontAwesomeIcon icon={faTrashCan} />
        </button>
      )}
    </div>
  ))}
</div>

<div className="single-choice-actions">
  <button
    onClick={addChoice}
    disabled={value.length >= maxChoices}
    type="button"
    className="btn-single-choice"
  >
    <FontAwesomeIcon icon={faPlus} /> Add more
  </button>

  {value.length > 3 && (
    <button
      onClick={removeAll}
      type="button"
      className="btn-single-choice btn-remove-all"
    >
      Remove all
    </button>
  )}
</div>
    </div>
  );
};

