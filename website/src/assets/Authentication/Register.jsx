
// export default Register;
import React, { useState, useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEyeSlash, faEye } from "@fortawesome/free-solid-svg-icons";
import { useNavigate, useSearchParams  } from "react-router-dom";

import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_URL = import.meta.env.VITE_SERVER_URL; 

import { useAuth } from "../context/AuthContext";
import { GoogleLogin } from "@react-oauth/google";
import { loadFacebookSdk } from "../util/loadFacebookSdk";
import { faFacebook, faGithub } from "@fortawesome/free-brands-svg-icons";
import "../style/Authentication/SignPage.css";

const checks = {
  lower: /[a-z]/,
  upper: /[A-Z]/,
  number: /\d/,
  symbol: /[!@#$%^&*()_\-+=\[\]{};:'",.<>?/|\\]/,
  length: /^.{6,8}$/
};

const Register = () => {
  const navigate = useNavigate();

  const { login } = useAuth();

  const [inputUsername, setInputUsername] = useState("");
  const [inputEmail, setInputEmail] = useState("");
  const [inputPassword, setInputPassword] = useState("");
  const [inputConfirmPassword, setInputConfirmPassword] = useState("");

  const [viewPassword, setViewPassword] = useState("password");
  const [eye, setEye] = useState(faEyeSlash);

  const [strength, setStrength] = useState(0);
  const [loading, setLoading] = useState(false);

   const [showInstruction, setShowInstruction] = useState("none");

   const [isUpperCase, setIsUpperCase] = useState("grey");
   const [isLowerCase, setIsLowerCase] = useState("grey");
   const [isNumber, setIsNumber] = useState("grey");
   const [isSymbol, setIsSymbol] = useState("grey");
   const [isLength, setIsLength] = useState("grey");
  
   const handleFocus = ()=>{
      setShowInstruction("block");
   }
   const handleBlur = () => {
  setShowInstruction("none");
};

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

  const handleValue = (e) => {
    const { name, value } = e.target;

    if (name === "username") setInputUsername(value);
    if (name === "email") setInputEmail(value);

    if (name === "password") {
      setInputPassword(value);
      setStrength(calculateStrength(value)); // ✅ correct usage
    }

    if (name === "confirmPassword") {
      setInputConfirmPassword(value);
    }
  };

  const handleViewPassword = () => {
    if (viewPassword === "password") {
      setViewPassword("text");
      setEye(faEye);
    } else {
      setViewPassword("password");
      setEye(faEyeSlash);
    }
  };

  const isValid =
    inputUsername.trim() &&
    inputEmail.trim() &&
    inputPassword &&
    inputConfirmPassword &&
    inputPassword === inputConfirmPassword &&
    strength >= 5;

  const submitRegister = async () => {
    if (!isValid) return;

    if (loading) return; // ✅ prevent spam

    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: inputUsername.trim(),
          email: inputEmail.trim(),
          password: inputPassword,
        }),
      });
 
      const data = await res.json();

      if (res.ok) {
        res.status === 200 && toast.success(data.message);
        localStorage.setItem("verifyEmail", data.email);
   
          navigate("/verifyemail");
  
      } else {
        switch (res.status) {
                          case 400:
                            toast.warning(data.message);
                            break;
                          case 409:
                            toast.warning(data.message);
                            break;
                          default:
                            toast.warning("Something went wrong");
          }
      }
    } catch (error) {
      console.error(error);
      toast.error("Server error");
    }

    setLoading(false);
  };
   const handleGoogleSuccess = async (credentialResponse) => {
  setLoading(true);
  try {
    const res = await fetch(`${API_URL}/api/auth/google`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ credential: credentialResponse.credential }),
    });

    const data = await res.json();

    if (res.ok) {
      const expiry = Date.now() + 7 * 24 * 60 * 60 * 1000;
      login(data.token, expiry);

      if (data.isNewUser) {
        navigate("/setupaccount", { state: { Email: data.email, UserId: data.userId, Username: data.username } });
      } else {
        navigate("/home");
      }
    } else {
      toast.warning(data.message || "Login failed");
    }
  } catch (error) {
    console.error(error);
    toast.error("Server error, please try again later.");
  }
  setLoading(false);
  };

  const handleFacebookLogin = async () => {
    setLoading(true);
    try {
      const FB = await loadFacebookSdk();

      FB.login(
        async (response) => {
          if (response.authResponse) {
            try {
              const res = await fetch(`${API_URL}/api/auth/facebook`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ accessToken: response.authResponse.accessToken }),
              });

              const data = await res.json();

              if (res.ok) {
                const expiry = Date.now() + 7 * 24 * 60 * 60 * 1000;
                login(data.token, expiry);

                if (data.isNewUser) {
                  navigate("/setupaccount", { state: { Email: data.email, UserId: data.userId, Username: data.username } });
                } else {
                  navigate("/home");
                }
              } else {
                toast.warning(data.message || "Login failed");
              }
            } catch (err) {
              console.error(err);
              toast.error("Server error, please try again later.");
            }
          } else {
            toast.warning("Facebook login was cancelled");
          }
          setLoading(false);
        },
        { scope: "public_profile,email" }
      );
    } catch (err) {
      console.error(err);
      toast.error("Failed to load Facebook login");
      setLoading(false);
    }
  };

  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const error = searchParams.get("error");
    if (!error) return;

    switch (error) {
      case "github_no_email":
        toast.warning("Your GitHub account has no verified email. Please add one on GitHub or register with email instead.");
        break;
      case "email_registered_local":
        toast.warning("This email is already registered. Please log in with your password instead.");
        break;
      case "email_registered_other":
        const provider = searchParams.get("provider");
        toast.warning(`This email is already registered via ${provider}. Please use that method to log in.`);
        break;
      case "github_no_code":
      case "github_token_failed":
        toast.error("GitHub login failed, please try again.");
        break;
      case "server_error":
        toast.error("Server error, please try again later.");
        break;
      default:
        toast.warning("Login failed, please try again.");
    }

    // clean the URL so refreshing doesn't re-trigger the same toast
    setSearchParams({}, { replace: true });
  }, [searchParams, setSearchParams]);

  return (
    <div className="container-form">

      <div className='toast-feedback'>
          <ToastContainer position="top-right" autoClose={2000}/>
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
      <form onSubmit={(e) => { e.preventDefault(); submitRegister(); }}>
        <div className="form-center">
         <div className='container-input'>
          <div className="div-input">
            <input
              type="text"
              name="username"
              value={inputUsername}
              onChange={handleValue}
              title="Enter your username"
              placeholder="Enter username"
              required
              className="input-auth"
            />
          </div>
      
          <div className="div-input">
            <input
              type="email"
              name="email"
              title="Enter your valid email address"
              value={inputEmail}
              onChange={handleValue}
              placeholder="Enter email"
              required
              className="input-auth"
            />
            </div>
        
          <div className="div-input">
            <input
              type={viewPassword}
              name="password"
              value={inputPassword}
              onChange={handleValue}
              title = "Enter hard password with instructions down below"
              required
              // ref={passwordRef}
              placeholder="Enter password"
              onFocus={handleFocus}
              onBlur={handleBlur}
              maxLength="8"
              onKeyDown={(e) => {
                if (e.key === " ") {
                  e.preventDefault(); 
                }
              }}
              className="input-auth"
            />
            <FontAwesomeIcon
              icon={eye}
              onMouseDown={(e) => {
                e.preventDefault(); // prevents input blur
                handleViewPassword();
              }}
              style={{ cursor: "pointer" }}
              className="show-password-icon"
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
              name="confirmPassword"
              maxLength="8"
              value={inputConfirmPassword}
              onChange={handleValue}
              required
              title = "Password must match"
              placeholder="Confirm password"
              onKeyDown={(e) => {
                if (e.key === " ") {
                  e.preventDefault(); 
                }
              }}
              className="input-auth"
              />
            </div>
            <div className="div-input div-submit">
           <span style={{display:"flex", alignItems:"center"}}>
              <input type="checkbox" required style={{width:"20px"}} title="By clicking this, you are agree to term & condition"/>
              <a 
                href="/userAgreement" 
                target="_blank" 
                rel="noopener noreferrer" 
                style={{color:"black", textDecoration:"none"}}
                
              >
                Term & Condition
              </a>
            </span>

            <button
                type="submit"
                title="Create your account"
                disabled={!isValid || loading}
                style={{
                  opacity: !isValid || loading ? 0.5 : 1,
                  cursor: !isValid || loading ? "not-allowed" : "pointer"
                }}
              >
              {loading ? "..." : "Register"}
            </button>
          </div>
           <div className="div-input div-oauth" style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "10px" }}>
              <div className='div-or'>
                <div className='or-line'></div>
                <span className='or-text'>Or continue with</span>
                <div className='or-line'></div>
              </div>
     
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => toast.error("Google login failed")}
                width="280"  
              className='oauth-button'
              text="signup_with"
            />

            {/* <button
              type="button"
              onClick={handleFacebookLogin}
              disabled={loading}
              style={{
                background: "#1877F2",
                cursor: loading ? "not-allowed" : "pointer",
              }}
              title="Login with Facebook"
              className='oauth-button'
            >
             <FontAwesomeIcon icon={faFacebook} className='auth-icon'/> Sign in with Facebook
            </button> */}
            <button className='oauth-button' 
              type="button"
              disabled={loading}
              style={{
                background: "#24292e",
                cursor: loading ? "not-allowed" : "pointer",
              }}
              title="Login with GitHub"
            >
              <a href={`${API_URL}/api/auth/github`}
                style={{
                  display: "block",
                  color: "white",
                  textDecoration: "none",
                }}
                title="Login with GitHub"
                
              >
                <FontAwesomeIcon icon={faGithub} className='auth-icon'/> Sign in with GitHub
              </a>
            </button>

          </div>
          </div>
          <p className="warm-welcome-p">
                Aleady have an account?{" "}
                <span onClick={() => navigate("/login")} style={{color:"green", cursor:"pointer"}} title='Click to login page'>Sign in</span>
          </p>
        </div>
      </form>
    
    </div>

  );
};

export default Register;