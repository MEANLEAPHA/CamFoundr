import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEyeSlash, faEye } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";

const API_URL = import.meta.env.VITE_SERVER_URL; 

import "../style/Authentication/SignPage.css";


const checks = {
  lower: /[a-z]/,
  upper: /[A-Z]/,
  number: /\d/,
  symbol: /[!@#$%^&*()_\-+=\[\]{};:'",.<>?/|\\]/,
  length: /^.{6,8}$/
};

export const NewPassword = () => {
  const navigate = useNavigate();
  const email = localStorage.getItem("resetEmail");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [strength, setStrength] = useState(0);
  const [loading, setLoading] = useState(false);

   const [showInstruction, setShowInstruction] = useState("none");

      const handleFocus = ()=>{
      setShowInstruction("block");
   }
   const handleBlur = () => {
  setShowInstruction("none");
};

  const [viewPassword, setViewPassword] = useState("password");
  const [eye, setEye] = useState(faEyeSlash);

    const [isUpperCase, setIsUpperCase] = useState("grey");
    const [isLowerCase, setIsLowerCase] = useState("grey");
    const [isNumber, setIsNumber] = useState("grey");
    const [isSymbol, setIsSymbol] = useState("grey");
    const [isLength, setIsLength] = useState("grey");

    
    useEffect(() => {
      if (!email) navigate("/verifyemailforgetpassword", { replace: true });
    }, [email, navigate]); 

    if (!email) return null;

    const calculateStrength = (value) => {
    let score = 0;
    if (checks.lower.test(value)){
      score++;
      setIsLowerCase("green");
    };
    if(!checks.lower.test(value)){
      setIsLowerCase("grey");
    }
    if (checks.upper.test(value)){
      score++;
      setIsUpperCase("green");
    };
    if(!checks.upper.test(value)){
      setIsUpperCase("grey");
    }
    if (checks.number.test(value)){
      score++;
      setIsNumber("green");
    };
    if(!checks.number.test(value)){
      setIsNumber("grey");
    }
    if (checks.symbol.test(value)){
      score++;
      setIsSymbol("green");
    };
    if(!checks.symbol.test(value)){
      setIsSymbol("grey");
    }
    if (checks.length.test(value)){
      score++;
      setIsLength("green");
    };
    if(!checks.length.test(value)){
      setIsLength("grey");
    }
    return score;
  };
  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    setStrength(calculateStrength(value));
  };

  const isValid =
    password &&
    confirmPassword &&
    password === confirmPassword &&
    strength >= 4;

  const handleSubmit = async () => {
    if (!isValid) return;
    if (loading) return;

    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/set-new-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          newPassword: password,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        res.status === 200 && toast.success(data.message);
        localStorage.removeItem("resetEmail");
     
          navigate("/login");
 
      } else {
        switch (res.status) {
                  case 400:
                    toast.warning(data.message);
                    break;
                  case 401:
                    toast.warning(data.message);
                    break;
                  case 403:
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
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        <div className="form-center">
          <p className="p-page" style={{fontSize:"x-large", fontWeight:"bold"}}>
               Set New Password
              </p>
             <div className='container-input'>
               <div className="div-input">
          <input
            type={viewPassword}
            placeholder="New Password"
            maxLength="8"
            value={password}
            onChange={handlePasswordChange}
            onFocus={handleFocus}
            title="Enter new hard password"
            onBlur={handleBlur}
            onKeyDown={(e) => {
                if (e.key === " ") {
                  e.preventDefault(); 
                }
            }}
            className="input-auth"
          />

          <FontAwesomeIcon
            icon={eye}
            className="show-password-icon"
            onMouseDown={(e) => {
               e.preventDefault(); 
              setViewPassword(
                viewPassword === "password" ? "text" : "password"
              );
              setEye(
                viewPassword === "password"
                  ? faEye
                  : faEyeSlash
              );
            }}
          />
        </div>

       {
            showInstruction !== "none" && 
            <>
            
          <div className = 'password-instruction' style={{display:showInstruction}}>
            <p tyle={{margin: '0px'}}>
            <b style={{marginBottom:'15px'}}>Password must contain: </b>

            </p>
            <p style={{margin: '0px'}}>
            <span style={{color:isUpperCase}}>Uppercase</span>
            <span>, </span>
            <span style={{color:isLowerCase}}>Lowercase</span>
            <span>, </span>
            <span style={{color:isNumber}}>Number</span>
            <span>, </span>
            <span style={{color:isSymbol}}>Symbol</span>
            <span>, </span>
            <span style={{color:isLength}}>Min 6 and Max 8 </span>
            </p>
          </div>
            <div style={{ display: "flex", gap: "5px", marginBottom: "20px", marginTop: "8px", width:"200px"}}>
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                style={{
                  height: "6px",
                  flex: 1,
                  backgroundColor: strength >= i ? "green" : "#dbdbdb",
                  border: "1px solid #4d4d4d",
                  borderRadius: "4px"
                }}
              />
            ))}
            
          </div>
          </>
          } 
         <div className="div-input">
          <input
          type="password"
          placeholder="Confirm Password"
          maxLength="8"
          value={confirmPassword}
          title="Confirm new hard password"
          onChange={(e) => setConfirmPassword(e.target.value)}
          onKeyDown={(e) => {
                if (e.key === " ") {
                  e.preventDefault(); 
                }
          }}
          className="input-auth"
        />
         </div>
     
        <div className="div-input div-submit reset-input">
             <button disabled={!isValid || loading} type="submit" title="Save new password" style={{cursor:"pointer"}}>
          {loading ? "Saving..." : "Reset Password"}
        </button>
        </div>

       
              </div>  
       
        </div>
      </form>
    </div>
  );
};