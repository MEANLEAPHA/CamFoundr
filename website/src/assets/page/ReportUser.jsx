import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CloseOutlined, WarningOutlined, LoadingOutlined, FlagOutlined } from "@ant-design/icons";
import toast from "react-hot-toast";

import "../style/page/ReportComment.css";

import api from "../api/axiosInstance";
import { Spin } from "antd";

const STATE_KEY = "report_nav_state";
const MIN_REASON_LENGTH = 10;
const MAX_REASON_LENGTH = 500;

const REPORT_GROUPS = [
  {
    id: "content",
    label: "Content issues",
    tone: "neutral",
    options: [
      { value: "spam", label: "Spam" },
      { value: "scam", label: "Scam" },
      { value: "misinformation", label: "Misinformation" },
      { value: "other", label: "Other" },
    ],
  },
  {
    id: "community",
    label: "Community harm",
    tone: "neutral",
    options: [
      { value: "harassment", label: "Harassment" },
      { value: "bullying", label: "Bullying" },
      { value: "hate_speech", label: "Hate speech" },
    ],
  },
  {
    id: "safety",
    label: "Urgent safety",
    tone: "danger",
    options: [
      { value: "violence", label: "Violence" },
      { value: "self_harm", label: "Self harm" },
      { value: "child_safety", label: "Child safety" },
      { value: "terrorism", label: "Terrorism" },
      { value: "nudity", label: "Nudity" },
    ],
  },
];

const ALL_OPTIONS = REPORT_GROUPS.flatMap((g) => g.options);
const codeFor = (value) => {
  const index = ALL_OPTIONS.findIndex((o) => o.value === value);
  return `R${String(index + 1).padStart(2, "0")}`;
};

const ReportUser = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [state] = useState(() => {
    if (location.state) {
      try {
        sessionStorage.setItem(STATE_KEY, JSON.stringify(location.state));
      } catch {
        // ignore storage errors
      }
      return location.state;
    }
    try {
      const saved = sessionStorage.getItem(STATE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const missingState = !state?.userId;

  const [type, setType] = useState("spam");
  const [reason, setReason] = useState("");
  const [touched, setTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const alreadyReportedKey = state?.userId ? `reported_user_${state.userId}` : null;
  const [alreadyReported, setAlreadyReported] = useState(false);

  useEffect(() => {
    if (missingState) {
      toast.error("We lost track of which comment you were reporting.");
      navigate(-1);
      return;
    }
    try {
      if (alreadyReportedKey && sessionStorage.getItem(alreadyReportedKey)) {
        setAlreadyReported(true);
      }
    } catch {
      // ignore
    }
  }, [missingState, alreadyReportedKey, navigate]);

  const selectedGroup = useMemo(
    () => REPORT_GROUPS.find((g) => g.options.some((o) => o.value === type)),
    [type]
  );

  const trimmedReason = reason.trim();
  const reasonTooShort = trimmedReason.length < MIN_REASON_LENGTH;
  const showReasonError = touched && reasonTooShort;

  const submit = async () => {
    if (missingState || submitting || alreadyReported) return;

    if (reasonTooShort) {
      setTouched(true);
      toast.error(`Add a bit more detail (at least ${MIN_REASON_LENGTH} characters).`);
      return;
    }

    setSubmitting(true);
    try {
      await api.post(`/api/reports/${state.userId}/user/${state.userId}`, {
        report_type: type,
        reason: trimmedReason,
      });

      toast.success("Report submitted. Thanks for flagging this.");
      try {
        if (alreadyReportedKey) sessionStorage.setItem(alreadyReportedKey, "1");
        sessionStorage.removeItem(STATE_KEY);
      } catch {
        // ignore
      }
      navigate(-1);
    } catch (err) {
      console.error("Report submission failed", err);
      const message =
        err.response?.status === 409
          ? "You've already reported this comment."
          : err.response?.data?.message || "Couldn't submit the report. Please try again.";
      toast.error(message);
      if (err.response?.status === 409) setAlreadyReported(true);
    } finally {
      setSubmitting(false);
    }
  };

  if (missingState) return null;

  return (
    <div className="report-page">
      <div className="report-card">
        <header className="report-header">
          <div className="report-eyebrow">
            <FlagOutlined /> File a report
          </div>
          <button
            type="button"
            className="report-close-btn"
            onClick={() => navigate(-1)}
            aria-label="Cancel report"
          >
            <CloseOutlined />
          </button>
        </header>

        <h1 className="report-title">What's wrong with this comment?</h1>
        {state?.commentPreview && (
          <p className="report-context">
            <span className="report-context-label">Reporting</span>
            <span className="report-context-quote">&ldquo;{state.commentPreview}&rdquo;</span>
          </p>
        )}

        {alreadyReported ? (
          <div className="report-done">
            <p style={{color: 'var(--font-color)'}}>You've already reported this user. Our team will review it.</p>
            <button type="button" className="report-submit-btn" onClick={() => navigate(-1)}>
              Close
            </button>
          </div>
        ) : (
          <>
            <fieldset className="report-fieldset">
              <legend className="sr-only">Select a reason</legend>
              {REPORT_GROUPS.map((group) => (
                <div className="report-group" key={group.id}>
                  <div className={`report-group-label ${group.tone === "danger" ? "danger" : ""}`}>
                    {group.tone === "danger" && <WarningOutlined />}
                    {group.label}
                  </div>
                  <div className="report-options-grid">
                    {group.options.map((opt) => {
                      const id = `report-type-${opt.value}`;
                      const isSelected = type === opt.value;
                      return (
                        <label
                          key={opt.value}
                          htmlFor={id}
                          className={`report-option ${group.tone === "danger" ? "danger" : ""} ${
                            isSelected ? "selected" : ""
                          }`}
                        >
                          <input
                            type="radio"
                            id={id}
                            name="report_type"
                            value={opt.value}
                            checked={isSelected}
                            onChange={(e) => setType(e.target.value)}
                          />
                          <span className="report-option-code">{codeFor(opt.value)}</span>
                          <span className="report-option-label">{opt.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </fieldset>

            <div className="report-reason-block">
              <div className="report-reason-header">
                <label htmlFor="report-reason">
                  Details
                  {selectedGroup?.tone === "danger" && (
                    <span className="report-reason-required"> — please be specific</span>
                  )}
                </label>
                <span className={`report-char-count ${showReasonError ? "error" : ""}`}>
                  {trimmedReason.length}/{MAX_REASON_LENGTH}
                </span>
              </div>
              <textarea
                id="report-reason"
                value={reason}
                maxLength={MAX_REASON_LENGTH}
                onChange={(e) => setReason(e.target.value)}
                onBlur={() => setTouched(true)}
                placeholder="What happened? Include anything that will help our team review this quickly."
                className={`report-textarea ${showReasonError ? "error" : ""}`}
                disabled={submitting}
              />
              {showReasonError && (
                <div className="report-field-error">
                  Add at least {MIN_REASON_LENGTH} characters so we can act on this.
                </div>
              )}
            </div>

            <div className="report-actions">
              <button
                type="button"
                className="report-cancel-btn"
                onClick={() => navigate(-1)}
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="report-submit-btn"
                onClick={submit}
                disabled={submitting || reasonTooShort}
                aria-busy={submitting}
              >
                {submitting ? <Spin  style={{color: 'var(--primary-color)'}}/> : "Submit report"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ReportUser;