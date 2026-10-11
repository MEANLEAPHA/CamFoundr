import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  Bookmark,
  Clock3,
  Play,
  Sparkles,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import "./blog.css";

const stories = [
  {
    id: 1,
    slug: "building-before-you-feel-ready",
    title: "The quiet advantage of building before you feel ready",
    description:
      "The founders who create lasting companies are not always the loudest in the room. They are the ones who keep learning in public.",
    image:
      "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1400&q=85",
    author: "Maya Chen",
    date: "May 18, 2025",
    readTime: "7 min read",
    tags: ["Founder stories", "Leadership"],
    featured: true,
  },
  {
    id: 2,
    slug: "your-first-10-customers",
    title: "Your first 10 customers are a design system",
    description:
      "A practical field guide to listening closely, finding patterns, and turning early feedback into a product people remember.",
    image:
      "https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&w=900&q=85",
    author: "Jon Bell",
    date: "May 15, 2025",
    readTime: "5 min read",
    tags: ["Product", "Growth"],
    videoUrl: "https://www.youtube.com/watch?v=qp0HIF3SfI4",
  },
  {
    id: 3,
    slug: "brave-decisions-incomplete-data",
    title: "How to make a brave decision with incomplete data",
    description:
      "Uncertainty is not a missing spreadsheet. It is part of the job. Here is how experienced teams make the next call.",
    image:
      "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=900&q=85",
    author: "Ari Okafor",
    date: "May 12, 2025",
    readTime: "6 min read",
    tags: ["Leadership", "Mindset"],
  },
  {
    id: 4,
    slug: "creative-ritual-focused-team",
    title: "The creative ritual behind a focused team",
    description:
      "Small rituals create the space for ambitious work. Three teams share the habits that keep their best ideas moving.",
    image:
      "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=900&q=85",
    author: "CamFoundr editorial",
    date: "May 08, 2025",
    readTime: "4 min read",
    tags: ["Culture", "Product"],
  },
  {
    id: 5,
    slug: "sustainable-growth",
    title: "A useful way to think about sustainable growth",
    description:
      "Growth gets healthier when it is treated as a relationship, not a number. Start with the people already paying attention.",
    image:
      "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=900&q=85",
    author: "Leah Morgan",
    date: "May 04, 2025",
    readTime: "8 min read",
    tags: ["Growth", "Founder stories"],
  },
];

const tagOptions = [
  "All stories",
  "Founder stories",
  "Product",
  "Leadership",
  "Growth",
  "Culture",
  "Mindset",
];

export default function Blog() {
  return (
    <div className="blog-page">
      <header className="blog-intro">
        <div>
          <p className="blog-kicker">
            <Sparkles size={15} aria-hidden="true" /> CamFoundr ideas
          </p>
          <h1>
            Ideas worth
            <br />
            <em>passing on.</em>
          </h1>
        </div>

        <p className="blog-intro-copy">
          Conversations, lessons, and honest field notes for people building what
          comes next.
        </p>
      </header>

      <BlogStories />
    </div>
  );
}

function BlogStories() {
  const [selectedTag, setSelectedTag] = useState("All stories");
  const [savedStories, setSavedStories] = useState([]);

  const visibleStories = useMemo(() => {
    if (selectedTag === "All stories") {
      return stories;
    }

    return stories.filter((story) => story.tags.includes(selectedTag));
  }, [selectedTag]);

  const featuredStory = stories[0];
  const feedStories = visibleStories.filter((story) => story.id !== featuredStory.id);

  const toggleSaved = (storyId) => {
    setSavedStories((current) =>
      current.includes(storyId)
        ? current.filter((id) => id !== storyId)
        : [...current, storyId]
    );
  };

  return (
    <>
      <nav className="blog-filters" aria-label="Filter stories by topic">
        <span className="filter-label">Explore by</span>

        <div className="filter-options">
          {tagOptions.map((tag) => (
            <button
              key={tag}
              className={`filter-chip ${selectedTag === tag ? "is-active" : ""}`}
              type="button"
              onClick={() => setSelectedTag(tag)}
              aria-pressed={selectedTag === tag}
            >
              {tag}
            </button>
          ))}
        </div>
      </nav>

      {selectedTag === "All stories" && (
        <article className="featured-story">
          <div className="featured-image-wrap">
            <img src={featuredStory.image} alt="People collaborating around a table" />
            <span className="featured-label">Featured story</span>
          </div>

          <div className="featured-copy">
            <StoryTags tags={featuredStory.tags} />
            <h2>{featuredStory.title}</h2>
            <p>{featuredStory.description}</p>
            <StoryMeta story={featuredStory} />
            <StoryLink story={featuredStory} label="Read the story" />
          </div>
        </article>
      )}

      <div className="feed-heading">
        <div>
          <p className="section-eyebrow">The latest</p>
          <h2>
            {selectedTag === "All stories" ? "Fresh perspectives" : `${selectedTag} stories`}
          </h2>
        </div>

        <span className="story-count">{visibleStories.length} stories</span>
      </div>

      {feedStories.length > 0 ? (
        <div className="story-grid">
          {feedStories.map((story) => (
            <StoryCard
              key={story.id}
              story={story}
              isSaved={savedStories.includes(story.id)}
              onToggleSaved={() => toggleSaved(story.id)}
            />
          ))}
        </div>
      ) : (
        <p className="empty-stories">No stories in this topic yet. Try another filter.</p>
      )}
    </>
  );
}

function StoryCard({ story, isSaved, onToggleSaved }) {
  return (
    <article className="story-card">
      <div className="story-image-wrap">
        <img src={story.image} alt="" loading="lazy" />

        {story.videoUrl && (
          <span className="video-badge">
            <Play size={12} fill="currentColor" /> Watch talk
          </span>
        )}

        <button
          className={`save-button ${isSaved ? "is-saved" : ""}`}
          type="button"
          onClick={onToggleSaved}
          aria-label={
            isSaved ? `Remove ${story.title} from saved stories` : `Save ${story.title}`
          }
          aria-pressed={isSaved}
        >
          <Bookmark
            size={17}
            fill={isSaved ? "currentColor" : "none"}
            aria-hidden="true"
          />
        </button>
      </div>

      <div className="story-card-copy">
        <StoryTags tags={story.tags} />
        <h3>{story.title}</h3>
        <p>{story.description}</p>
        <StoryMeta story={story} />
        <StoryLink story={story} label="Read story" />
      </div>
    </article>
  );
}

function StoryLink({ story, label }) {
  const navigate = useNavigate();

  return (
    <button
      className="read-link"
      type="button"
      onClick={() => navigate(`/blog/${story.slug}`)}
    >
      {label}
      <ArrowUpRight size={17} aria-hidden="true" />
    </button>
  );
}

export function BlogDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const story = stories.find((item) => item.slug === slug);

  if (!story) {
    return (
      <div className="blog-page">
        <button className="back-link" type="button" onClick={() => navigate("/blog")}>
          <ArrowLeft size={17} /> Back to stories
        </button>
        <h1 className="missing-story">Story not found.</h1>
      </div>
    );
  }

  const embedUrl = getYoutubeEmbedUrl(story.videoUrl);

  return (
    <div className="blog-page blog-detail-page">
      <button className="back-link" type="button" onClick={() => navigate("/blog")}>
        <ArrowLeft size={17} aria-hidden="true" /> Back to all stories
      </button>

      <header className="detail-header">
        <StoryTags tags={story.tags} />
        <h1>{story.title}</h1>
        <p className="detail-description">{story.description}</p>
        <StoryMeta story={story} />
      </header>

      {embedUrl ? (
        <div className="video-frame">
          <iframe
            src={embedUrl}
            title={`Video for ${story.title}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      ) : (
        <img className="detail-hero-image" src={story.image} alt="" />
      )}

      <div className="detail-content">
        <p>
          There is a point in every building journey where the plan stops being
          enough. The next step asks for judgment, attention, and the willingness
          to learn in motion.
        </p>
        <p>
          {story.description} The useful work begins when an idea leaves the
          notebook and meets real people, real constraints, and real questions.
        </p>
        <h2>Make the next useful move</h2>
        <p>
          Progress rarely arrives as one dramatic leap. It is built through small
          decisions made with care, shared early, and improved by the people who
          use what you make.
        </p>
        <p>
          That is the invitation behind this story: stay curious, keep the
          feedback loop close, and let the work become clearer through practice.
        </p>
      </div>
    </div>
  );
}

function getYoutubeEmbedUrl(url) {
  if (!url) return null;

  const videoId =
    url.match(/[?&]v=([^&]+)/)?.[1] || url.match(/youtu\.be\/([^?]+)/)?.[1];

  return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
}

function StoryTags({ tags }) {
  return (
    <div className="story-tags">
      {tags.map((tag) => (
        <span key={tag}>{tag}</span>
      ))}
    </div>
  );
}

function StoryMeta({ story }) {
  return (
    <div className="story-meta">
      <span>{story.author}</span>
      <span className="meta-dot" aria-hidden="true">
        /
      </span>
      <span>{story.date}</span>
      <span className="meta-reading">
        <Clock3 size={14} aria-hidden="true" /> {story.readTime}
      </span>
    </div>
  );
}

