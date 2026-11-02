"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Users, FileText, BookOpen, Image,
  Calendar, Flag, Shield, LogOut, ChevronLeft, ChevronRight,
} from "lucide-react";
import { removeToken } from "../lib/auth";
import { useState } from "react";

interface NavItem {
  label: string;
  href: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: React.ComponentType<any>;
  badge?: number;
}

export default function Sidebar({ pendingBlogsCount = 0 }: { pendingBlogsCount?: number }) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  const navItems: NavItem[] = [
    { label: "Dashboard", href: "/", icon: LayoutDashboard },
    { label: "Users", href: "/users", icon: Users },
    { label: "Posts", href: "/posts", icon: FileText },
    { label: "Blogs", href: "/blogs", icon: BookOpen, badge: pendingBlogsCount || undefined },
    { label: "GIFs", href: "/gifs", icon: Image },
    { label: "Events", href: "/events", icon: Calendar },
    { label: "Reports", href: "/reports", icon: Flag },
  ];

  function handleLogout() {
    removeToken();
    router.push("/login");
  }

  const w = collapsed ? 72 : 240;

  return (
    <aside style={{
      width: `${w}px`, flexShrink: 0, display: "flex", flexDirection: "column",
      height: "100vh", transition: "width 0.25s ease",
      background: "rgba(6,10,20,0.98)", borderRight: "1px solid rgba(255,255,255,0.05)",
    }}>
      {/* Logo */}
      <div style={{
        display: "flex", alignItems: "center", gap: "12px",
        padding: "18px 16px", borderBottom: "1px solid rgba(255,255,255,0.05)",
      }}>
        <div style={{
          width: "34px", height: "34px", borderRadius: "10px", flexShrink: 0,
          background: "linear-gradient(135deg,#4f46e5,#7c3aed)",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 0 16px rgba(99,102,241,0.35)",
        }}>
          <Shield size={16} color="white" />
        </div>
        {!collapsed && (
          <div style={{ overflow: "hidden", flex: 1 }}>
            <p style={{ fontSize: "13px", fontWeight: 700, color: "#f1f5f9", whiteSpace: "nowrap" }}>CamFoundr</p>
            <p style={{ fontSize: "11px", color: "#475569", whiteSpace: "nowrap" }}>Admin Console</p>
          </div>
        )}
        <button
          onClick={() => setCollapsed(v => !v)}
          style={{
            background: "none", border: "none", cursor: "pointer",
            color: "#475569", padding: "4px", display: "flex", flexShrink: 0,
            marginLeft: collapsed ? "auto" : undefined,
          }}
          onMouseEnter={e => (e.currentTarget.style.color = "#94a3b8")}
          onMouseLeave={e => (e.currentTarget.style.color = "#475569")}
        >
          {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
        </button>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "12px 8px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "2px" }}>
        {navItems.map((item) => {
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href} style={{
              display: "flex", alignItems: "center", gap: "12px",
              padding: "10px 12px", borderRadius: "10px", textDecoration: "none",
              background: active ? "rgba(99,102,241,0.15)" : "transparent",
              color: active ? "#a5b4fc" : "#64748b",
              transition: "all 0.15s",
              position: "relative",
            }}
              onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)"; (e.currentTarget as HTMLElement).style.color = "#94a3b8"; }}
              onMouseLeave={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "#64748b"; } }}
            >
              <Icon size={17} style={{ flexShrink: 0 }} />
              {!collapsed && (
                <>
                  <span style={{ fontSize: "13px", fontWeight: 500, flex: 1, whiteSpace: "nowrap" }}>{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span style={{
                      background: "#f59e0b", color: "#1c1917", borderRadius: "999px",
                      padding: "1px 7px", fontSize: "11px", fontWeight: 700,
                    }}>{item.badge}</span>
                  )}
                </>
              )}
              {collapsed && item.badge !== undefined && item.badge > 0 && (
                <span style={{
                  position: "absolute", top: "6px", right: "6px",
                  width: "7px", height: "7px", borderRadius: "50%",
                  background: "#f59e0b",
                }} />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", padding: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            width: "32px", height: "32px", borderRadius: "50%", flexShrink: 0,
            background: "linear-gradient(135deg,#4f46e5,#7c3aed)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "white" }}>A</span>
          </div>
          {!collapsed && (
            <div style={{ flex: 1, overflow: "hidden" }}>
              <p style={{ fontSize: "12px", fontWeight: 600, color: "#cbd5e1", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Administrator</p>
              <p style={{ fontSize: "11px", color: "#475569" }}>Super Admin</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            title="Logout"
            style={{
              background: "none", border: "none", cursor: "pointer",
              color: "#475569", padding: "4px", display: "flex",
            }}
            onMouseEnter={e => (e.currentTarget.style.color = "#f87171")}
            onMouseLeave={e => (e.currentTarget.style.color = "#475569")}
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </aside>
  );
}
