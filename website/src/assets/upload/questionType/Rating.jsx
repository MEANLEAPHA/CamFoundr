import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { iconOptions } from "../../data/post_type_data";
import "../../style/upload/questionType/rating.css";
import { faAngleDown, faAngleUp } from "@fortawesome/free-solid-svg-icons";

export default function Rating({ value, onChange }) {
  const [openSelector, setOpenSelector] = useState(false);
  const selectedIcon = iconOptions.find(
    (opt) => opt.id === value
  );
  return (
    <div className="question-type-wrapper">
    <div className="rating-wrapper">
      {/* PREVIEW */}
      <div className="rating-preview">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="rating-preview-icon"
          >
            <FontAwesomeIcon
              icon={selectedIcon?.icon}
              style={{cursor:"pointer"}}
            />
          </div>
        ))}
      </div>

      {/* TOGGLE */}
      <button
        type="button"
        className="btn-rating-toggle"
        onClick={() => setOpenSelector(!openSelector)}
      >
        {openSelector
          ? <span>Change icon type <FontAwesomeIcon icon={faAngleUp} /></span>
          : <span>Change icon type <FontAwesomeIcon icon={faAngleDown} /></span>}
      </button>

      {/* SELECTOR */}
      {openSelector && (
        <div className="rating-selector">

          {iconOptions.map((opt) => (

            <label
              key={opt.id}
              className={`rating-option ${
                value === opt.id
                  ? "rating-option-active"
                  : ""
              }`}
            >

              <input
                type="radio"
                name="iconType"
                value={opt.id}
                checked={value === opt.id}
                onChange={() => onChange(opt.id)}
                className="rating-radio"
              />

              <FontAwesomeIcon
                icon={opt.icon}
              />

            </label>

          ))}

        </div>
      )}

    </div>
    </div>
  );
}