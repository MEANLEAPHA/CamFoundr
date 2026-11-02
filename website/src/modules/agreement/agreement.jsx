import React, { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  ArrowUp,
  BookOpen,
  CalendarDays,
  Check,
  ChevronRight,
  FileText,
  HeartHandshake,
  MessageCircle,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import "./agreement.css";

const sections = [
  {
    id: "acceptance",
    label: "Acceptance",
    tag: "ACCEPTANCE",
    title: "Acceptance of Terms",
    content:
      "By accessing, registering for, or using Nahidea, you agree to comply with this User Agreement and all applicable platform policies. If you do not agree with any part of these terms, you must discontinue use of the platform immediately. Your continued use of Nahidea confirms your acceptance of any future updates or revisions to this agreement.",
  },
  {
    id: "account",
    label: "Accounts",
    tag: "REGISTRATION",
    title: "User Accounts",
    content:
      "Users are responsible for maintaining the confidentiality and security of their accounts, passwords, and login credentials. You agree to provide accurate and complete registration information and to keep it updated. You are fully responsible for all activity conducted through your account, whether authorized by you or not.",
  },
  {
    id: "content",
    label: "Content",
    tag: "OWNERSHIP",
    title: "User Content",
    content:
      "You retain ownership of the content you create and publish on Nahidea. However, by uploading or sharing content, you grant Nahidea a worldwide, non-exclusive, royalty-free license to host, display, distribute, reproduce, and promote such content solely for operating and improving the platform. Users are responsible for ensuring they have the rights to any content they post.",
  },
  {
    id: "conduct",
    label: "Use Policy",
    tag: "GUIDELINES",
    title: "Acceptable Use",
    content:
      "You agree not to misuse Nahidea or engage in activities that harm the platform, its users, or its infrastructure. Prohibited activities include harassment, spam, misinformation, illegal conduct, automated abuse, unauthorized data collection, impersonation, or attempts to bypass platform restrictions. Violations may result in content removal, temporary suspension, or permanent account termination.",
  },
  {
    id: "privacy",
    label: "Privacy",
    tag: "SECURITY",
    title: "Privacy and Data",
    content:
      "Your privacy is important to us. By using Nahidea, you acknowledge that certain information may be collected, processed, and stored to provide platform functionality, security, analytics, and moderation. Please review our Privacy Policy to better understand how your information is handled.",
  },
  {
    id: "termination",
    label: "Termination",
    tag: "CLOSURE",
    title: "Account Suspension or Termination",
    content:
      "Nahidea reserves the right to suspend, restrict, or terminate accounts that violate this agreement, community rules, or applicable laws. We may also remove content that threatens platform integrity, user safety, or legal compliance. Certain enforcement actions may occur without prior warning depending on the severity of the violation.",
  },
  {
    id: "liability",
    label: "Liability",
    tag: "DISCLAIMER",
    title: "Limitation of Liability",
    content:
      "Nahidea is provided on an 'as available' basis without guarantees of uninterrupted service, accuracy, or reliability. To the maximum extent permitted by law, Nahidea and its operators shall not be liable for indirect damages, data loss, service interruptions, or user-generated content published through the platform.",
  },
  {
    id: "changes",
    label: "Changes",
    tag: "UPDATES",
    title: "Changes to Terms",
    content:
      "We may revise or update this User Agreement periodically to reflect platform improvements, legal requirements, or policy changes. Updated terms become effective once published on the platform. Continued use of Nahidea after updates constitutes acceptance of the revised agreement.",
  },
  {
    id: "contact",
    label: "Contact",
    tag: "SUPPORT",
    title: "Contact Information",
    content:
      "If you have questions, concerns, or legal inquiries regarding this User Agreement or the platform, you may give us feedback.",
  },
];

export default function Agreement() {
  const sectionRefs = useRef({});
  const navRefs = useRef({});
  const [activeId, setActiveId] = useState(sections[0].id);
  const [readingProgress, setReadingProgress] = useState(0);
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const updateReadingProgress = () => {
      const scrollableHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const progress =
        scrollableHeight > 0
          ? Math.min(100, Math.max(0, (window.scrollY / scrollableHeight) * 100))
          : 0;
      setReadingProgress(progress);
      setShowBackToTop(window.scrollY > 500);
    };

    updateReadingProgress();
    window.addEventListener("scroll", updateReadingProgress, { passive: true });
    window.addEventListener("resize", updateReadingProgress);
    return () => {
      window.removeEventListener("scroll", updateReadingProgress);
      window.removeEventListener("resize", updateReadingProgress);
    };
  }, []);

  // Scroll-spy: highlight nav item as user scrolls
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-30% 0px -55% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] }
    );
    Object.values(sectionRefs.current).forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // Keep active chip in view on mobile horizontal nav
  useEffect(() => {
    const el = navRefs.current[activeId];
    if (el && el.scrollIntoView) {
      el.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
  }, [activeId]);

  const scrollTo = (id) => {
    setActiveId(id);
    sectionRefs.current[id]?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="ua-page">
      <div
        className="ua-reading-track"
        role="progressbar"
        aria-label="Agreement reading progress"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(readingProgress)}
      >
        <span
          className="ua-reading-fill"
          style={{ transform: `scaleX(${readingProgress / 100})` }}
        />
      </div>
      <div className="ua-shell">
        <aside className="ua-sidebar">
          <a className="ua-brand" href="/" aria-label="Nahidea home">
            <span className="ua-brand-mark" aria-hidden="true">
              <HeartHandshake size={21} strokeWidth={2.2} />
            </span>
            <span className="ua-brand-copy">
              <span className="ua-kicker">Your community, clearly</span>
              <span className="ua-brand-title">Nahidea</span>
            </span>
            <span className="ua-brand-spark" aria-hidden="true">
              <Sparkles size={18} />
            </span>
          </a>

          <div className="ua-sidebar-caption">
            <span className="ua-sidebar-caption-line" />
            <span>IN THIS AGREEMENT</span>
          </div>

          <div className="ua-nav" role="navigation" aria-label="Agreement sections">
            {sections.map((sec, i) => (
              <button
                key={sec.id}
                ref={(el) => (navRefs.current[sec.id] = el)}
                className={`ua-chip ${activeId === sec.id ? "is-active" : ""}`}
                onClick={() => scrollTo(sec.id)}
                type="button"
                aria-current={activeId === sec.id ? "location" : undefined}
              >
                <span className="ua-chip-num">
                  {activeId === sec.id ? (
                    <Check size={14} strokeWidth={2.8} />
                  ) : (
                    String(i + 1).padStart(2, "0")
                  )}
                </span>
                <span className="ua-chip-label">{sec.label}</span>
                <ChevronRight className="ua-chip-arrow" size={15} aria-hidden="true" />
              </button>
            ))}
          </div>

          <div className="ua-sidebar-note">
            <ShieldCheck size={19} aria-hidden="true" />
            <span>Built on respect, safety, and open conversation.</span>
          </div>
        </aside>

        <div className="ua-main">
          <div className="ua-topline">
            <span className="ua-topline-label">
              <BookOpen size={15} aria-hidden="true" />
              COMMUNITY GUIDELINES
            </span>
            <span className="ua-topline-count">
              {String(sections.findIndex((section) => section.id === activeId) + 1).padStart(2, "0")}
              <span> / {String(sections.length).padStart(2, "0")}</span>
            </span>
          </div>

          <div className="ua-hero">
            <div className="ua-hero-copy">
              <span className="ua-hero-eyebrow">
                <Sparkles size={15} aria-hidden="true" />
                A good place to start
              </span>
              <h1 className="ua-title">
                Good conversations
                <br />
                <span>start with clarity.</span>
              </h1>
              <p className="ua-hero-description">
                A few shared expectations help keep Nahidea thoughtful, welcoming,
                and safe for everyone.
              </p>
              <div className="ua-effective">
                <CalendarDays size={16} aria-hidden="true" />
                <span>Effective January 06, 2026</span>
              </div>
            </div>
            <div className="ua-hero-art" aria-hidden="true">
              <div className="ua-art-orbit ua-art-orbit-one" />
              <div className="ua-art-orbit ua-art-orbit-two" />
              <div className="ua-art-card ua-art-card-back">
                <MessageCircle size={23} />
              </div>
              <div className="ua-art-card ua-art-card-front">
                <HeartHandshake size={36} strokeWidth={1.7} />
              </div>
              <span className="ua-art-dot ua-art-dot-one" />
              <span className="ua-art-dot ua-art-dot-two" />
              <Sparkles className="ua-art-spark" size={23} />
            </div>
            <div className="ua-hero-bottom">
              <div className="ua-hero-stat">
                <span className="ua-hero-stat-icon">
                  <FileText size={17} />
                </span>
                <span>
                  <strong>{sections.length} simple sections</strong>
                  <small>Everything you need to know</small>
                </span>
              </div>
              <div className="ua-progress-summary">
                <span>YOUR READING PROGRESS</span>
                <strong>{Math.round(readingProgress)}%</strong>
                <span className="ua-mini-progress">
                  <span style={{ transform: `scaleX(${readingProgress / 100})` }} />
                </span>
              </div>
            </div>
          </div>

          <div className="ua-sections" aria-label="User agreement">
            {sections.map((sec, i) => {
              const isActive = activeId === sec.id;
              return (
                <div
                  key={sec.id}
                  id={sec.id}
                  ref={(el) => (sectionRefs.current[sec.id] = el)}
                  className={`ua-section ${isActive ? "is-active" : ""}`}
                  role="article"
                  aria-labelledby={`${sec.id}-title`}
                >
                  <div className="ua-section-card">
                    <div className="ua-section-index" aria-hidden="true">
                      {String(i + 1).padStart(2, "0")}
                    </div>
                    <div className="ua-section-content">
                      <span className="ua-section-tag">{sec.tag}</span>
                      <h2 className="ua-section-title" id={`${sec.id}-title`}>
                        {sec.title}
                      </h2>
                      <p className="ua-section-text">{sec.content}</p>
                    </div>
                    <span className="ua-section-check" aria-hidden="true">
                      <Check size={16} />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="ua-floating-footer">
            <span className="ua-footer-mark">
              <HeartHandshake size={18} aria-hidden="true" />
            </span>
            <span>
              <strong>Thanks for being part of Nahidea.</strong>
              <small>Let’s keep the conversation thoughtful.</small>
            </span>
            <a className="ua-footer-link" href="https://nahidea.com/Feedback">
              Send feedback <ChevronRight size={15} aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
      <button
        className={`ua-back-top ${showBackToTop ? "is-visible" : ""}`}
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="Back to top"
        tabIndex={showBackToTop ? 0 : -1}
      >
        <ArrowUp size={18} />
      </button>
    </div>
  );
}
