import React from "react";
import { useNavigate } from "react-router-dom";
import "../style/components/AuthRequiredModal.css";
import nahideaIcon from '../img/nahideaIcon.png';

export default function AuthRequiredModal() {
  const navigate = useNavigate();

  return (
    <div className="auth-required-overlay" role="dialog" aria-modal="true">
      <div className="auth-required-modal">
        <img src = {nahideaIcon} alt="Nahidea Icon" className="auth-required-icon"/>
        <p className="auth-required-message">Log in or Create a free account to keep using Nahidea :)</p>

        <div className="auth-required-actions">
          <button
            className="btn-auth-primary"
            onClick={() => navigate("/login")}
          >
            Sign in
          </button>
          <button
            className="btn-auth-secondary"
            onClick={() => navigate("/register")}
          >
            Create account
          </button>
        </div>
      </div>
    </div>
  );
}