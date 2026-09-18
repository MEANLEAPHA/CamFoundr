import React, { useEffect, useRef, useState } from "react";

// import "../style/page/UserAgreement.css";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import {
  faShield,
  faDatabase,
} from "@fortawesome/free-solid-svg-icons";

import {
  faCalendarDays,
} from "@fortawesome/free-regular-svg-icons";

const sections = [
  {
    id: "collection",
    label: "Collection",
    tag: "DATA",
    title: "Information We Collect",
    content:
      "Nahidea may collect information you provide directly when creating an account, publishing content, interacting with users, contacting support, or using platform features. This may include usernames, profile details, uploaded content, messages, preferences, and technical usage information. Certain system-level information such as device type, browser data, IP address, and interaction analytics may also be collected automatically to maintain platform functionality and security.",
  },

  {
    id: "usage",
    label: "Usage",
    tag: "PROCESSING",
    title: "How Information Is Used",
    content:
      "Collected information is used to operate, maintain, improve, and secure the Nahidea platform. This includes delivering platform features, personalizing user experience, moderating harmful activity, preventing abuse, analyzing performance, improving reliability, and communicating important updates. Information may also be used to enforce platform policies and comply with legal obligations.",
  },

  {
    id: "content",
    label: "Content",
    tag: "VISIBILITY",
    title: "Public Content and Visibility",
    content:
      "Content you publish publicly on Nahidea may be visible to other users and accessible through platform features such as search, recommendations, feeds, profiles, or community discovery systems. Users should avoid publishing confidential, personal, or sensitive information they do not wish to make publicly accessible.",
  },

  {
    id: "cookies",
    label: "Cookies",
    tag: "TRACKING",
    title: "Cookies and Similar Technologies",
    content:
      "Nahidea may use cookies, session storage, local storage, and similar technologies to improve functionality, remember preferences, maintain sessions, analyze usage behavior, and enhance security. These technologies help deliver a smoother and more consistent platform experience across devices and sessions.",
  },

  {
    id: "sharing",
    label: "Sharing",
    tag: "DISCLOSURE",
    title: "Information Sharing",
    content:
      "Nahidea does not sell personal information to third parties. Information may be shared with trusted infrastructure providers, moderation systems, analytics services, or legal authorities when reasonably necessary to operate the platform, enforce policies, investigate abuse, protect user safety, or comply with applicable law and regulatory requirements.",
  },

  {
    id: "security",
    label: "Security",
    tag: "PROTECTION",
    title: "Data Security",
    content:
      "Reasonable technical and organizational safeguards are implemented to protect user information against unauthorized access, misuse, loss, or disclosure. However, no digital system or online platform can guarantee absolute security. Users are responsible for maintaining strong passwords, protecting account credentials, and practicing safe online behavior.",
  },

  {
    id: "retention",
    label: "Retention",
    tag: "STORAGE",
    title: "Data Retention",
    content:
      "Information may be retained for as long as necessary to provide services, maintain platform integrity, comply with legal obligations, resolve disputes, enforce agreements, or support legitimate operational purposes. Certain content or records may remain in backups, logs, or archived systems for a limited period after deletion.",
  },

  {
    id: "rights",
    label: "Rights",
    tag: "CONTROL",
    title: "User Rights and Choices",
    content:
      "Users may have the ability to access, update, correct, or delete certain account information depending on platform functionality and applicable laws. Users may also manage visibility settings, profile details, and communication preferences directly through available account settings and controls.",
  },

  {
    id: "children",
    label: "Age Policy",
    tag: "MINORS",
    title: "Children's Privacy",
    content:
      "Nahidea is not intended for individuals who are below the minimum age required under applicable laws or platform policies. We do not knowingly collect personal information from children without appropriate legal authorization. Accounts found violating age requirements may be restricted or removed.",
  },

  {
    id: "international",
    label: "Global Use",
    tag: "TRANSFER",
    title: "International Data Processing",
    content:
      "By using Nahidea, you understand that information may be processed, stored, or transferred across systems and jurisdictions where the platform or its service providers operate. Data protection standards may vary depending on geographic region and applicable legal frameworks.",
  },

  {
    id: "changes",
    label: "Updates",
    tag: "REVISIONS",
    title: "Changes to This Privacy Policy",
    content:
      "Nahidea may revise or update this Privacy Policy periodically to reflect operational changes, legal obligations, security improvements, or feature updates. Revised versions become effective once published on the platform. Continued use of Nahidea after updates indicates acceptance of the revised policy.",
  },

  {
    id: "contact",
    label: "Contact",
    tag: "SUPPORT",
    title: "Contact Information",
    content:
      "If you have questions, concerns, legal requests, or privacy-related inquiries regarding this Privacy Policy or the handling of your information, you may contact the Nahidea support team through the official support channels available on the platform.",
  },
];

export default function PrivacyPolicy() {

  const sectionRefs = useRef({});
  const navRefs = useRef({});

  const [activeId, setActiveId] = useState(sections[0].id);

  useEffect(() => {

    const observer = new IntersectionObserver(
      (entries) => {

        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort(
            (a, b) =>
              b.intersectionRatio - a.intersectionRatio
          );

        if (visible[0]) {
          setActiveId(visible[0].target.id);
        }

      },

      {
        rootMargin: "-30% 0px -55% 0px",
        threshold: [0, 0.25, 0.5, 0.75, 1],
      }
    );

    Object.values(sectionRefs.current).forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();

  }, []);

  useEffect(() => {

    const el = navRefs.current[activeId];

    if (el && el.scrollIntoView) {
      el.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }

  }, [activeId]);

  const scrollTo = (id) => {

    setActiveId(id);

    sectionRefs.current[id]?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });

  };

  return (
    <div className="ua-page">

      <div className="ua-shell">

        {/* SIDEBAR */}
        <div className="ua-sidebar">

          <div className="ua-brand">

            <span className="ua-kicker">
              Privacy & Data Protection
            </span>

            <h2 className="ua-brand-title">
              Privacy Policy
            </h2>

          </div>

          <nav
            className="ua-nav"
            aria-label="Privacy policy sections"
          >

            {sections.map((sec, i) => (

              <button
                key={sec.id}
                ref={(el) => (navRefs.current[sec.id] = el)}
                className={`ua-chip ${
                  activeId === sec.id ? "is-active" : ""
                }`}
                onClick={() => scrollTo(sec.id)}
                type="button"
              >

                <span className="ua-chip-num">
                  {String(i + 1).padStart(2, "0")}
                </span>

                <span className="ua-chip-label">
                  {sec.label}
                </span>

              </button>

            ))}

          </nav>

        </div>

        {/* MAIN */}
        <div className="ua-main">

          <header className="ua-header">

            <h1 className="ua-title">

              Privacy Policy

            </h1>

            <p className="ua-effective">

              <FontAwesomeIcon icon={faCalendarDays} />

              Effective: Jan 06, 2026

            </p>

          </header>

          <div className="ua-sections">

            {sections.map((sec, i) => {

              const isActive = activeId === sec.id;

              const isLast =
                i === sections.length - 1;

              return (

                <section
                  key={sec.id}
                  id={sec.id}
                  ref={(el) =>
                    (sectionRefs.current[sec.id] = el)
                  }
                  className={`ua-section ${
                    isActive ? "is-active" : ""
                  } ${
                    isLast ? "is-dark" : ""
                  }`}
                >

                  {isActive && !isLast && (
                    <span
                      className="ua-accent-bar"
                      aria-hidden="true"
                    />
                  )}

                  <div className="ua-section-card">

                    <span className="ua-section-tag">

                      {String(i + 1).padStart(2, "0")} — {sec.tag}

                    </span>

                    <h3 className="ua-section-title">
                      {sec.title}
                    </h3>

                    <p className="ua-section-text">
                      {sec.content}
                    </p>

                    {isLast && (

                      <div className="ua-rule-note">

                      

                        <span>
                          Nahidea continuously reviews
                          security, privacy, and compliance
                          practices to improve user data
                          protection and platform integrity.
                        </span>

                      </div>

                    )}

                  </div>

                </section>

              );

            })}

          </div>

          <div className="ua-floating-footer">

            <span>
              Nahidea Privacy Standards • Internal Policy • 2026
            </span>

          </div>

        </div>

      </div>

    </div>
  );
}