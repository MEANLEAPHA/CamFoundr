import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_SERVER_URL; 
import "../style/Authentication/SignPage.css";


export const VerifyEmailForgetPassword = () => {
  const navigate = useNavigate();
  const email = localStorage.getItem("resetEmail");

  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (!email) navigate("/forgetpassword", { replace: true });
  }, [email, navigate]);

  if (!email) return null;

  const handleSubmit = async () => {
    if (pin.length !== 6) {
      toast.warning("Please enter the 6-digit PIN");
      return;
    }

    if (loading) return;
    setLoading(true);

    try {
      const res = await fetch(
        `${API_URL}/api/verify-forget-password-pin`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim(),
            pin,
          }),
        }
      );

      const data = await res.json();

      if (res.ok) {
        toast.success("PIN verified successfully");

          navigate("/newpassword");
   

      } else {
        switch (res.status) {
          case 400:
            toast.warning(data.message);
            break;
          case 404:
            toast.warning(data.message);
            break;
          case 421:
            toast.warning(data.message);
            break;
          case 422:
            toast.warning(data.message);
            break;
          case 429:
            toast.warning(data.message);
            break;
          default:
            toast.warning("Something went wrong");
            break;
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Server error. Please try again later.");
    };
    setLoading(false);
  };

  const handleResendPin = async () => {
    if (cooldown > 0) return;
    if(loading) return;
    setLoading(true);
    try {
      const res = await fetch(
        `${API_URL}/api/resend-forget-password-pin`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim(),
          }),
        }
      );

      const data = await res.json();

      if (res.ok) {

        res.status === 200 && toast.success(data.message);

        setCooldown(60);
        const interval = setInterval(() => {
          setCooldown((prev) => {
            if (prev <= 1) {
              clearInterval(interval);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);

      } else {
        switch (res.status) {
          case 400:
            toast.warning(data.message);
            break;
          case 404:
            toast.warning(data.message);
            break;
          case 429:
            toast.warning(data.message);
            break;
          default:
            toast.warning("Something went wrong");
        }
      };
    } catch (err) {
      console.error(err);
      toast.error("Server error. Please try again later.");
    };
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

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        
        <div className="form-center">
           <p className="p-page" style={{fontSize:"x-large", fontWeight:"bold"}}>
               Verify your email
              </p>
              <div className='container-input'>
                <div className="div-input">
                     <input
                      type="text"
                      value={pin}
                      maxLength={6}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "");
                        setPin(value);
                      }}
                        className="input-auth"
                        title='Enter your 6-digit PIN'
                    />
                </div>
                <div className="div-input div-submit">
                       <button disabled={pin.length !== 6 || loading} type="submit" title="Verify" style={{cursor: 'pointer'}}>
                    {loading ? "Verifying..." : "Verify"}
                  </button>
                  <p
                    onClick={handleResendPin}
                    disabled={cooldown > 0}
                     style={{background:"none", color:"black", cursor:"pointer", fontSize:"small"}}
                     title = "Resend PIN"
                  >
                    {cooldown > 0
                      ? `Resend in ${cooldown}s`
                      : "Resend PIN"}
                  </p>
                </div>
              </div>
         
        </div>
      </form>
    </div>
  );
};