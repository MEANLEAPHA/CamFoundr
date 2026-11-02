"use client";

import { useEffect, useState } from "react";
import { Users, FileText, BookOpen, Image, Calendar, Flag } from "lucide-react";
import DashboardLayout from "./components/DashboardLayout";
import StatsCard from "./components/StatsCard";
import { api } from "./lib/api";

interface DashboardData {
  stats: {
    users: { total_users: number; banned_users: number; new_users_week: number };
    posts: { total_posts: number; active_posts: number };
    blogs: { total_blogs: number; pending_blogs: number; published_blogs: number };
    gifs: { total_gifs: number };
    events: { total_events: number; upcoming_events: number };
    reports: { total_reports: number };
  };
  pendingBlogs: { id: number; title: string; author: string; created_at: string }[];
  recentUsers: { id: number; username: string; email: string; created_at: string; role: string; is_banned: boolean }[];
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 18) return "afternoon";
  return "evening";
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const res = await api.get<DashboardData>("/api/admin/stats");
      setData(res);
    } catch { /* ignore */ }
    setLoading(false);
  }

  async function handleBlog(id: number, action: "approve" | "reject") {
    setActionLoading(`${id}-${action}`);
    try {
      await api.post(`/api/admin/blogs/${id}/${action}`);
      setData(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          pendingBlogs: prev.pendingBlogs.filter(b => b.id !== id),
          stats: {
            ...prev.stats,
            blogs: { ...prev.stats.blogs, pending_blogs: prev.stats.blogs.pending_blogs - 1 },
          },
        };
      });
    } catch { /* ignore */ }
    setActionLoading(null);
  }

  const pending = data?.stats.blogs.pending_blogs ?? 0;

  return (
    <DashboardLayout title="Dashboard" pendingBlogsCount={pending}>
      <div style={{ marginBottom: "20px" }}>
        <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#f1f5f9" }}>
          Good {getGreeting()}, Admin 👋
        </h2>
        <p style={{ color: "#475569", fontSize: "13px", marginTop: "4px" }}>
          Here&apos;s what&apos;s happening on CamFoundr today.
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "28px" }}>
        <StatsCard title="Total Users" value={data?.stats.users.total_users ?? 0} icon={Users} color="indigo" loading={loading} />
        <StatsCard title="Total Posts" value={data?.stats.posts.total_posts ?? 0} icon={FileText} color="blue" loading={loading} />
        <StatsCard title="Pending Blogs" value={pending} icon={BookOpen} color="amber" loading={loading} />
        <StatsCard title="Total GIFs" value={data?.stats.gifs.total_gifs ?? 0} icon={Image} color="purple" loading={loading} />
        <StatsCard title="Upcoming Events" value={data?.stats.events.upcoming_events ?? 0} icon={Calendar} color="emerald" loading={loading} />
        <StatsCard title="Reports" value={data?.stats.reports.total_reports ?? 0} icon={Flag} color="red" loading={loading} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
        {/* Pending Blogs */}
        <div style={{ background: "rgba(15,23,42,0.7)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "14px", padding: "20px" }}>
          <h3 style={{ fontSize: "13px", fontWeight: 700, color: "#e2e8f0", marginBottom: "14px" }}>
            ⏳ Pending Blog Approvals
          </h3>
          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {[1, 2, 3].map(i => <div key={i} style={{ height: "48px", background: "#1e293b", borderRadius: "8px", animation: "pulse 1.5s ease infinite" }} />)}
            </div>
          ) : (data?.pendingBlogs ?? []).length === 0 ? (
            <p style={{ color: "#475569", fontSize: "13px", textAlign: "center", padding: "24px 0" }}>✅ No pending blogs!</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {(data?.pendingBlogs ?? []).map(blog => (
                <div key={blog.id} style={{
                  display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px",
                  background: "rgba(30,41,59,0.5)", borderRadius: "10px",
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: "13px", fontWeight: 600, color: "#e2e8f0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{blog.title}</p>
                    <p style={{ fontSize: "11px", color: "#475569" }}>by {blog.author} · {new Date(blog.created_at).toLocaleDateString()}</p>
                  </div>
                  <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
                    <button
                      onClick={() => handleBlog(blog.id, "approve")}
                      disabled={!!actionLoading}
                      style={{
                        padding: "5px 10px", borderRadius: "7px", border: "none", cursor: "pointer",
                        background: "rgba(16,185,129,0.15)", color: "#34d399",
                        fontSize: "11px", fontWeight: 700, opacity: actionLoading ? 0.5 : 1,
                      }}
                    >✓ Approve</button>
                    <button
                      onClick={() => handleBlog(blog.id, "reject")}
                      disabled={!!actionLoading}
                      style={{
                        padding: "5px 10px", borderRadius: "7px", border: "none", cursor: "pointer",
                        background: "rgba(239,68,68,0.15)", color: "#f87171",
                        fontSize: "11px", fontWeight: 700, opacity: actionLoading ? 0.5 : 1,
                      }}
                    >✕ Reject</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Users */}
        <div style={{ background: "rgba(15,23,42,0.7)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "14px", padding: "20px" }}>
          <h3 style={{ fontSize: "13px", fontWeight: 700, color: "#e2e8f0", marginBottom: "14px" }}>
            👥 Recent Users
          </h3>
          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {[1, 2, 3, 4].map(i => <div key={i} style={{ height: "40px", background: "#1e293b", borderRadius: "8px", animation: "pulse 1.5s ease infinite" }} />)}
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column" }}>
              {(data?.recentUsers ?? []).map(u => (
                <div key={u.id} style={{
                  display: "flex", alignItems: "center", gap: "10px",
                  padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.04)",
                }}>
                  <div style={{
                    width: "32px", height: "32px", borderRadius: "50%", flexShrink: 0,
                    background: u.is_banned ? "#7f1d1d" : "linear-gradient(135deg,#4f46e5,#7c3aed)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <span style={{ fontSize: "12px", fontWeight: 700, color: "white" }}>{(u.username?.[0] ?? "U").toUpperCase()}</span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: "13px", fontWeight: 600, color: "#e2e8f0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.username}</p>
                    <p style={{ fontSize: "11px", color: "#475569", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.email}</p>
                  </div>
                  <span style={{
                    padding: "2px 8px", borderRadius: "999px", fontSize: "11px", fontWeight: 600,
                    background: u.is_banned ? "rgba(239,68,68,0.15)" : u.role === "admin" ? "rgba(99,102,241,0.15)" : "rgba(255,255,255,0.05)",
                    color: u.is_banned ? "#f87171" : u.role === "admin" ? "#818cf8" : "#64748b",
                  }}>{u.is_banned ? "Banned" : u.role}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <style>{`@keyframes pulse{0%,100%{opacity:0.5}50%{opacity:1}}`}</style>
    </DashboardLayout>
  );
}
