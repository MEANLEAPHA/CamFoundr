import React from "react";
import "../style/component/BannedModal.css";
import { ExclamationCircleFilled } from "@ant-design/icons";

export default function BannedModal({ reason, bannedAt }) {
  const formattedDate = bannedAt
    ? new Date(bannedAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "";

  return (
    <div className="banned-overlay" role="dialog" aria-modal="true">
      <div className="banned-modal">
        <ExclamationCircleFilled style={{color: 'red', fontSize: 'xx-large'}}/>
        <br />
        <h2>Your account has been restricted</h2>
        <p className="banned-reason-label">Reason</p>
        <p className="banned-reason">{reason || "Violation of community guidelines"}</p>
        {bannedAt && <p className="banned-date">Restricted on {formattedDate}</p>}
        <p className="banned-note">
          If you believe this is a mistake, please contact support through the feedback form.
        </p>
      </div>
    </div>
  );
}