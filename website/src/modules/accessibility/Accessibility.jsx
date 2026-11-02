import { useState } from "react";
import {
  Accessibility as AccessibilityIcon,
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronDown,
  Eye,
  Keyboard,
  Monitor,
  RotateCcw,
  Sparkles,
  Type,
  Volume2,
} from "lucide-react";
import "./Accessibility.css";

const LIMITATIONS = [
  {
    title: "Nested conversations",
    category: "COMMENTS",
    body: "We're working to make reply threads easier to follow and navigate.",
  },
  {
    title: "Finding the right idea",
    category: "SEARCH",
    body: "Search across hashtags, titles, and post content is still being improved.",
  },
  {
    title: "Discovering open questions",
    category: "DISCOVERY",
    body: "We're working on making unanswered questions easier to find.",
  },
  {
    title: "A simpler experience",
    category: "INTERFACE",
    body: "We're exploring ways to make the interface feel clearer and more comfortable.",
  },
];

const READING_SCALES = [
  { id: "compact", label: "Small", symbol: "A−" },
  { id: "default", label: "Default", symbol: "A" },
  { id: "roomy", label: "Large", symbol: "A+" },
];

export default function Accessibility() {
  const [readingScale, setReadingScale] = useState("default");
  const [highContrast, setHighContrast] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(() =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );

  const resetPreview = () => {
    setReadingScale("default");
    setHighContrast(false);
    setReducedMotion(false);
  };

  return (
    <div
      className={`naha11y-page ${reducedMotion ? "naha11y-motion-paused" : ""}`}
      id="accessibility-top"
    >
      <a className="naha11y-skip-link" href="#accessibility-main">
        Skip to accessibility statement
      </a>

      <div className="naha11y-topbar">
        <a className="naha11y-wordmark" href="/" aria-label="Nahidea home">
          <span className="naha11y-wordmark-icon" aria-hidden="true">
            <AccessibilityIcon size={20} strokeWidth={2.2} />
          </span>
          <span>Nahidea<span className="naha11y-wordmark-dot">.</span></span>
        </a>
        <nav className="naha11y-topnav" aria-label="Accessibility page">
          <a href="#our-approach">Our approach</a>
          <a href="#work-in-progress">In progress</a>
          <a className="naha11y-nav-cta" href="#accessibility-feedback">
            Share feedback <ArrowUpRight size={14} aria-hidden="true" />
          </a>
        </nav>
      </div>

      <div
        id="accessibility-main"
        className="naha11y-main"
        role="main"
        tabIndex="-1"
      >
        <div className="naha11y-hero">
          <div className="naha11y-hero-copy">
            <div className="naha11y-hero-kicker">
              <span className="naha11y-live-dot" />
              ACCESS FOR EVERYONE
              <span className="naha11y-kicker-rule" />
              UPDATED AUG 03, 2026
            </div>
            <h1 className="naha11y-hero-title">
              Make room
              <br />
              <span>for every</span>
              <br />
              <span className="naha11y-title-highlight">kind of mind.</span>
            </h1>
            <p className="naha11y-hero-description">
              Nahidea is a place for ideas and conversation. We’re working to
              make it easier for everyone to join in—and we’ll be honest about
              what still needs work.
            </p>
            <div className="naha11y-hero-actions">
              <a className="naha11y-primary-action" href="#our-approach">
                Explore our approach <ArrowDown size={16} aria-hidden="true" />
              </a>
              <span className="naha11y-hero-note">
                Progress, not perfection.
              </span>
            </div>
            <div className="naha11y-hero-index" aria-hidden="true">
              <span>01</span>
              <span className="naha11y-index-line" />
              <span>04</span>
            </div>
          </div>

          <div className="naha11y-hero-side">
            <div className="naha11y-orbit naha11y-orbit-outer" />
            <div className="naha11y-orbit naha11y-orbit-inner" />
            <div className="naha11y-orbit-label naha11y-orbit-label-top">
              EVERY VOICE
            </div>
            <div className="naha11y-orbit-label naha11y-orbit-label-bottom">
              BELONGS HERE
            </div>
            <div className="naha11y-center-burst">
              <Sparkles size={35} strokeWidth={1.7} aria-hidden="true" />
            </div>
            <div className="naha11y-float-token naha11y-token-eye">
              <Eye size={21} aria-hidden="true" />
            </div>
            <div className="naha11y-float-token naha11y-token-type">
              <Type size={21} aria-hidden="true" />
            </div>
            <div className="naha11y-float-token naha11y-token-sound">
              <Volume2 size={20} aria-hidden="true" />
            </div>
            <span className="naha11y-star naha11y-star-one" aria-hidden="true">✳</span>
            <span className="naha11y-star naha11y-star-two" aria-hidden="true">✳</span>
          </div>

          <div className="naha11y-hero-foot">
            <span>ACCESSIBILITY IS AN ONGOING PRACTICE</span>
            <a href="#reading-lab">
              Try the reading lab <ArrowRight size={14} aria-hidden="true" />
            </a>
          </div>
        </div>

        <div className="naha11y-body-grid">
          <div className="naha11y-content-column">
            <div className="naha11y-approach" id="our-approach">
              <div className="naha11y-section-marker">
                <span>01</span>
                <span>THE APPROACH</span>
              </div>
              <div className="naha11y-approach-copy">
                <h2>Built to include.<br /><span>Improved in the open.</span></h2>
                <p>
                  We want everyone to be able to read, write, and take part in
                  Nahidea. We use WCAG guidance as a reference while we make
                  thoughtful, ongoing improvements.
                </p>
                <div className="naha11y-commitment-note">
                  <span className="naha11y-note-icon">
                    <Check size={17} aria-hidden="true" />
                  </span>
                  <span>
                    <strong>We’ll keep listening.</strong>
                    <small>Accessibility improves when people can tell us what gets in their way.</small>
                  </span>
                </div>
              </div>
            </div>

            <div className="naha11y-access-areas">
              <div className="naha11y-section-heading">
                <div className="naha11y-section-marker">
                  <span>02</span>
                  <span>WHAT WE CONSIDER</span>
                </div>
                <p>Different ways to experience the same conversation.</p>
              </div>
              <div className="naha11y-area-grid">
                <div className="naha11y-area-card">
                  <span className="naha11y-area-icon"><Monitor size={19} aria-hidden="true" /></span>
                  <span className="naha11y-area-number">A / 01</span>
                  <h3>Flexible screens</h3>
                  <p>Layouts adapt across common screen sizes. We’re still improving the mobile experience.</p>
                </div>
                <div className="naha11y-area-card">
                  <span className="naha11y-area-icon"><Eye size={19} aria-hidden="true" /></span>
                  <span className="naha11y-area-number">A / 02</span>
                  <h3>Visual comfort</h3>
                  <p>Light and dark themes offer different ways to view the interface.</p>
                </div>
                <div className="naha11y-area-card naha11y-area-card-wide">
                  <span className="naha11y-area-icon"><Keyboard size={19} aria-hidden="true" /></span>
                  <span className="naha11y-area-number">A / 03</span>
                  <h3>Keyboard navigation</h3>
                  <p>Use your keyboard to move between interactive controls.</p>
                  <div className="naha11y-key-list">
                    <span><kbd>Tab</kbd> Move forward</span>
                    <span><kbd>Shift</kbd><b>+</b><kbd>Tab</kbd> Move backward</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="naha11y-roadmap" id="work-in-progress">
              <div className="naha11y-section-heading">
                <div className="naha11y-section-marker">
                  <span>03</span>
                  <span>THE OPEN ROADMAP</span>
                </div>
                <h2>What still needs work<span>?</span></h2>
                <p>Here are a few areas we’re actively thinking about. Select one to read more.</p>
              </div>
              <div className="naha11y-roadmap-list">
                {LIMITATIONS.map((item, index) => (
                  <details className="naha11y-roadmap-item" key={item.title}>
                    <summary>
                      <span className="naha11y-roadmap-index">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="naha11y-roadmap-title-wrap">
                        <span className="naha11y-roadmap-category">{item.category}</span>
                        <strong>{item.title}</strong>
                      </span>
                      <span className="naha11y-roadmap-state">IN PROGRESS</span>
                      <ChevronDown className="naha11y-roadmap-chevron" size={18} aria-hidden="true" />
                    </summary>
                    <p>{item.body}</p>
                  </details>
                ))}
              </div>
            </div>
          </div>

          <aside className="naha11y-side-column">
            <div className="naha11y-lab" id="reading-lab">
              <div className="naha11y-lab-top">
                <span className="naha11y-lab-icon"><AccessibilityIcon size={19} aria-hidden="true" /></span>
                <span className="naha11y-lab-label">INTERACTIVE PREVIEW</span>
                <span className="naha11y-lab-spark">✳</span>
              </div>
              <h2>Make it<br />easier to read.</h2>
              <p className="naha11y-lab-intro">Text settings change the sample; the motion setting affects this page only.</p>

              <div className="naha11y-control-group">
                <div className="naha11y-control-heading">
                  <span>Text size</span>
                  <span className="naha11y-control-hint">CHOOSE ONE</span>
                </div>
                <div className="naha11y-size-controls" role="group" aria-label="Preview text size">
                  {READING_SCALES.map((scale) => (
                    <button
                      className={`naha11y-size-button ${readingScale === scale.id ? "is-selected" : ""}`}
                      key={scale.id}
                      type="button"
                      onClick={() => setReadingScale(scale.id)}
                      aria-pressed={readingScale === scale.id}
                      aria-label={`${scale.label} preview text`}
                    >
                      {scale.symbol}
                    </button>
                  ))}
                </div>
              </div>

              <div className="naha11y-toggle-list">
                <button
                  className="naha11y-toggle-row"
                  type="button"
                  onClick={() => setHighContrast((enabled) => !enabled)}
                  aria-pressed={highContrast}
                >
                  <span className="naha11y-toggle-icon"><Eye size={17} aria-hidden="true" /></span>
                  <span className="naha11y-toggle-copy">
                    <strong>High contrast</strong>
                    <small>Boost text separation</small>
                  </span>
                  <span className={`naha11y-switch ${highContrast ? "is-on" : ""}`} aria-hidden="true">
                    <span />
                  </span>
                </button>
                <button
                  className="naha11y-toggle-row"
                  type="button"
                  onClick={() => setReducedMotion((enabled) => !enabled)}
                  aria-pressed={reducedMotion}
                >
                  <span className="naha11y-toggle-icon"><Sparkles size={17} aria-hidden="true" /></span>
                  <span className="naha11y-toggle-copy">
                    <strong>Reduce motion</strong>
                    <small>Pause page animations</small>
                  </span>
                  <span className={`naha11y-switch ${reducedMotion ? "is-on" : ""}`} aria-hidden="true">
                    <span />
                  </span>
                </button>
              </div>

              <div
                className={`naha11y-preview ${highContrast ? "is-high-contrast" : ""}`}
                data-reading-scale={readingScale}
                aria-live="polite"
              >
                <span className="naha11y-preview-label">SAMPLE TEXT</span>
                <p>Every idea deserves the space to be heard.</p>
                <span className="naha11y-preview-caption">This is how your selected text setting looks.</span>
              </div>

              <button className="naha11y-reset-button" type="button" onClick={resetPreview}>
                <RotateCcw size={14} aria-hidden="true" /> Reset preview
              </button>
              <p className="naha11y-lab-disclaimer">
                These are local demos—not settings for the rest of the site.
              </p>
            </div>

            <div className="naha11y-assistive-note">
              <span className="naha11y-assistive-icon"><Volume2 size={19} aria-hidden="true" /></span>
              <span className="naha11y-assistive-label">ASSISTIVE TECHNOLOGY</span>
              <h3>Different tools.<br />One shared space.</h3>
              <p>We aim to improve compatibility with screen readers, including NVDA and VoiceOver. Experiences may vary as the platform evolves.</p>
              <div className="naha11y-reader-tags">
                <span>NVDA</span>
                <span>VoiceOver</span>
              </div>
            </div>

            <div className="naha11y-feedback-card" id="accessibility-feedback">
              <span className="naha11y-feedback-marker">YOUR EXPERIENCE MATTERS</span>
              <h3>Something getting<br />in your way?</h3>
              <p>Tell us what happened. Your feedback helps us understand what to improve.</p>
              <a href="/feedback">
                Let us know <ArrowUpRight size={16} aria-hidden="true" />
              </a>
              <span className="naha11y-feedback-decoration" aria-hidden="true">?</span>
            </div>
          </aside>
        </div>

        <div className="naha11y-footer">
          <a className="naha11y-footer-brand" href="#accessibility-top">
            <AccessibilityIcon size={17} aria-hidden="true" />
            NAHIDEA ACCESSIBILITY
          </a>
          <span>Last updated August 3, 2026</span>
          <a href="#accessibility-top" className="naha11y-back-top">
            Back to top <ArrowUpRight size={14} aria-hidden="true" />
          </a>
        </div>
      </div>
    </div>
  );
}
