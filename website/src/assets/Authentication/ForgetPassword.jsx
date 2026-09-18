import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";

import "react-toastify/dist/ReactToastify.css";

const API_URL = import.meta.env.VITE_SERVER_URL; 

import "../style/Authentication/SignPage.css";
export const ForgetPassword = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const isValid = email.trim() !== "";

  const handleSubmit = async () => {
    if (!isValid) return;

    if (loading) return;
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/forget-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();

      if (res.ok) {
       res.status === 200 && toast.success(data.message);
       localStorage.setItem("resetEmail", email);
          navigate("/verifyemailforgetpassword");
      } else {
        switch (res.status) {
                  case 401:
                    toast.warning(data.message);
                    break;
                  case 404:
                    toast.warning(data.message);
                    break;
                  case 409:
                    toast.warning(data.message);
                    break;
                  case 429:
                    toast.warning(data.message);
                    break;
                  default:
                    toast.warning("Something went wrong");
          }
      }

    } catch (err) {
      console.error(err);
      toast.error("Server error");
    }
    setLoading(false);
  };

    return (
      <div className="container-form">

        <div className='toast-feedback'>
        <ToastContainer position="top-right" autoClose={2000} />
        </div>
          <div className="p-page-div">
          <p className="p-page">nahidea</p>
          <p className="p2-page">
           Share content, questions and connect with others 
          </p>
          <p className="p2-page">
            on Nahidea's community
          </p>
      </div>


        <form onSubmit={(e) => { e.preventDefault();  handleSubmit(); }} >        
          <div className="form-center">
           <p className="p-page" style={{fontSize:"x-large", fontWeight:"bold"}}>
                Reset Password
              </p>
              <br />
          <div className='container-input'>
            <div className="div-input">
              <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="input-auth"
              title='Enter your email'
            />
            </div>
            <div className="div-input div-submit">
              <button
            type="submit"
            disabled={!isValid || loading}
            style={{
              opacity: !isValid || loading ? 0.5 : 1,
              cursor: !isValid || loading ? "not-allowed" : "pointer",
            }}
            title='Send PIN'
          >
            {loading ? "Sending..." : "Send PIN"}
          </button>
            </div>
          
          </div>
        </div>
        </form>
   
      </div>
  
  );
};