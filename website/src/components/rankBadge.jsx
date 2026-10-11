import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMedal } from "@fortawesome/free-solid-svg-icons";

// Tier styles: rank 1 = purple, 2 = gold, 3 = bronze/brown, 4-10 = grey
const TIER_STYLES = {
  1: {
    gradientFrom: "#a855f7", // vivid purple
    gradientTo: "#6b21a8",   // deep purple
    glow: "rgba(168,85,247,0.45)",
    label: "Champion",
  },
  2: {
    gradientFrom: "#ffd76a",
    gradientTo: "#c99b1f",
    glow: "rgba(255,215,0,0.4)",
    label: "Runner-up",
  },
  3: {
    gradientFrom: "#c98a5b",
    gradientTo: "#8a5a2e",
    glow: "rgba(139,90,46,0.4)",
    label: "3rd Place",
  },
};

const DEFAULT_STYLE = {
  gradientFrom: "#b8bcc4",
  gradientTo: "#7c828c",
  glow: "rgba(120,124,132,0.3)",
  label: "Top 10",
};

const SIZE_MAP = {
  s: { icon: "0.5rem", pad: "2px" },
  sm: { icon: "0.78rem", pad: "3px" },
  md: { icon: "1.1rem", pad: "4px" },
  lg: { icon: "1.4rem", pad: "6px" },
};

const RankBadge = ({ rank, size = "sm", showTooltip = true }) => {
  if (!rank || rank > 10) return null;

  const style = TIER_STYLES[rank] || DEFAULT_STYLE;
  const dims = SIZE_MAP[size] || SIZE_MAP.md;

  return (
    <span
      title={showTooltip ? `Rank #${rank} — ${style.label}` : undefined}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        padding: dims.pad,
        borderRadius: "999px",
        background: `linear-gradient(145deg, ${style.gradientFrom}, ${style.gradientTo})`,
        boxShadow: `0 0 6px ${style.glow}`,
        lineHeight: 0,
        marginLeft: "6px",
        verticalAlign: "middle",
      }}
    >
      <FontAwesomeIcon
        icon={faMedal}
        style={{ fontSize: dims.icon, color: "#fff" }}
      />
    </span>
  );
};

export default RankBadge;