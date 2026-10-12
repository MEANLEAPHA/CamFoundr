import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./signPage.css";

import { useAuth } from "../../context/authContext";
import { GoogleLogin } from "@react-oauth/google";
import { faFacebookF, faGithub, faGoogle, faLinkedinIn, faMicrosoft } from "@fortawesome/free-brands-svg-icons";

const API_URL = import.meta.env.VITE_SERVER_URL;

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [inputEmail, setInputEmail] = useState("");
  const [inputPassword, setInputPassword] = useState("");
  const [viewPassword, setViewPassword] = useState("password");
  const [eye, setEye] = useState(faEyeSlash);
  const [loading, setLoading] = useState(false);

  const handleValue = (e) => {
    const { name, value } = e.target;
    if (name === "email") setInputEmail(value);
    if (name === "password") setInputPassword(value);
  };

  const isValid =
    inputEmail.trim() && inputPassword && inputPassword.length >= 6;

  const SubmitLogin = async () => {
    if (!isValid || loading) return;
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: inputEmail.trim(),
          password: inputPassword,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        const expiry = Date.now() + 7 * 24 * 60 * 60 * 1000;

        login(data.token, expiry);

        navigate("/home");
      } else {
        switch (res.status) {
          case 400:
          case 401:
          case 403:
          case 404:
            toast.warning(data.message);
            break;
          default:
            toast.warning("Something went wrong");
        }
      }
    } catch (error) {
      console.error(error);
      toast.error("Server error, please try again later.");
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
        navigate("/setupaccount", { state: { Email: data.email, UserId: data.userId } });
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
                  navigate("/setupaccount", { state: { Email: data.email, UserId: data.userId } });
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
      <div className="toast-feedback">
        <ToastContainer position="top-right" autoClose={2000} />
      </div>
      <form onSubmit={(e) => { e.preventDefault(); SubmitLogin(); }}>
        <div className="form-center">
          <div className="container-input">

            <div className="top-title-div">
              <p className="top-title">CDL</p>
              <p className="sub-title">
                Be part of the movement building a better ss
              </p>
            </div>

            <label className='label-required'>Email <span style={{color:'red'}}>*</span></label>
            <div className="div-input">
              <input
                type="email"
                name="email"
                placeholder="Enter Email"
                value={inputEmail}
                onChange={handleValue}
                required
                className="input-auth"
                title="Enter your email account"
              />
            </div>

            <label className='label-required'>Password <span style={{color:'red'}}>*</span></label>
            <div className="div-input">
              <input
                type={viewPassword}
                name="password"
                placeholder="Enter Password"
                value={inputPassword}
                onChange={handleValue}
                onKeyDown={(e) => { if (e.key === " ") e.preventDefault(); }}
                required
                className="input-auth"
                title="Enter your password"
              />
              <FontAwesomeIcon
                icon={eye}
                className="show-password-icon"
                onClick={() => {
                  setViewPassword(viewPassword === "password" ? "text" : "password");
                  setEye(viewPassword === "password" ? faEye : faEyeSlash);
                }}
                style={{ cursor: "pointer" }}
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
                title="Click to login"
              >
                {loading ? "..." : "Sign In"}
              </button>
              <span onClick={() => navigate("/forgetpassword")} title="Click to reset your password">
                Forget Password
              </span>
            </div>
        
              <div className='div-or'>
                <div className='or-line'></div>
                <span className='or-text'>Or continue with</span>
                <div className='or-line'></div>
              </div>
              
            <div className="div-oauth">
            <button
              type="button"
              onClick={handleFacebookLogin}
              disabled={loading}
              style={{
                cursor: loading ? "not-allowed" : "pointer",
              }}
              title="Sign in with Linkedin"
              className='oauth-button'
            >
  
             <img src='https://cdn-icons-png.flaticon.com/512/2496/2496097.png' className='auth-icon'/>
            </button> 
     
             <button
              type="button"
              onClick={handleFacebookLogin}
              disabled={loading}
              style={{
                cursor: loading ? "not-allowed" : "pointer",
              }}
              title="Sign in with Google"
              className='oauth-button'
            >
             <img className='auth-icon' src='https://thumb.wikimedia.org/wikipedia/commons/thumb/3/3c/Google_Favicon_2025.svg/960px-Google_Favicon_2025.svg.png?utm_source=commons.wikimedia.org&utm_campaign=index&utm_content=thumbnail'/>
            </button> 

            {/* <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => toast.error("Google login failed")}
                width="280"  
              className='oauth-button'
            /> */}

            <button
              type="button"
              onClick={handleFacebookLogin}
              disabled={loading}
              style={{
                cursor: loading ? "not-allowed" : "pointer",
              }}
              title="Sign in with Facebook"
              className='oauth-button'
            >
             <img className='auth-icon' src='https://cdn-icons-png.flaticon.com/256/124/124010.png'/>
            </button> 
            
             <button className='oauth-button' 
              type="button"
              disabled={loading}
              style={{
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
                title="Sign in with Microdoft"
                
              >
                <img  className='auth-icon' src='https://thumb.wikimedia.org/wikipedia/commons/thumb/2/25/Microsoft_icon.svg/1280px-Microsoft_icon.svg.png?utm_source=commons.wikimedia.org&utm_campaign=index&utm_content=thumbnail&_=20220610071042'/>
              </a>
            </button>
            {/* <button className='oauth-button' 
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
                <FontAwesomeIcon icon={faGithub} className='auth-icon'/> 
              </a>
            </button> */}

              <p className="warm-welcome-p" style={{marginTop: '15px'}}>
            Don't have an account?{" "}
            <span onClick={() => navigate("/register")} style={{ color: "green", cursor: "pointer" }} title="Click to create an account">
              Create one
            </span>
          </p>

          </div>
          </div>
          <div className='footer-form-detail'>
            <p>About</p>
            <p>.</p>
            <p>User Agreement</p>
            <p>.</p>
            <p>Private Policy</p>
            <p>.</p>
            <p>Accessibility</p>
            <p>.</p>
            <p>Term & condition</p>
          </div>
        
        </div>

       
      </form>
    </div>
  );
};

export default Login;
