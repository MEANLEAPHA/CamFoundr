import React, { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "./UserAgreement.css";
import { faCalendarDays } from "@fortawesome/free-regular-svg-icons";

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

export default function UserAgreement() {
  const sectionRefs = useRef({});
  const navRefs = useRef({});
  const [activeId, setActiveId] = useState(sections[0].id);

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
      <div className="ua-shell">
        {/* SIDEBAR */}
        <div className="ua-sidebar">
          <div className="ua-brand">
            <span className="ua-kicker">Agreement</span>
            <h2 className="ua-brand-title">Nahidea</h2>
          </div>

          <nav className="ua-nav" aria-label="Agreement sections">
            {sections.map((sec, i) => (
              <button
                key={sec.id}
                ref={(el) => (navRefs.current[sec.id] = el)}
                className={`ua-chip ${activeId === sec.id ? "is-active" : ""}`}
                onClick={() => scrollTo(sec.id)}
                type="button"
              >
                <span className="ua-chip-num">{String(i + 1).padStart(2, "0")}</span>
                <span className="ua-chip-label">{sec.label}</span>
              </button>
            ))}
          </nav>

      
        </div>

        {/* CONTENT */}
        <div className="ua-main">
          <header className="ua-header">
            <h1 className="ua-title"> User Agreement</h1>
            <p className="ua-effective"> <FontAwesomeIcon icon={faCalendarDays} /> Effective: Jan 06, 2026</p>
          </header>

          <div className="ua-sections">
            {sections.map((sec, i) => {
              const isActive = activeId === sec.id;
              const isLast = i === sections.length - 1;
              return (
                <section
                  key={sec.id}
                  id={sec.id}
                  ref={(el) => (sectionRefs.current[sec.id] = el)}
                  className={`ua-section ${isActive ? "is-active" : ""} ${
                    isLast ? "is-dark" : ""
                  }`}
                >
                  {isActive && !isLast && <span className="ua-accent-bar" aria-hidden="true" />}
                  <div className="ua-section-card">
                    <span className="ua-section-tag">
                      {String(i + 1).padStart(2, "0")} — {sec.tag}
                    </span>
                    <h3 className="ua-section-title">{sec.title}</h3>
                    <p className="ua-section-text">{sec.content}</p>
                    {isLast && (
                      <a className="ua-cta" href="https://nahidea.com/Feedback">
                        Feedback
                      </a>
                    )}
                  </div>
                </section>
              );
            })}
          </div>

          <div className="ua-floating-footer">
            <span>Nahidea Internal Document • Confidential • 2026</span>
          </div>
        </div>
      </div>
    </div>
  );
}
