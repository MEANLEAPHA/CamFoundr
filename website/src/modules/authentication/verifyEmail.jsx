import React, { useRef, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
const API_URL = import.meta.env.VITE_SERVER_URL; 
import "./signPage.css";

export const VerifyEmail = () => {
  const [pin, setPin] = useState(Array(6).fill(""));
  const pinInputRefs = useRef([]);
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const navigate = useNavigate();

  const email = localStorage.getItem("verifyEmail");

  const updatePin = (index, value) => {
    const digits = value.replace(/\D/g, "");
    if (!digits) {
      setPin((currentPin) =>
        currentPin.map((digit, digitIndex) => digitIndex === index ? "" : digit)
      );
      return;
    }

    const enteredDigits = digits.slice(0, 6 - index).split("");
    setPin((currentPin) => {
      const nextPin = [...currentPin];
      enteredDigits.forEach((digit, digitIndex) => {
        nextPin[index + digitIndex] = digit;
      });
      return nextPin;
    });

    const nextIndex = Math.min(index + enteredDigits.length, 5);
    pinInputRefs.current[nextIndex]?.focus();
    pinInputRefs.current[nextIndex]?.select();
  };

  const handlePinKeyDown = (event, index) => {
    if (event.key === "Backspace" && !pin[index] && index > 0) {
      pinInputRefs.current[index - 1]?.focus();
    } else if (event.key === "ArrowLeft" && index > 0) {
      event.preventDefault();
      pinInputRefs.current[index - 1]?.focus();
    } else if (event.key === "ArrowRight" && index < 5) {
      event.preventDefault();
      pinInputRefs.current[index + 1]?.focus();
    }
  };

  const handlePinPaste = (event, index) => {
    event.preventDefault();
    updatePin(index, event.clipboardData.getData("text"));
  };

  const handleSubmit = async () => {
    if (!email){
       navigate("/verifyemail");
       return;
    };
    const verificationCode = pin.join("");
    if (verificationCode.length !== 6) {
      toast.warning("Enter 6-digit PIN");
      return;
    }

    if (loading) return;
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/verify-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ pin: verificationCode, email }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Email verified!");

   
          navigate("/setupaccount", {state :{ Email: data.email, UserId: data.userId, Username: data.username }});
          localStorage.removeItem("verifyEmail");
     
      } else {
        switch (res.status) {
          case 400:
            toast.warning(data.message);
            break;
          case 401:
            toast.warning(data.message);
            break;
          case 402:
            toast.warning(data.message);
            break;
          case 403:
            toast.warning(data.message);
            break;
          case 405:
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

  const handleResendPin = async () => {
    if (!email){
       navigate("/verifyemail");
       return;
    };
    if (cooldown > 0) return;

    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/resend-verify-email-pin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
       
        res.status === 200 && toast.success(data.message);
        // ⏱ cooldown 1min
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
          case 401:
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

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        <div className="form-center">
          <p className="p-page" style={{fontSize:"large", fontWeight:"bold", margin:0}}>
               Verify your email
              </p>

        <div className='container-input'>
           <p className="verification-code-help">Enter the 6-digit code sent to your email.</p>
           <div className="verification-code-inputs" role="group" aria-label="6-digit verification code">
              {pin.map((digit, index) => (
                <input
                  key={index}
                  ref={(element) => { pinInputRefs.current[index] = element; }}
                  type="text"
                  inputMode="numeric"
                  autoComplete={index === 0 ? "one-time-code" : "off"}
                  value={digit}
                  maxLength={6}
                  title={`Verification code digit ${index + 1}`}
                  aria-label={`Digit ${index + 1} of 6`}
                  onChange={(event) => updatePin(index, event.target.value)}
                  onKeyDown={(event) => handlePinKeyDown(event, index)}
                  onPaste={(event) => handlePinPaste(event, index)}
                  className="verification-code-input"
                />
              ))}
           </div>
         
        <div className="div-input div-submit">
              <button disabled={pin.some((digit) => !digit) || loading} type="submit" title="Verify" style={{cursor: pin.some((digit) => !digit) || loading ? "not-allowed" : "pointer"}}>
            {loading ? "Verifying..." : "Verify"}
          </button>

            <button
              type='button'
              onClick={handleResendPin}
              disabled={cooldown > 0}
              title='click to resend pin'
              style={{background:"none", color:"grey", cursor:"pointer", fontSize:"small", boxShadow:"none", fontWeight:400, padding: 0, margin: 0}}
            >
              {cooldown > 0
                ? `Resend in ${cooldown}s`
                : "Resend PIN"}
            </button>
          </div>
        </div>
        </div>
      </form>
    </div>
  );
};