import React from "react";
const parseJSON = (val) => {
  try {
    if (typeof val === "string") {
      const parsed = JSON.parse(val);
      return Array.isArray(parsed) ? parsed : [parsed];
    }
    // if it's already an array, keep it; if it's a single value, wrap it
    return Array.isArray(val) ? val : [val];
  } catch {
    // if JSON.parse fails, just wrap the raw string
    return [val];
  }
};
export default parseJSON;