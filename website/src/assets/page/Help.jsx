import React, { useState, useEffect, useRef, memo } from 'react';
import "../style/page/Help.css";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBolt,
  faTable,
  faLayerGroup,
  faPenRuler,
  faThLarge,
  faUser,
} from "@fortawesome/free-solid-svg-icons";

const cardsData = [
  {
    id: 1,
    title: "Zaps",
    description:
      "Create workflows that connect your apps to automate repetitive tasks.",
    icon: faBolt,
  },
  {
    id: 2,
    title: "Tables",
    description:
      "Power your Zaps via a no-code data storage solution.",
    icon: faTable,
  },
  {
    id: 3,
    title: "Interfaces",
    description:
      "Create custom web pages and apps with interactive components.",
    icon: faLayerGroup,
  },
  {
    id: 4,
    title: "Canvas",
    description:
      "AI-powered diagramming tool to visualize ideas and processes.",
    icon: faPenRuler,
  },
  {
    id: 5,
    title: "Apps",
    description:
      "Connect with over 6000 apps available on Zapier.",
    icon: faThLarge,
  },
  {
    id: 6,
    title: "Your Zapier account",
    description:
      "Manage your profile, billing, notifications, and plans.",
    icon: faUser,
  },
];

const Card = ({ title, description, icon }) => {
  return (
    <div className="card">
      <div className="card-icon">
        <FontAwesomeIcon icon={icon} />
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
      <span className="link">Explore articles →</span>
    </div>
  );
};

export default function Help() {
  const [search, setSearch] = useState("");

  const filteredCards = cardsData.filter((card) => {
    const text = (card.title + card.description).toLowerCase();
    return text.includes(search.toLowerCase());
  });

  return (
    <div className="app">
      {/* HERO */}
      <div className="hero">
        <h1>How can we help?</h1>

        <div className="search-box-help">
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button>Search</button>
        </div>
      </div>

      {/* CARDS */}
      <div className="grid">
        {filteredCards.length > 0 ? (
          filteredCards.map((card) => (
            <Card
              key={card.id}
              title={card.title}
              description={card.description}
              icon={card.icon}
            />
          ))
        ) : (
          <p className="no-result">No results found</p>
        )}
      </div>
    </div>
  );
}