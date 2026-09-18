import React, { useState, useEffect, useCallback } from "react";
import "../style/page/DailyNews.css";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import {
  faLaughBeam,
  faLightbulb,
  faHandshake,
  faQuestionCircle,
  faBook,
  faBrain,
  faSyncAlt,
  faSeedling
} from "@fortawesome/free-solid-svg-icons";

import jokebanner from "../img/jokebanner.png";
import didyouknnowbanner from "../img/didyouknnowbanner.png";
import advicebanner from "../img/advicebanner.png";
import questionbanner from "../img/questionbanner.png";

/* =========================
   GENERIC CARD
========================= */

const BaseFlipCard = ({
  isFlipped,
  onFlip,
  front,
  back,
  frontClass = "",
}) => {
  return (
    <div
      className={`flip-card ${isFlipped ? "flipped" : ""}`}
      onClick={onFlip}
    >
      <div className="flip-card-inner">

        <div className={`flip-card-front ${frontClass}`}>
          {front}
        </div>

        <div className="flip-card-back">
          <div className="card-scroll-content">
            {back}
          </div>
        </div>

      </div>
    </div>
  );
};

/* =========================
   MAIN COMPONENT
========================= */

export default function DailyNews() {

  const [cardsData, setCardsData] = useState({});
  const [flipped, setFlipped] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  /* =========================
     BACKGROUNDS
  ========================= */

  const bgImages = {
    joke:
      jokebanner,

    didyouknow:
      didyouknnowbanner,

    advice:
      advicebanner,

    question:
      questionbanner,
  };

  /* =========================
     API FETCHERS
  ========================= */

  const fetchJoke = async () => {
    try {

      const res = await fetch(
        "https://v2.jokeapi.dev/joke/Any?blacklistFlags=nsfw,racist,sexist,explicit&type=twopart"
      );

      const data = await res.json();

      return {
        setup: data.setup,
        delivery: data.delivery,
      };

    } catch {

      return {
        setup: "Why do programmers prefer dark mode?",
        delivery: "Because light attracts bugs!",
      };

    }
  };

  const fetchFact = async () => {
    try {

      const res = await fetch(
        "https://uselessfacts.jsph.pl/api/v2/facts/random?language=en"
      );

      const data = await res.json();

      return data.text;

    } catch {

      return "A group of flamingos is called a flamboyance.";

    }
  };

  const fetchAdvice = async () => {
    try {

      const res = await fetch("https://api.adviceslip.com/advice");

      const data = await res.json();

      return data.slip.advice;

    } catch {

      return "Focus on consistency instead of motivation.";

    }
  };

  const fetchQuestion = async () => {
    try {

      const res = await fetch(
        "https://opentdb.com/api.php?amount=1"
      );

      const data = await res.json();

      const q = data.results[0];

      const correct = decodeURIComponent(q.correct_answer);

      const options = [
        ...q.incorrect_answers.map(a => decodeURIComponent(a)),
        correct,
      ];

      options.sort(() => Math.random() - 0.5);

      return {
        question: decodeURIComponent(q.question),
        options,
        correctAnswer: correct,
      };

    } catch {

      return {
        question: "What is the largest planet in our solar system?",
        options: ["Mars", "Earth", "Jupiter", "Saturn"],
        correctAnswer: "Jupiter",
      };

    }
  };

  const fetchWikipedia = async () => {
    try {

      const res = await fetch(
        "https://en.wikipedia.org/api/rest_v1/page/random/summary"
      );

      const data = await res.json();

      return {
        title: data.title,
        extract: data.extract,
        thumbnail: data.thumbnail?.source || null,
      };

    } catch {

      return {
        title: "Wikipedia",
        extract:
          "Wikipedia is the free encyclopedia anyone can edit.",
        thumbnail: null,
      };

    }
  };

  /* =========================
     CARD CONFIG
  ========================= */

  const categories = [
    {
      id: "wiki",
      title: "Knowledge",
      icon: faBrain,
      fetcher: fetchWikipedia,
    },
    {
      id: "didyouknow",
      title: "",
      icon: faLightbulb,
      fetcher: fetchFact,
      bg: bgImages.didyouknow,
    },

    {
      id: "advice",
      title: "",
      icon: faSeedling,
      fetcher: fetchAdvice,
      bg: bgImages.advice,
    },
    {
      id: "joke",
      title: "Joke",
      icon: faLaughBeam,
      fetcher: fetchJoke,
      bg: bgImages.joke,
    },
    {
      id: "question",
      title: "Question",
      icon: faQuestionCircle,
      fetcher: fetchQuestion,
      bg: bgImages.question,
    },
    
    

    
  ];

  /* =========================
     FETCH ALL
  ========================= */

  const fetchAllData = useCallback(async () => {

    setIsLoading(true);
    setError("");

    try {

      const results = await Promise.all(
        categories.map(async cat => ({
          id: cat.id,
          data: await cat.fetcher(),
        }))
      );

      const mapped = {};

      results.forEach(item => {
        mapped[item.id] = item.data;
      });

      setCardsData(mapped);

      const reset = {};

      categories.forEach(cat => {
        reset[cat.id] = false;
      });

      setFlipped(reset);

    } catch (err) {

      console.error(err);

      setError("Failed to load content.");

    } finally {

      setIsLoading(false);

    }

  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const toggleFlip = (id) => {
    setFlipped(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  /* =========================
     RENDER CARDS
  ========================= */

  const cards = categories.map(cat => {

    const data = cardsData[cat.id];

    /* QUESTION */

    if (cat.id === "question" && data) {

      return (
        <BaseFlipCard
          key={cat.id}
          isFlipped={flipped[cat.id]}
          onFlip={() => toggleFlip(cat.id)}
          frontClass="card-with-bg question-front"
          front={
            <>
              <div
                className="card-overlay"
                style={{ backgroundImage: `url(${cat.bg})` }}
              />

                <div className='top-card-daily'>
                    <FontAwesomeIcon
                    className="card-icons"
                    icon={cat.icon}
                  />
               
                </div>
             
              <span className='front-senten'>
            {data.question}
              </span>
                
            


            </>
          }
          back={
            <div className="card-content">
        
              {data.correctAnswer} 
            </div>
          }
        />
      );
    }

    /* JOKE */

    if (cat.id === "joke" && data) {

      return (
        <BaseFlipCard
          key={cat.id}
          isFlipped={flipped[cat.id]}
          onFlip={() => toggleFlip(cat.id)}
          frontClass="card-with-bg joke-front"
          front={
            <>
              <div
                className="card-overlay"
                style={{ backgroundImage: `url(${cat.bg})` }}
              />

                <div className='top-card-daily'>
                    <FontAwesomeIcon
                className="card-icons"
                icon={cat.icon}
              />

    
                </div>
                 <span className='front-senten'>
            {data.setup}
                 </span>
               

            </>
          }
          back={
            <div className="card-content">
              {data.delivery} 
            </div>
          }
        />
      );
    }

    /* WIKI */

    if (cat.id === "wiki" && data) {

      return (
        <BaseFlipCard
          key={cat.id}
          isFlipped={flipped[cat.id]}
          onFlip={() => toggleFlip(cat.id)}
          frontClass="wiki-front"
          front={
            <>
              <div
                className="wiki-bg"
                style={{
                  backgroundImage: `url(${data.thumbnail})`,
                }}
              />

             <div
                className="wiki-overlay"
                style={{ "--preview": `url(${data.thumbnail})` }}
              />


                <div className='top-card-daily'>
                     <FontAwesomeIcon
                  className="card-icons"
                  icon={cat.icon}
                />

                </div>
          

               

    

              
            </>
          }
          back={
            <div className="wiki-summary-content" onScroll={(e) => e.stopPropagation()}>
              {data.extract}
            </div>
          }
        />
      );
    }

    /* NORMAL */

    return (
      <BaseFlipCard
        key={cat.id}
        isFlipped={flipped[cat.id]}
        onFlip={() => toggleFlip(cat.id)}
        frontClass="card-with-bg"
        front={
          <>
            <div
              className="card-overlay"
              style={{
                backgroundImage: `url(${cat.bg})`,
              }}
            />
              <div className='top-card-daily'>
                <FontAwesomeIcon
              className="card-icons"
              icon={cat.icon}
              style={{zIndex:'100'}}
            />
            {cat.title}
              </div>
            
          </>
        }
        back={
          <div className="card-content">
            {data}
          </div>
        }
      />
    );
  });

  return (
    <div className="daily-container">

      <div className="daily-header">

        <div>
          <h2>Daily Inspiration</h2>

          <p className="header-sub">
            Your brain deserves premium content
          </p>
        </div>

        <button
          className="refresh-button"
          onClick={fetchAllData}
          disabled={isLoading}
        >
          <FontAwesomeIcon icon={faSyncAlt} />

          {isLoading ? "Refreshing..." : "Get new"}
        </button>

      </div>



      <div className="story-cards-wrapper">
        <div className="story-cards">
          {cards}
        </div>
      </div>
          {error && (
        <div className="error-message">
          {error}
        </div>
      )}
    </div>
  );
}