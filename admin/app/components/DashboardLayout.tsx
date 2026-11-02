"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "../lib/auth";
import Sidebar from "./Sidebar";
import Header from "./Header";

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  pendingBlogsCount?: number;
}

export default function DashboardLayout({
  children,
  title = "Dashboard",
  pendingBlogsCount = 0,
}: DashboardLayoutProps) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // DEV: skip auth check — always pass
    setReady(true);
    // if (!isAuthenticated()) {
    //   router.replace("/login");
    // } else {
    //   setReady(true);
    // }
  }, [router]);

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#090d16" }}>
        <div className="flex flex-col items-center gap-3">
          <div style={{
            width: "36px", height: "36px",
            border: "2px solid #6366f1",
            borderTopColor: "transparent",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }} />
          <p style={{ color: "#64748b", fontSize: "13px" }}>Loading admin console...</p>
        </div>
        <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: "#090d16" }}>
      <Sidebar pendingBlogsCount={pendingBlogsCount} />
      <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
        <Header title={title} />
        <main style={{ flex: 1, overflowY: "auto", padding: "24px" }}>
          {children}
        </main>
      </div>
    </div>
  );
}
