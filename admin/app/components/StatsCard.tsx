"use client";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function StatsCard({ title, value, icon: Icon, color, loading }: { title: string; value: number; icon: React.ComponentType<any>; color: string; loading?: boolean; }) {
  const colors: Record<string, { bg: string; text: string; glow: string }> = {
    indigo: { bg: "rgba(99,102,241,0.12)", text: "#818cf8", glow: "rgba(99,102,241,0.2)" },
    blue: { bg: "rgba(59,130,246,0.12)", text: "#60a5fa", glow: "rgba(59,130,246,0.2)" },
    amber: { bg: "rgba(245,158,11,0.12)", text: "#fbbf24", glow: "rgba(245,158,11,0.2)" },
    purple: { bg: "rgba(168,85,247,0.12)", text: "#c084fc", glow: "rgba(168,85,247,0.2)" },
    emerald: { bg: "rgba(16,185,129,0.12)", text: "#34d399", glow: "rgba(16,185,129,0.2)" },
    red: { bg: "rgba(239,68,68,0.12)", text: "#f87171", glow: "rgba(239,68,68,0.2)" },
  };
  const c = colors[color] || colors.indigo;

  if (loading) {
    return (
      <div style={{
        background: "rgba(15,23,42,0.7)", border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: "14px", padding: "20px",
      }}>
        <div style={{ height: "14px", width: "60%", background: "#1e293b", borderRadius: "6px", marginBottom: "12px", animation: "pulse 1.5s ease infinite" }} />
        <div style={{ height: "28px", width: "40%", background: "#1e293b", borderRadius: "6px", animation: "pulse 1.5s ease infinite" }} />
        <style>{`@keyframes pulse{0%,100%{opacity:0.5}50%{opacity:1}}`}</style>
      </div>
    );
  }

  return (
    <div style={{
      background: "rgba(15,23,42,0.7)", border: "1px solid rgba(255,255,255,0.06)",
      borderRadius: "14px", padding: "20px", display: "flex", flexDirection: "column", gap: "10px",
      transition: "border-color 0.2s",
      cursor: "default",
    }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = c.glow)}
      onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)")}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <p style={{ fontSize: "12px", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>{title}</p>
        <div style={{ background: c.bg, padding: "8px", borderRadius: "10px" }}>
          <Icon size={16} color={c.text} />
        </div>
      </div>
      <p style={{ fontSize: "28px", fontWeight: 800, color: "#f1f5f9", lineHeight: 1 }}>
        {value.toLocaleString()}
      </p>
    </div>
  );
}
