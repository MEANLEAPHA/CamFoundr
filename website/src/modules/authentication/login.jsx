import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./signPage.css";

import { useAuth } from "../../context/authContext";
import { useGoogleLogin } from "@react-oauth/google";
import { loadFacebookSdk } from "./facebookSdk";

const API_URL = import.meta.env.VITE_SERVER_URL;

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [inputEmail, setInputEmail] = useState("");
  const [inputPassword, setInputPassword] = useState("");
  const [viewPassword, setViewPassword] = useState("password");
  const [eye, setEye] = useState(faEyeSlash);
  const [loading, setLoading] = useState(false);
  const oauthStartedAt = useRef({});

  const startOAuthTiming = (provider) => {
    const startedAt = performance.now();
    oauthStartedAt.current[provider] = startedAt;
    console.info(`[OAuth:${provider}] sign-in started`);
    return startedAt;
  };

  const logOAuthTiming = (provider, step, startedAt, details = {}) => {
    console.info(`[OAuth:${provider}] ${step}`, {
      elapsedMs: Math.round(performance.now() - startedAt),
      ...details,
    });
  };

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
  const handleGoogleSuccess = async (tokenResponse) => {
    const startedAt = oauthStartedAt.current.google ?? performance.now();
    logOAuthTiming("google", "provider callback received", startedAt);
    setLoading(true);
    let stage = "api_request";

    try {
      const res = await fetch(`${API_URL}/api/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessToken: tokenResponse.access_token }),
      });
      logOAuthTiming("google", "api response received", startedAt, {
        status: res.status,
      });

      stage = "read_response";
      const data = await res.json();

      if (res.ok) {
        const expiry = Date.now() + 7 * 24 * 60 * 60 * 1000;
        login(data.token, expiry);
        logOAuthTiming("google", "sign-in completed", startedAt);

        if (data.isNewUser) {
          navigate("/setupaccount", { state: { Email: data.email, UserId: data.userId } });
        } else {
          navigate("/home");
        }
      } else {
        logOAuthTiming("google", "sign-in rejected", startedAt, {
          status: res.status,
        });
        toast.warning(data.message || "Login failed");
      }
    } catch (error) {
      console.error(`[OAuth:google] ${stage} failed:`, error.message);
      logOAuthTiming("google", "sign-in failed", startedAt, { stage });
      toast.error("Server error, please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: (error) => {
      const startedAt = oauthStartedAt.current.google ?? performance.now();
      logOAuthTiming("google", "provider sign-in failed", startedAt, {
        error: error?.error || "unknown",
      });
      toast.error("Google login failed. Check the browser console for details.");
      setLoading(false);
    },
    scope: "openid email profile",
  });

  const handleFacebookLogin = async () => {
    const startedAt = startOAuthTiming("facebook");
    setLoading(true);
    try {
      const sdkStartedAt = performance.now();
      const FB = await loadFacebookSdk();
      logOAuthTiming("facebook", "SDK loaded", sdkStartedAt);

      FB.login(
        async (response) => {
          logOAuthTiming("facebook", "provider callback received", startedAt, {
            outcome: response.authResponse ? "authorized" : "cancelled_or_denied",
          });
          if (response.authResponse) {
            let stage = "api_request";
            try {
              const res = await fetch(`${API_URL}/api/auth/facebook`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ accessToken: response.authResponse.accessToken }),
              });
              logOAuthTiming("facebook", "api response received", startedAt, {
                status: res.status,
              });

              stage = "read_response";
              const data = await res.json();

              if (res.ok) {
                const expiry = Date.now() + 7 * 24 * 60 * 60 * 1000;
                login(data.token, expiry);
                logOAuthTiming("facebook", "sign-in completed", startedAt);

                if (data.isNewUser) {
                  navigate("/setupaccount", { state: { Email: data.email, UserId: data.userId } });
                } else {
                  navigate("/home");
                }
              } else {
                logOAuthTiming("facebook", "sign-in rejected", startedAt, {
                  status: res.status,
                });
                toast.warning(data.message || "Login failed");
              }
            } catch (err) {
              console.error(`[OAuth:facebook] ${stage} failed:`, err.message);
              logOAuthTiming("facebook", "sign-in failed", startedAt, { stage });
              toast.error("Server error, please try again later.");
            }
          } else {
            logOAuthTiming("facebook", "sign-in cancelled", startedAt);
            toast.warning("Facebook login was cancelled");
          }
          setLoading(false);
        },
        { scope: "public_profile,email" }
      );
    } catch (err) {
      console.error("[OAuth:facebook] SDK or popup failed:", err.message);
      logOAuthTiming("facebook", "sign-in failed", startedAt, {
        stage: "sdk_or_popup",
      });
      toast.error("Failed to load Facebook login");
      setLoading(false);
    }
  };

  const redirectToProvider = (provider) => {
    if (loading) return;
    if (!API_URL) {
      toast.error("Sign-in is temporarily unavailable. Please try again later.");
      return;
    }

    try {
      startOAuthTiming(provider);
      setLoading(true);
      const stateBytes = window.crypto.getRandomValues(new Uint8Array(32));
      const clientState = Array.from(stateBytes, (byte) =>
        byte.toString(16).padStart(2, "0")
      ).join("");
      sessionStorage.setItem("oauthClientState", clientState);
      const serverUrl = API_URL.replace(/\/+$/, "");
      window.location.assign(
        `${serverUrl}/api/auth/${provider}?client_state=${clientState}`
      );
    } catch (error) {
      console.error("Could not start OAuth sign-in:", error);
      setLoading(false);
      toast.error("Sign-in is temporarily unavailable. Please try again later.");
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
        toast.warning("This email is already registered with another sign-in method.");
        break;
      case "github_no_code":
      case "github_token_failed":
      case "github_denied":
      case "github_invalid_state":
        toast.error("GitHub login failed, please try again.");
        break;
      case "microsoft_invalid_state":
      case "microsoft_no_code":
      case "microsoft_token_failed":
      case "microsoft_profile_incomplete":
        toast.error("Microsoft sign-in failed, please try again.");
        break;
      case "microsoft_denied":
        toast.warning("Microsoft sign-in was cancelled.");
        break;
      case "microsoft_unavailable":
        toast.error("Microsoft sign-in is not configured. Please try another method.");
        break;
      case "linkedin_invalid_state":
      case "linkedin_no_code":
      case "linkedin_token_failed":
      case "linkedin_profile_failed":
      case "linkedin_no_verified_email":
      case "linkedin_unavailable":
        toast.error("LinkedIn sign-in failed. Please check the LinkedIn app configuration and try again.");
        break;
      case "linkedin_denied":
        toast.warning("LinkedIn sign-in was cancelled.");
        break;
      case "provider_account_mismatch":
        toast.warning("This provider account does not match the account on file.");
        break;
      case "server_error":
        toast.error("Server error, please try again later.");
        break;
      default:
        toast.warning("Login failed, please try again.");
    }

    // clean the URL so refreshing doesn't re-trigger the same toast
    try {
      sessionStorage.removeItem("oauthClientState");
    } catch (storageError) {
      console.warn("Could not clear OAuth state from session storage:", storageError);
    }
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
                Big ideas begin with a voice.
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
              onClick={() => redirectToProvider("linkedin")}
              disabled={loading}
              title="Sign in with LinkedIn"
              aria-label="Sign in with LinkedIn"
              className='oauth-button'
            >
              <img src='https://cdn-icons-png.flaticon.com/512/2496/2496097.png' className='auth-icon'/>
            </button> 
     
            <button
              type="button"
              onClick={() => {
                if (loading) return;
                startOAuthTiming("google");
                setLoading(true);
                googleLogin();
              }}
              disabled={loading}
              title="Sign in with Google"
              aria-label="Sign in with Google"
              className="oauth-button"
            >
               <img className='auth-icon' src='https://thumb.wikimedia.org/wikipedia/commons/thumb/3/3c/Google_Favicon_2025.svg/960px-Google_Favicon_2025.svg.png?utm_source=commons.wikimedia.org&utm_campaign=index&utm_content=thumbnail'/>
            </button>

            <button
              type="button"
              onClick={handleFacebookLogin}
              disabled={loading}
              style={{
                cursor: loading ? "not-allowed" : "pointer",
              }}
              title="Sign in with Facebook"
              aria-label="Sign in with Facebook"
              className='oauth-button'
            >
             <img className='auth-icon' src='https://cdn-icons-png.flaticon.com/256/124/124010.png'/>
            </button> 
            
            <button
              className="oauth-button"
              type="button"
              onClick={() => redirectToProvider("microsoft")}
              disabled={loading}
              title="Sign in with Microsoft"
              aria-label="Sign in with Microsoft"
            >
              <img  className='auth-icon' src='https://thumb.wikimedia.org/wikipedia/commons/thumb/2/25/Microsoft_icon.svg/1280px-Microsoft_icon.svg.png?utm_source=commons.wikimedia.org&utm_campaign=index&utm_content=thumbnail&_=20220610071042'/>
            </button>
              
              <p className="warm-welcome-p" style={{marginTop: '15px'}}>
                Don't have an account?{" "}
            <span onClick={() => navigate("/register")} style={{ color: "green", cursor: "pointer" }} title="Click to create an account">
              Create one
            </span>
          </p>
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
          
          </div>
          
        
        </div>

       
      </form>
    </div>
  );
};

export default Login;
