import React, { useState } from "react";
import { Menu } from "antd";
import {
  SafetyOutlined,
  MessageOutlined,
  BulbOutlined,
  WarningOutlined,
  GlobalOutlined,
  SmileFilled,
  HeartOutlined,
  SoundFilled
} from "@ant-design/icons";


export default function Rule({ setRule }) {
  const [current, setCurrent] = useState("1");

  const onClick = (e) => {
    setCurrent(e.key);
  };

  const getItems = () => {
    switch(setRule) {
      case "content":
        return contentItems;
      case "confession":
        return confessionItems;
      case "question":
        return questionItems;
      case "question Comment":
        return questionCommentItems;
      case "content Comment":
        return contentCommentItems;
      case "confession Comment":
        return confessionCommentItems;
      default:
        return questionItems;
    }
  };

  return (
    <>
      <p className="rule-title">{setRule.slice(0, 1).toUpperCase() + setRule.slice(1)} Rule</p>
      <Menu
        onClick={onClick}
        style={{ width: "100%" }}
        defaultOpenKeys={["sub2"]}
        selectedKeys={[current]}
        mode="inline"
        items={getItems()}
      />
      {
        setRule !== 'question Comment' && setRule !== 'content Comment' && setRule !== 'confession Comment' &&
        <div className='rule-agree-div'>
        <p className="rule-agree"><SoundFilled /> By posting, you agree to help keep the platform safe, useful, and enjoyable for everyone. Happy Posting</p>
      </div>
      }
      
    </>
  );
}

const textStyle = {
  whiteSpace: "normal",
  wordBreak: "break-word",
  lineHeight: "1.6",
};

const questionItems = [
  {
    key: "sub1",
    label: "Respect Others",
    icon: <HeartOutlined />,
    children: [
      {
        key: "1",
        label: (
          <span style={textStyle}>
            Disagreement is fine. Harassment, hate speech, threats, or personal attacks are not.
          </span>
        ),
        disabled: true,
      },
      {
        key: "2",
        label: (
          <span style={textStyle}>
            Debate the idea, not the person. Keep it civil even when it gets heated.
          </span>
        ),
        disabled: true,
      },
    ],
  },

  {
    key: "sub2",
    label: "Ask Clear & Helpful Questions",
    icon: <MessageOutlined />,
    children: [
      {
        key: "3",
        label: (
          <span style={textStyle}>
            Write a title that says what you're actually asking — skip "Help" or "Urgent".
          </span>
        ),
        disabled: true,
      },
      {
        key: "4",
        label: (
          <span style={textStyle}>
            Add enough context so people can actually answer you, and keep it on-topic.
          </span>
        ),
        disabled: true,
      },
      {
        key: "5",
        label: (
          <span style={textStyle}>
            Low-effort, misleading, or spammy posts may be removed.
          </span>
        ),
        disabled: true,
      },
    ],
  },

  {
    key: "sub3",
    label: "Share Honest Information",
    icon: <BulbOutlined />,
    children: [
      {
        key: "6",
        label: (
          <span style={textStyle}>
            Don't spread false information, scams, or manipulated content on purpose.
          </span>
        ),
        disabled: true,
      },
      {
        key: "7",
        label: (
          <span style={textStyle}>
            Not sure about something? Ask, don't assert it as fact. Sources help for serious topics.
          </span>
        ),
        disabled: true,
      },
    ],
  },

  {
    key: "sub4",
    label: "Protect Privacy & Safety",
    icon: <SafetyOutlined />,
    children: [
      {
        key: "8",
        label: (
          <span style={textStyle}>
            Don't share private or confidential info — yours or anyone else's.
          </span>
        ),
        disabled: true,
      },
      {
        key: "9",
        label: (
          <span style={textStyle}>
            No promoting illegal or dangerous activity. Report bad content instead of engaging it.
          </span>
        ),
        disabled: true,
      },
    ],
  },

  {
    key: "sub5",
    label: "Keep the Community Useful",
    icon: <GlobalOutlined />,
    children: [
      {
        key: "10",
        label: (
          <span style={textStyle}>
            Skip the self-promo spam. Help others learn, solve problems, or have a good discussion.
          </span>
        ),
        disabled: true,
      },
      {
        key: "11",
        label: (
          <span style={textStyle}>
            Serious or repeated violations may lead to content removal.
          </span>
        ),
        disabled: true,
      },
    ],
  },
];

const confessionItems = [
  {
    key: "sub1",
    label: "Stay Respectful",
    icon: <HeartOutlined />,
    children: [
      {
        key: "1",
        label: (
          <span style={textStyle}>
            Confessions aren't a tool to attack, shame, or expose someone.
          </span>
        ),
        disabled: true,
      },
      {
        key: "2",
        label: (
          <span style={textStyle}>
            Strong feelings are welcome. Hate speech, threats, and targeted hostility aren't.
          </span>
        ),
        disabled: true,
      },
    ],
  },

  {
    key: "sub2",
    label: "Protect Privacy",
    icon: <SafetyOutlined />,
    children: [
      {
        key: "3",
        label: (
          <span style={textStyle}>
            No full names, phone numbers, addresses, school info, or private photos — yours or theirs.
          </span>
        ),
        disabled: true,
      },
      {
        key: "4",
        label: (
          <span style={textStyle}>
            Don't identify or expose someone without their consent.
          </span>
        ),
        disabled: true,
      },
      {
        key: "5",
        label: (
          <span style={textStyle}>
            Anonymity is for honest expression — not revenge or public callouts.
          </span>
        ),
        disabled: true,
      },
    ],
  },

  {
    key: "sub3",
    label: "Keep It Genuine",
    icon: <BulbOutlined />,
    children: [
      {
        key: "6",
        label: (
          <span style={textStyle}>
            Share what's real — not fabricated stories written to provoke a reaction.
          </span>
        ),
        disabled: true,
      },
      {
        key: "7",
        label: (
          <span style={textStyle}>
            Sensitive topics are okay. Content that encourages harm or dangerous behavior isn't.
          </span>
        ),
        disabled: true,
      },
    ],
  },

  {
    key: "sub4",
    label: "Keep the Space Safe",
    icon: <GlobalOutlined />,
    children: [
      {
        key: "8",
        label: (
          <span style={textStyle}>
            This is a space for support and honest expression — not conflict escalation.
          </span>
        ),
        disabled: true,
      },
      {
        key: "9",
        label: (
          <span style={textStyle}>
            Illegal activity or exploitative content will be removed. Repeat violations may restrict your account.
          </span>
        ),
        disabled: true,
      },
    ],
  },
];

const contentItems = [
  {
    key: "sub1",
    label: "Create Meaningful Content",
    icon: <BulbOutlined />,
    children: [
      {
        key: "1",
        label: (
          <span style={textStyle}>
            Share something helpful, creative, or genuinely worth someone's time.
          </span>
        ),
        disabled: true,
      },
      {
        key: "2",
        label: (
          <span style={textStyle}>
            Skip the spam and engagement bait. Use a clear title or caption.
          </span>
        ),
        disabled: true,
      },
    ],
  },

  {
    key: "sub2",
    label: "Respect the Community",
    icon: <SafetyOutlined />,
    children: [
      {
        key: "3",
        label: (
          <span style={textStyle}>
            No hate speech, harassment, or content designed to harm others.
          </span>
        ),
        disabled: true,
      },
      {
        key: "4",
        label: (
          <span style={textStyle}>
            Critique the work, not the person. Respect different opinions and backgrounds.
          </span>
        ),
        disabled: true,
      },
    ],
  },

  {
    key: "sub3",
    label: "Share Honest & Original Content",
    icon: <MessageOutlined />,
    children: [
      {
        key: "5",
        label: (
          <span style={textStyle}>
            Don't spread misinformation, impersonation, or manipulated content meant to deceive.
          </span>
        ),
        disabled: true,
      },
      {
        key: "6",
        label: (
          <span style={textStyle}>
            Credit others' work when you share it, and avoid reposting the same thing repeatedly.
          </span>
        ),
        disabled: true,
      },
    ],
  },

  {
    key: "sub4",
    label: "Protect Privacy & Safety",
    icon: <WarningOutlined />,
    children: [
      {
        key: "7",
        label: (
          <span style={textStyle}>
            Don't share private or confidential info — yours or anyone else's.
          </span>
        ),
        disabled: true,
      },
      {
        key: "8",
        label: (
          <span style={textStyle}>
            Illegal, dangerous, or exploitative content may be removed. Report what you see.
          </span>
        ),
        disabled: true,
      },
    ],
  },

  {
    key: "sub5",
    label: "Help Build a Better Platform",
    icon: <GlobalOutlined />,
    children: [
      {
        key: "9",
        label: (
          <span style={textStyle}>
            Encourage real discussion and creativity over manipulative posting.
          </span>
        ),
        disabled: true,
      },
      {
        key: "10",
        label: (
          <span style={textStyle}>
            Serious violations may result in content removal to keep quality high.
          </span>
        ),
        disabled: true,
      },
    ],
  },
];

const questionCommentItems = [
  {
    key: "sub1",
    label: "Be Helpful & Relevant",
    icon: <MessageOutlined />,
    children: [
      {
        key: "1",
        label: (
          <span style={textStyle}>
            Answer the actual question. Stay on topic — skip the tangents.
          </span>
        ),
        disabled: true,
      },
    ],
  },
  {
    key: "sub2",
    label: "Explain Your Reasoning",
    icon: <BulbOutlined />,
    children: [
      {
        key: "2",
        label: (
          <span style={textStyle}>
            Back up your answer with reasoning or a source. One-word replies don't help anyone.
          </span>
        ),
        disabled: true,
      },
    ],
  },
  {
    key: "sub3",
    label: "Respectful Discussion",
    icon: <HeartOutlined />,
    children: [
      {
        key: "3",
        label: (
          <span style={textStyle}>
            Disagree by explaining your view — not by attacking or dismissing the person.
          </span>
        ),
        disabled: true,
      },
    ],
  },
  {
    key: "sub4",
    label: "Keep It Clean",
    icon: <SafetyOutlined />,
    children: [
      {
        key: "4",
        label: (
          <span style={textStyle}>
            No spam or unrelated self-promo. Flag harmful comments instead of engaging them.
          </span>
        ),
        disabled: true,
      },
    ],
  },
];

const contentCommentItems = [
  {
    key: "sub1",
    label: "Engage Meaningfully",
    icon: <MessageOutlined />,
    children: [
      {
        key: "1",
        label: (
          <span style={textStyle}>
            Say something real about the content — "Nice" or "Cool" doesn't add much.
          </span>
        ),
        disabled: true,
      },
    ],
  },
  {
    key: "sub2",
    label: "Constructive Feedback",
    icon: <BulbOutlined />,
    children: [
      {
        key: "2",
        label: (
          <span style={textStyle}>
            If something's not working, say why and what could improve it — not just that it's bad.
          </span>
        ),
        disabled: true,
      },
    ],
  },
  {
    key: "sub3",
    label: "Respect the Creator",
    icon: <HeartOutlined />,
    children: [
      {
        key: "3",
        label: (
          <span style={textStyle}>
            No harassment or personal attacks. A little encouragement goes a long way.
          </span>
        ),
        disabled: true,
      },
    ],
  },
  {
    key: "sub4",
    label: "Stay Safe & Appropriate",
    icon: <SafetyOutlined />,
    children: [
      {
        key: "4",
        label: (
          <span style={textStyle}>
            No spam or irrelevant links. Flag anything that doesn't belong here.
          </span>
        ),
        disabled: true,
      },
    ],
  },
];

const confessionCommentItems = [
  {
    key: "sub1",
    label: "Respond with Empathy",
    icon: <HeartOutlined />,
    children: [
      {
        key: "1",
        label: (
          <span style={textStyle}>
            Lead with kindness. Save the judgment — this isn't the place for it.
          </span>
        ),
        disabled: true,
      },
    ],
  },
  {
    key: "sub2",
    label: "Share Thoughtful Perspectives",
    icon: <BulbOutlined />,
    children: [
      {
        key: "2",
        label: (
          <span style={textStyle}>
            Different viewpoints are welcome — unsolicited advice usually isn't.
          </span>
        ),
        disabled: true,
      },
    ],
  },
  {
    key: "sub3",
    label: "Protect Anonymity",
    icon: <SafetyOutlined />,
    children: [
      {
        key: "3",
        label: (
          <span style={textStyle}>
            Never try to identify or expose who's behind a confession.
          </span>
        ),
        disabled: true,
      },
    ],
  },
  {
    key: "sub4",
    label: "Keep the Space Safe",
    icon: <GlobalOutlined />,
    children: [
      {
        key: "4",
        label: (
          <span style={textStyle}>
            No mockery or hostility toward confessions. Report serious issues instead of piling on.
          </span>
        ),
        disabled: true,
      },
    ],
  },
];