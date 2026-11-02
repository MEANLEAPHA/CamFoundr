import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CamFoundr Admin Console",
  description: "Modern Admin Dashboard for CamFoundr Platform Management",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark h-full antialiased">
      <body className="min-h-full bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
