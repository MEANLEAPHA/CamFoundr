import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../../context/authContext";

const OAuthCallback = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const processedRef = useRef(false);

  useEffect(() => {
    if (processedRef.current) return;
    processedRef.current = true;

    const callbackParams = new URLSearchParams(window.location.hash.slice(1));
    const code = callbackParams.get("code");
    const state = callbackParams.get("state");
    let expectedState = null;
    try {
      expectedState = sessionStorage.getItem("oauthClientState");
    } catch (error) {
      console.error("Could not verify OAuth sign-in state:", error);
    }

    if (!code || !state || !expectedState || state !== expectedState) {
      try {
        sessionStorage.removeItem("oauthClientState");
      } catch (error) {
        console.warn("Could not clear OAuth state from session storage:", error);
      }
      toast.error("Sign-in request could not be verified. Please try again.");
      navigate("/login", { replace: true });
      return;
    }

    navigate("/oauth-callback", { replace: true });

    const exchangeCode = async () => {
      const startedAt = performance.now();
      console.info("[OAuth:handoff] exchange started");
      try {
        const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/auth/oauth/exchange`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code, state }),
        });
        console.info("[OAuth:handoff] exchange response", {
          elapsedMs: Math.round(performance.now() - startedAt),
          status: response.status,
        });
        const data = await response.json();

        if (!response.ok || typeof data.token !== "string") {
          throw new Error(data.message || "Sign-in request expired or already used");
        }
        sessionStorage.removeItem("oauthClientState");

        const expiry = Date.now() + 7 * 24 * 60 * 60 * 1000;
        login(data.token, expiry);
        console.info("[OAuth:handoff] sign-in completed", {
          elapsedMs: Math.round(performance.now() - startedAt),
        });

        if (data.isNewUser) {
          navigate("/setupaccount", {
            replace: true,
            state: { Email: data.email, UserId: data.userId, Username: data.username },
          });
        } else {
          navigate("/home", { replace: true });
        }
      } catch (error) {
        console.error("[OAuth:handoff] sign-in failed:", error.message);
        console.info("[OAuth:handoff] sign-in failure timing", {
          elapsedMs: Math.round(performance.now() - startedAt),
        });
        try {
          sessionStorage.removeItem("oauthClientState");
        } catch (storageError) {
          console.warn("Could not clear OAuth state from session storage:", storageError);
        }
        toast.error(error.message || "Sign-in failed. Please try again.");
        navigate("/login", { replace: true });
      }
    };

    exchangeCode();
  }, [login, navigate]);

  return <div className="container-form"><p>Signing you in...</p></div>;
};

export default OAuthCallback;