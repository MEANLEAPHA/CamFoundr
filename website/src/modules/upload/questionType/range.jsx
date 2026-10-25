import "./range.css";
export default function Range({
  min,
  max,
  step,
  value,
  onChange,
  SetMax,
  SetMin,
  SetStep,
  SetValue,
}) {
  const rangeMin = min === "" || !Number.isFinite(Number(min)) ? 0 : Number(min);
  const rangeMax = max === "" || !Number.isFinite(Number(max)) ? 100 : Number(max);
  const rangeStep = step === "" || !Number.isFinite(Number(step)) || Number(step) <= 0
    ? 1
    : Number(step);
  const rangeValue = Number.isFinite(value) ? value : rangeMin;
  const rangeSpan = rangeMax - rangeMin;
  const getAlignedValue = (candidate, minimum = rangeMin, maximum = rangeMax, increment = rangeStep) => {
    if (maximum <= minimum || increment <= 0) return minimum;
    const boundedValue = Math.min(Math.max(candidate, minimum), maximum);
    const alignedValue = minimum + Math.round((boundedValue - minimum) / increment) * increment;
    return Math.min(alignedValue, maximum);
  };
  const displayValue = getAlignedValue(rangeValue);
  const percentage = rangeSpan > 0
    ? ((displayValue - rangeMin) / rangeSpan) * 100
    : 0;

  const handleMin = (e) => {
    const val = e.target.value;
    const nextMin = val === "" ? "" : Number(val);
    SetMin(nextMin);
    if (nextMin !== "" && nextMin < rangeMax) {
      SetValue(getAlignedValue(rangeValue, nextMin, rangeMax));
    }
  };

  const handleMax = (e) => {
    const val = e.target.value;
    const nextMax = val === "" ? "" : Number(val);
    SetMax(nextMax);
    if (nextMax !== "" && nextMax > rangeMin) {
      SetValue(getAlignedValue(rangeValue, rangeMin, nextMax));
    }
  };

  const handleStep = (e) => {
    const val = e.target.value;
    const nextStep = val === "" ? "" : Number(val);
    SetStep(nextStep);
    if (nextStep !== "" && nextStep > 0) {
      SetValue(getAlignedValue(rangeValue, rangeMin, rangeMax, nextStep));
    }
  };

  return (
    <div className="custom-range-root question-type-wrapper">
      {/* SLIDER */}
      <div className="custom-range-preview">

        <div className="custom-range-minmax">
          {rangeMin}
        </div>

        <div className="custom-range-slider-wrap" style={{ position: "relative" }}>

          {/* VALUE BUBBLE */}
          <div
            className="custom-range-thumb"
            style={{
              left: `${percentage}%`,
            }}
          >
            {displayValue}
          </div>

          {/* <input
            type="range"
            className="custom-range-slider"
            min={min || 0}
            max={max || 100}
            step={step || 1}
            value={rangeValue}
            onChange={onChange}
          /> */}
          <input
              type="range"
              className="custom-range-slider"
              min={rangeMin}
              max={rangeMax}
              step={rangeStep}
              value={displayValue}
              onChange={onChange}
            />

        </div>

        <div className="custom-range-minmax">
          {rangeMax}
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