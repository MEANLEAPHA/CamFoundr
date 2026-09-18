import React, { useEffect, useRef, useState } from "react";
import "./Rule.css";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faShieldHalved,
  faScaleBalanced,
} from "@fortawesome/free-solid-svg-icons";

import { faCalendarDays } from "@fortawesome/free-regular-svg-icons";

const rules = [
  {
    id: "respect",
    label: "Respect",
    tag: "COMMUNITY",
    title: "Be Respectful",
    content:
      "Treat all users with professionalism and basic respect, even during disagreement or criticism. Personal attacks, harassment, hate speech, intimidation, humiliation, threats, or targeted bullying are strictly prohibited. Debate ideas constructively instead of attacking individuals. A strong community is built through intelligent discussion, not hostility or emotional abuse.",
  },

  {
    id: "authentic",
    label: "Authenticity",
    tag: "IDENTITY",
    title: "Be Authentic",
    content:
      "Do not impersonate individuals, organizations, brands, or public figures. Fake identities, deceptive accounts, manipulated engagement, coordinated inauthentic behavior, or misleading representation designed to exploit trust are prohibited. Users should feel confident that interactions and contributions on Nahidea are genuine and transparent.",
  },

  {
    id: "content",
    label: "Quality",
    tag: "CONTENT",
    title: "Post Valuable Content",
    content:
      "Share content that contributes meaningful value to the platform. Posts should aim to educate, inform, inspire, entertain, solve problems, or encourage productive discussion. Repetitive reposts, meaningless engagement bait, spam-style posting, low-effort submissions, or content created solely to manipulate visibility may be removed.",
  },

  {
    id: "misinformation",
    label: "Accuracy",
    tag: "TRUST",
    title: "No Misinformation",
    content:
      "Do not intentionally spread false, manipulated, or misleading information. Users sharing news, tutorials, financial advice, technical guidance, or factual claims should make reasonable efforts to ensure accuracy. Content designed to deceive users, manipulate public perception, or cause harm may result in moderation action or account restriction.",
  },

  {
    id: "safety",
    label: "Safety",
    tag: "PROTECTION",
    title: "Keep The Community Safe",
    content:
      "Threats, violent behavior, criminal activity, exploitation, self-harm encouragement, extremist content, or dangerous conduct are strictly prohibited. Nahidea must remain a secure environment where users can participate without fear, intimidation, or harm. Any content that risks user safety may be removed immediately.",
  },

  {
    id: "privacy",
    label: "Privacy",
    tag: "CONFIDENTIALITY",
    title: "Respect Privacy",
    content:
      "Never share private, personal, or sensitive information without clear authorization. This includes passwords, financial information, government documents, addresses, phone numbers, personal conversations, or confidential records. Violating another person's privacy or safety is considered a severe platform violation.",
  },

  {
    id: "spam",
    label: "Spam",
    tag: "ABUSE",
    title: "No Spam or Manipulation",
    content:
      "Avoid excessive self-promotion, referral abuse, fake giveaways, automated posting systems, engagement farming, or attempts to manipulate algorithms and platform visibility. Growth and influence on Nahidea should come from legitimate value creation rather than exploitation of platform systems.",
  },

  {
    id: "moderation",
    label: "Moderation",
    tag: "ENFORCEMENT",
    title: "Follow Moderation Decisions",
    content:
      "Moderators may remove content, issue warnings, restrict visibility, or suspend accounts to maintain platform integrity and user safety. Attempts to bypass enforcement systems, repeatedly violate rules, abuse moderators, or evade restrictions may result in permanent account termination.",
  },

  {
    id: "legal",
    label: "Compliance",
    tag: "LEGAL",
    title: "Legal Compliance",
    content:
      "Users are responsible for ensuring that their activity on Nahidea complies with applicable laws and regulations. Illegal content, copyright infringement, fraud, unauthorized data collection, malicious software distribution, or unlawful conduct may result in immediate removal and potential reporting to relevant authorities.",
  },
];

export default function Rule() {
  const sectionRefs = useRef({});
  const navRefs = useRef({});

  const [activeId, setActiveId] = useState(rules[0].id);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

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
            <span className="ua-kicker">Community Standards</span>

            <h2 className="ua-brand-title">
              Nahidea Rules
            </h2>
          </div>

          <nav className="ua-nav" aria-label="Community rules">
            {rules.map((rule, i) => (
              <button
                key={rule.id}
                ref={(el) => (navRefs.current[rule.id] = el)}
                className={`ua-chip ${
                  activeId === rule.id ? "is-active" : ""
                }`}
                onClick={() => scrollTo(rule.id)}
                type="button"
              >
                <span className="ua-chip-num">
                  {String(i + 1).padStart(2, "0")}
                </span>

                <span className="ua-chip-label">
                  {rule.label}
                </span>
              </button>
            ))}
          </nav>

        </div>

        {/* MAIN */}
        <div className="ua-main">

          <header className="ua-header">

            <h1 className="ua-title">
              Community Rules
            </h1>

            <p className="ua-effective">
              <FontAwesomeIcon icon={faCalendarDays} />
              Effective: Jan 06, 2026
            </p>

          </header>

          <div className="ua-sections">

            {rules.map((rule, i) => {
              const isActive = activeId === rule.id;
              const isLast = i === rules.length - 1;

              return (
                <section
                  key={rule.id}
                  id={rule.id}
                  ref={(el) => (sectionRefs.current[rule.id] = el)}
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
                      {String(i + 1).padStart(2, "0")} — {rule.tag}
                    </span>

                    <h3 className="ua-section-title">
                      {rule.title}
                    </h3>

                    <p className="ua-section-text">
                      {rule.content}
                    </p>

                    {isLast && (
                      <div className="ua-rule-note">
                        <span>
                          Violations may result in warnings,
                          content removal, account restrictions,
                          or permanent suspension depending on
                          severity and repetition.
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
              Nahidea Community Standards • Internal Policy • 2026
            </span>
          </div>

        </div>
      </div>
    </div>
  );
}