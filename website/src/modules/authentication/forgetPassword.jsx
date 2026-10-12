import React, { useState} from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";

import "react-toastify/dist/ReactToastify.css";
import {ArrowLeft} from "lucide-react";

const API_URL = import.meta.env.VITE_SERVER_URL; 

import "./signPage.css";
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

        <form onSubmit={(e) => { e.preventDefault();  handleSubmit(); }} > 

          
        
          <div className="form-center">
            <div style={{width: '100%', display:'flex', justifyContent: 'start'}}><button type="button" onClick={()=> navigate('/login')}><ArrowLeft /></button></div>
            
             <div className="top-title-div">
              <p className="top-title">CDL</p>
              <p className="sub-title">
                Be part of the movement building a better ss
              </p>
          </div>
          
          <div className='container-input'>
            <label className='label-required'>Email <span style={{color:'red'}}>*</span></label>
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