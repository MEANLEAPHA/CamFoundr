import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../style/Authentication/SignPage.css";

import { useAuth } from "../context/AuthContext";
import { GoogleLogin } from "@react-oauth/google";
import { loadFacebookSdk } from "../util/loadFacebookSdk";
import { faFacebookF, faGithub, faLinkedinIn } from "@fortawesome/free-brands-svg-icons";

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
      <div className="p-page-div">
          <p className="p-page">CamFoundr</p>
          <p className="p2-page">
           Be part of the movement building a better Cambodian
          </p>
          <p className="p2-page">
             startup ecosystem
          </p>
      </div>
      <form onSubmit={(e) => { e.preventDefault(); SubmitLogin(); }}>
        <div className="form-center">
          <div className="container-input">
      
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
        
            <div className="div-input div-oauth" style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "10px" }}>
              <div className='div-or'>
                <div className='or-line'></div>
                <span className='or-text'>Or continue with</span>
                <div className='or-line'></div>
              </div>

              <button
              type="button"
              onClick={handleFacebookLogin}
              disabled={loading}
              style={{
                background: "#007BB5",
                cursor: loading ? "not-allowed" : "pointer",
              }}
              title="Login with Facebook"
              className='oauth-button'
            >
             <FontAwesomeIcon icon={faLinkedinIn} className='auth-icon'/> Sign in with Linkedin
            </button> 
     
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => toast.error("Google login failed")}
                width="280"  
              className='oauth-button'
            />

            <button
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
             <FontAwesomeIcon icon={faFacebookF} className='auth-icon'/> Sign in with Facebook
            </button> 
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
          <p className="warm-welcome-p" style={{margin: 0}}>
            Don't have an account?{" "}
            <span onClick={() => navigate("/register")} style={{ color: "green", cursor: "pointer" }} title="Click to create an account">
              Create one
            </span>
          </p>
        </div>
      </form>
    </div>
  );
};

export default Login;
