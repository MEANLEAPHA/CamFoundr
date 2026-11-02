"use client";

import { Bell } from "lucide-react";

export default function Header({ title }: { title: string }) {
  return (
    <header style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 24px", height: "60px", flexShrink: 0,
      borderBottom: "1px solid rgba(255,255,255,0.05)",
      background: "rgba(9,13,22,0.9)",
      backdropFilter: "blur(10px)",
    }}>
      <h1 style={{ fontSize: "16px", fontWeight: 700, color: "#f1f5f9" }}>{title}</h1>
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <button style={{
          background: "none", border: "none", cursor: "pointer",
          color: "#475569", padding: "6px", display: "flex", borderRadius: "8px",
          position: "relative",
        }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)"; (e.currentTarget as HTMLElement).style.color = "#94a3b8"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "none"; (e.currentTarget as HTMLElement).style.color = "#475569"; }}
        >
          <Bell size={17} />
        </button>
        <div style={{
          width: "32px", height: "32px", borderRadius: "50%",
          background: "linear-gradient(135deg,#4f46e5,#7c3aed)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <span style={{ fontSize: "12px", fontWeight: 700, color: "white" }}>A</span>
        </div>
      </div>
    </header>
  );
}
