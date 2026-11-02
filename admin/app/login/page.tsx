"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, Eye, EyeOff, Loader2 } from "lucide-react";
import { setToken } from "../lib/auth";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export default function LoginPage() {
  const router = useRouter();
  const [key, setKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!key.trim()) { setError("Please enter your admin key"); return; }
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: key.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Invalid credentials");
      setToken(data.token);
      router.push("/");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ background: "#090d16" }}>
      {/* Animated background blobs */}
      <div style={{
        position: "absolute", width: "600px", height: "600px",
        background: "radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)",
        top: "-200px", left: "-200px", borderRadius: "50%",
        animation: "pulse 8s ease-in-out infinite",
      }} />
      <div style={{
        position: "absolute", width: "500px", height: "500px",
        background: "radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)",
        bottom: "-100px", right: "-100px", borderRadius: "50%",
        animation: "pulse 10s ease-in-out infinite alternate",
      }} />

      {/* Card */}
      <div style={{
        background: "rgba(15,23,42,0.8)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "20px",
        padding: "40px",
        width: "100%",
        maxWidth: "400px",
        position: "relative",
        zIndex: 10,
      }}>
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div style={{
            width: "56px", height: "56px", borderRadius: "16px",
            background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
            display: "flex", alignItems: "center", justifyContent: "center",
            marginBottom: "16px",
            boxShadow: "0 0 30px rgba(99,102,241,0.3)",
          }}>
            <Shield size={28} color="white" />
          </div>
          <h1 className="text-xl font-bold text-slate-100">CamFoundr Admin</h1>
          <p className="text-slate-500 text-sm mt-1">Secure admin console</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">
              Admin Key
            </label>
            <div className="relative">
              <input
                type={showKey ? "text" : "password"}
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="Enter your admin key..."
                autoComplete="current-password"
                style={{
                  width: "100%",
                  padding: "12px 44px 12px 16px",
                  background: "rgba(30,41,59,0.6)",
                  border: error ? "1px solid rgba(239,68,68,0.5)" : "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "10px",
                  color: "#f1f5f9",
                  fontSize: "14px",
                  outline: "none",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "rgba(99,102,241,0.6)";
                  e.target.style.boxShadow = "0 0 0 2px rgba(99,102,241,0.15)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = error ? "rgba(239,68,68,0.5)" : "rgba(255,255,255,0.08)";
                  e.target.style.boxShadow = "none";
                }}
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                style={{
                  position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)",
                  background: "none", border: "none", cursor: "pointer", color: "#64748b",
                  padding: "4px", display: "flex",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#94a3b8")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#64748b")}
              >
                {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <div style={{
              padding: "10px 14px",
              background: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.2)",
              borderRadius: "8px",
              color: "#f87171",
              fontSize: "13px",
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "12px",
              background: loading ? "rgba(99,102,241,0.5)" : "linear-gradient(135deg, #4f46e5, #6d28d9)",
              border: "none",
              borderRadius: "10px",
              color: "white",
              fontSize: "14px",
              fontWeight: "600",
              cursor: loading ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              transition: "opacity 0.15s",
            }}
            onMouseEnter={(e) => { if (!loading) (e.currentTarget as HTMLButtonElement).style.opacity = "0.9"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = "1"; }}
          >
            {loading ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> : null}
            {loading ? "Authenticating..." : "Sign In"}
          </button>
        </form>

        <p className="text-center text-slate-600 text-xs mt-6">
          CamFoundr Admin Console — Authorized access only
        </p>
      </div>

      <style>{`
        @keyframes pulse { 0%,100%{transform:scale(1);opacity:0.6} 50%{transform:scale(1.1);opacity:1} }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
      `}</style>
    </div>
  );
}
