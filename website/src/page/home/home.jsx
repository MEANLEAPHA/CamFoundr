import { ArrowDown, ArrowRight, ArrowUpRight, BookOpen, Lightbulb, Mic2, Users } from "lucide-react";
import { Link } from "react-router-dom";
import "./home.css";

const focusAreas = [
  {
    number: "01",
    icon: <Mic2 aria-hidden="true" />,
    title: "Learn to speak with purpose",
    description: "Build confidence, structure ideas, and make a case that people want to hear.",
  },
  {
    number: "02",
    icon: <BookOpen aria-hidden="true" />,
    title: "Think beyond your first answer",
    description: "Explore different perspectives, ask better questions, and support ideas with evidence.",
  },
  {
    number: "03",
    icon: <Users aria-hidden="true" />,
    title: "Grow through dialogue",
    description: "Practice listening with respect and turn disagreement into a chance to learn.",
  },
];

const roadmap = [
  {
    number: "01",
    title: "Discover",
    description: "Make debate easier to understand and invite more young people into the conversation.",
  },
  {
    number: "02",
    title: "Practice",
    description: "Create welcoming spaces to build research, reasoning, and public-speaking skills.",
  },
  {
    number: "03",
    title: "Connect",
    description: "Bring young people together to exchange ideas, learn from one another, and grow.",
  },
  {
    number: "04",
    title: "Lead",
    description: "Support a new generation of thoughtful voices ready to contribute to their communities.",
  },
];

export default function Home() {
  return (
    <div className="cdl-home">
      <div className="cdl-home__inner">
        <section className="cdl-hero" aria-labelledby="cdl-hero-title">
          <div className="cdl-hero__copy">
            <p className="cdl-eyebrow">
              <span className="cdl-eyebrow__dot" />
              Cambodian Debate League
            </p>
            <h1 id="cdl-hero-title">
              Big ideas begin with <span>a voice.</span>
            </h1>
            <p className="cdl-hero__intro">
              We help young people find the confidence to speak, the curiosity to listen, and the
              courage to shape what comes next.
            </p>
            <div className="cdl-hero__actions">
              <a className="cdl-button cdl-button--primary" href="#mission">
                Discover our mission <ArrowRight aria-hidden="true" />
              </a>
              <a
                className="cdl-button cdl-button--text"
                href="https://www.facebook.com/p/Cambodian-Debate-League-CDL-61552655401507/"
                target="_blank"
                rel="noreferrer"
              >
                Meet CDL <ArrowUpRight aria-hidden="true" />
              </a>
            </div>
            
            
          </div>

          <div className="cdl-hero__visual">
            <img
              className="cdl-hero__image"
              src="https://images.unsplash.com/photo-1529390079861-591de354faf5?auto=format&fit=crop&w=1400&q=85"
              alt="Students learning together in a classroom"
            />
            <div className="cdl-hero__image-shade" />
            <div className="cdl-hero__note">
              <span className="cdl-hero__note-mark">“</span>
              <p>Make room for ideas.<br />Make room for every voice.</p>
              <span className="cdl-hero__note-caption">A culture of thoughtful debate</span>
            </div>
            <div className="cdl-hero__stamp" aria-hidden="true">
              <Lightbulb />
              <span>Think<br />forward</span>
            </div>
          </div>
         
        </section>
          <a className="cdl-scroll-link" href="#about">
              <ArrowDown aria-hidden="true" />
              A little about us
            </a>
        <div className="cdl-values-strip" aria-label="Our values">
          <span>Think critically</span>
          <i />
          <span>Speak confidently</span>
          <i />
          <span>Listen deeply</span>
          <i />
          <span>Lead together</span>
        </div>

        <section className="cdl-mission cdl-section" id="mission" aria-labelledby="mission-title">
          <div className="cdl-section-heading">
            <p className="cdl-eyebrow">01 / Our mission</p>
            <h2 id="mission-title">A better conversation starts with <span>all of us.</span></h2>
          </div>
          <div className="cdl-mission__body">
            <p>
              The Cambodian Debate League is a youth-led nonprofit working to promote thoughtful,
              structured debate in Cambodia. We believe young people deserve the tools and the
              space to question ideas, hear one another, and speak up with confidence.
            </p>
            <a className="cdl-inline-link" href="#focus">
              What we stand for <ArrowRight aria-hidden="true" />
            </a>
          </div>
        </section>

        <section className="cdl-about cdl-section" id="about" aria-labelledby="about-title">
          <div className="cdl-about__image-wrap">
            <img
              src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1100&q=85"
              alt="A group of young people sharing ideas"
              loading="lazy"
            />
            <span className="cdl-about__image-label">Cambodian youth. Shared ideas. Brighter futures.</span>
          </div>
          <div className="cdl-about__copy">
            <p className="cdl-eyebrow">02 / About us</p>
            <h2 id="about-title">Made here.<br /><span>Led by youth.</span></h2>
            <p>
              CDL is the first Cambodia-based nonprofit and non-governmental organization led
              entirely by Cambodian youth. We are building a community where debate is more than
              winning an argument: it is a way to think clearly, understand others, and take part
              in shaping our shared future.
            </p>
            <a
              className="cdl-inline-link"
              href="https://www.instagram.com/cambodiandebateleague/"
              target="_blank"
              rel="noreferrer"
            >
              Follow our journey <ArrowUpRight aria-hidden="true" />
            </a>
          </div>
        </section>

        <section className="cdl-focus cdl-section" id="focus" aria-labelledby="focus-title">
          <div className="cdl-section-heading cdl-section-heading--center">
            <p className="cdl-eyebrow">03 / What we do</p>
            <h2 id="focus-title">Skills for a world that needs <span>good listeners.</span></h2>
            <p className="cdl-section-heading__sub">
              Debate is the starting point. The confidence, curiosity, and connection last much longer.
            </p>
          </div>
          <div className="cdl-focus__grid">
            {focusAreas.map((area) => (
              <article className="cdl-focus-card" key={area.number}>
                <div className="cdl-focus-card__top">
                  <span>{area.number}</span>
                  <div className="cdl-focus-card__icon">{area.icon}</div>
                </div>
                <h3>{area.title}</h3>
                <p>{area.description}</p>
                <span className="cdl-focus-card__rule" />
              </article>
            ))}
          </div>
        </section>

        <section className="cdl-roadmap cdl-section" id="roadmap" aria-labelledby="roadmap-title">
          <div className="cdl-roadmap__heading">
            <p className="cdl-eyebrow">04 / The road ahead</p>
            <h2 id="roadmap-title">A movement grows<br />one voice at a time.</h2>
            <p>
              Our roadmap is a shared direction: open the door to debate, make space to practice,
              connect young people, and grow future leaders.
            </p>
          </div>
          <ol className="cdl-roadmap__steps">
            {roadmap.map((step) => (
              <li className="cdl-roadmap-step" key={step.number}>
                <span className="cdl-roadmap-step__number">{step.number}</span>
                <div>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="cdl-join" aria-labelledby="join-title">
          <div className="cdl-join__copy">
            <p className="cdl-eyebrow">Your voice belongs here</p>
            <h2 id="join-title">The next great idea could be yours.</h2>
            <p>Stay close to the conversation and see what young people can build together.</p>
          </div>
          <div className="cdl-join__actions">
            <Link className="cdl-button cdl-button--light" to="/register">
              Join the community <ArrowRight aria-hidden="true" />
            </Link>
            <a
              className="cdl-join__social"
              href="https://www.facebook.com/p/Cambodian-Debate-League-CDL-61552655401507/"
              target="_blank"
              rel="noreferrer"
            >
              Follow CDL on Facebook <ArrowUpRight aria-hidden="true" />
            </a>
          </div>
        </section>

        <footer className="cdl-footer">
          <a className="cdl-footer__brand" href="#cdl-hero-title">CDL<span>.</span></a>
          <p>Thoughtful debate. Stronger voices. Brighter futures.</p>
          <a href="https://www.instagram.com/cambodiandebateleague/" target="_blank" rel="noreferrer">
            Instagram <ArrowUpRight aria-hidden="true" />
          </a>
        </footer>
      </div>
    </div>
  );
}
