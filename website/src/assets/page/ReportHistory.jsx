import React, { useEffect, useState } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";
import {
  MessageOutlined,
  FileTextOutlined,
  UserOutlined,
  CommentOutlined,
  QuestionCircleOutlined,
} from "@ant-design/icons";

import api from "../api/axiosInstance";
import "../style/page/ReportHistory.css";

import nahideaIcon from '../img/nahideaIcon.png';
const getTypeIcon = (type) => {
  switch (type) {
    case "comment":
      return <MessageOutlined />;
    case "post":
      return <FileTextOutlined />;
    case "user":
      return <UserOutlined />;
    case "conversation":
      return <CommentOutlined />;
    default:
      return <QuestionCircleOutlined />;
  }
};

// map report_type enum -> human readable label
const formatReportType = (reportType) => {
  if (!reportType) return "Other";
  return reportType
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
};

// map real status enum -> css class
const getStatusClass = (status) => {
  switch (status) {
    case "resolved":
      return "status-resolved";
    case "dismissed":
      return "status-dismissed";
    case "reviewing":
      return "status-reviewing";
    case "pending":
    default:
      return "status-pending";
  }
};

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
};

function ReportItem({ item }) {
  return (
    <div className="report-item">
      <div className="report-type">
        <div className="report-video-icon">
          <span className="material-symbols-outlined">
            {getTypeIcon(item.type)}
          </span>
        </div>

        <div className="report-type-text">
          <span>{item.type ? item.type : "Unknown"}</span>
        </div>
      </div>

      <div className="report-content">
        <img
          src={
            item.reported_avatar_url ||
            nahideaIcon
          }
          alt=""
          className="report-user-avatar"
        />
        <div className="report-title">
          {item.reported_username || "Unknown user"}
        </div>
      </div>

      <div className="report-reason">
        <div className="report-reason-title">
          {formatReportType(item.report_type)}
        </div>
        {item.reason && (
          <div className="report-reason-text">{item.reason}</div>
        )}
        <div className="report-date">{formatDate(item.created_at)}</div>
      </div>

      <div className={`report-status ${getStatusClass(item.status)}`}>
        {item.status}
      </div>
    </div>
  );
}

export default function ReportHistory() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await api.get("/api/get-all-report-by-user-id");
        setReports(res.data);
      } catch (err) {
        setError("Failed to load report history");
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  return (
    <div className="report-history-page">
      <div className="report-history-container">
        {/* TOP */}
        <div className="report-history-top">
          <div className="report-history-info">
            <div className="report-history-heading">
              Thanks for reporting
            </div>

            <div className="report-history-desc">
              Reports submitted by users are reviewed based on community
              guidelines. Content may be removed, restricted, or remain active
              depending on the review result.
            </div>

            <div className="report-history-note">
              Reporting does not guarantee automatic removal!
            </div>
          </div>

          <div className="report-history-illustration">
            <div className="report-blob">
              <FontAwesomeIcon icon={faTriangleExclamation} />
            </div>
          </div>
        </div>

        {/* TABLE HEADER */}
        <div className="report-table-header">
          <div>Type</div>
          <div>Reported user</div>
          <div>Reporting reason</div>
          <div>Status</div>
        </div>

        {/* DATA */}
        <div className="report-table-body">
          {loading && <div className="report-loading">Loading reports...</div>}
          {error && <div className="report-error">{error}</div>}
          {!loading && !error && reports.length === 0 && (
            <div className="report-empty" style={{ textAlign: "center", margin: "20px auto", color:'grey'}}>You haven't reported anything yet.</div>
          )}
          {!loading &&
            !error &&
            reports.map((item) => <ReportItem key={item.id} item={item} />)}
        </div>
      </div>
    </div>
  );
}