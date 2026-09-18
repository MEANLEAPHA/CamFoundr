import "../../style/upload/questionType/range.css";
export default function Range({
  min,
  max,
  step,
  value,
  onChange,
  SetMax,
  SetMin,
  SetStep,
}) {
  // const percentage =
  //   ((value - (min || 0)) / ((max || 100) - (min || 0))) * 100;
  const percentage = Math.min(Math.max(((value - (min || 0)) / ((max || 100) - (min || 0))) * 100, 0), 100);

  const handleMin = (e) => {
    const val = e.target.value;
    SetMin(val === "" ? "" : Number(val));
  };

  const handleMax = (e) => {
    const val = e.target.value;
    SetMax(val === "" ? "" : Number(val));
  };

  const handleStep = (e) => {
    const val = e.target.value;
    SetStep(val === "" ? "" : Number(val));
  };

  return (
    <div className="custom-range-root question-type-wrapper">
      {/* SLIDER */}
      <div className="custom-range-preview">

        <div className="custom-range-minmax">
          {min || 0}
        </div>

        <div className="custom-range-slider-wrap" style={{ position: "relative" }}>

          {/* VALUE BUBBLE */}
          <div
            className="custom-range-thumb"
            style={{
              left: `${percentage}%`,
            }}
          >
            {value}
          </div>

          {/* <input
            type="range"
            className="custom-range-slider"
            min={min || 0}
            max={max || 100}
            step={step || 1}
            value={value}
            onChange={onChange}
          /> */}
          <input
              type="range"
              className="custom-range-slider"
              min={min || 0}
              max={max || 100}
              step={step || 1}
              value={Math.min(Math.max(value, min || 0), max || 100)}
              onChange={onChange}
            />

        </div>

        <div className="custom-range-minmax">
          {max || 100}
        </div>

      </div>


      {/* CONFIG */}
      <div className="custom-range-config">

        <div className="custom-range-field">
          <label className="custom-range-label">
            Minimum
          </label>

          <input
            type="number"
            className="custom-range-number"
            placeholder="0"
            value={min}
            onChange={handleMin}
          />
        </div>

        <div className="custom-range-field">
          <label className="custom-range-label">
            Maximum
          </label>

          <input
            type="number"
            className="custom-range-number"
            placeholder="100"
            value={max}
            onChange={handleMax}
          />
        </div>

        <div className="custom-range-field">
          <label className="custom-range-label">
            Step
          </label>

          <input
            type="number"
            className="custom-range-number"
            placeholder="1"
            value={step}
            onChange={handleStep}
          />
        </div>

      </div>
      <br/>
      <span className="custom-range-label-desc">
        Noted: Step is how much the slider moves each time
      </span>
    </div>
  );
}