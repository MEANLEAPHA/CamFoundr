import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";

const OAuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const token = searchParams.get("token");
    const isNewUser = searchParams.get("isNewUser") === "true";
    const userId = searchParams.get("userId");
    const email = searchParams.get("email");

    if (!token) {
      toast.error("Login failed, please try again");
      navigate("/login");
      return;
    }

    const expiry = Date.now() + 7 * 24 * 60 * 60 * 1000;
    login(token, expiry);

    if (isNewUser) {
      navigate("/setupaccount", { state: { Email: email, UserId: userId } });
    } else {
      navigate("/home");
    }
  }, []);

  return <div className="container-form"><p>Signing you in...</p></div>;
};

export default OAuthCallback;