const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const pool = require('../../config/db'); 
const { ranking, cachePost } = require("../../config/redisClient");
const crypto = require('crypto');
require('dotenv').config();
const { sendVerifyCodeEmail, sendResendPinEmail, sendVerifyCodeForgetPasswordEmail} = require('../../service/mail/email');
const { createToken } = require('../../service/token/jwtHelp');
const { convertAndUpload } = require("../../service/hostinger/ftp");

const { OAuth2Client } = require('google-auth-library');
const axios = require('axios');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const getFrontendRedirect = (path, params = {}) => {
  if (!process.env.ORIGIN_URL) {
    throw new Error("ORIGIN_URL is not configured");
  }

  const redirectUrl = new URL(path, process.env.ORIGIN_URL);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) {
      redirectUrl.searchParams.set(key, String(value));
    }
  }
  return redirectUrl.toString();
};

const setOAuthStateCookie = (req, res, provider, state, clientState) => {
  const secure = req.secure || process.env.NODE_ENV === "production";
  res.append(
    "Set-Cookie",
    `oauth_${provider}_state=${state}.${clientState}; Path=/api/auth/${provider}; HttpOnly; SameSite=Lax; Max-Age=600${secure ? "; Secure" : ""}`
  );
};

const consumeOAuthStateCookie = (req, res, provider, state) => {
  const cookieName = `oauth_${provider}_state`;
  const cookie = (req.headers.cookie || "")
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${cookieName}=`));
  const [cookieState, clientState, ...extra] =
    (cookie?.slice(cookieName.length + 1) || "").split(".");
  const secure = req.secure || process.env.NODE_ENV === "production";

  res.append(
    "Set-Cookie",
    `${cookieName}=; Path=/api/auth/${provider}; HttpOnly; SameSite=Lax; Max-Age=0${secure ? "; Secure" : ""}`
  );

  if (
    typeof state !== "string" ||
    !/^[a-f0-9]{64}$/i.test(state) ||
    !cookieState ||
    !/^[a-f0-9]{64}$/i.test(cookieState) ||
    !clientState ||
    !/^[a-f0-9]{64}$/i.test(clientState) ||
    extra.length > 0
  ) {
    return null;
  }

  if (!crypto.timingSafeEqual(
    Buffer.from(state, "hex"),
    Buffer.from(cookieState, "hex")
  )) {
    return null;
  }
  return clientState;
};

const issueOAuthHandoff = async (res, user, isNewUser, clientState) => {
  const token = createToken({ userId: user.id });
  const handoffCode = crypto.randomBytes(32).toString("hex");
  const handoff = {
    token,
    isNewUser,
    userId: user.id,
    email: user.email,
    username: user.username,
    clientState,
  };

  const result = await cachePost.set(
    `oauth:handoff:${handoffCode}`,
    JSON.stringify(handoff),
    { EX: 120, NX: true }
  );
  if (result !== "OK") {
    throw new Error("Could not save OAuth handoff");
  }

  res.set("Cache-Control", "no-store");
  res.set("Referrer-Policy", "no-referrer");
  const callbackUrl = new URL(getFrontendRedirect("/oauth-callback"));
  callbackUrl.hash = new URLSearchParams({
    code: handoffCode,
    state: clientState,
  }).toString();
  return res.redirect(callbackUrl.toString());
};

const exchangeOAuthHandoff = async (req, res) => {
  res.set("Cache-Control", "no-store");
  const { code, state } = req.body || {};
  if (
    typeof code !== "string" ||
    !/^[a-f0-9]{64}$/i.test(code) ||
    typeof state !== "string" ||
    !/^[a-f0-9]{64}$/i.test(state)
  ) {
    return res.status(400).json({ message: "Invalid or expired sign-in request" });
  }

  try {
    const storedHandoff = await cachePost.getDel(`oauth:handoff:${code}`);
    if (!storedHandoff) {
      return res.status(410).json({ message: "Sign-in request expired or already used" });
    }
    const handoff = JSON.parse(storedHandoff);
    if (
      typeof handoff.clientState !== "string" ||
      !/^[a-f0-9]{64}$/i.test(handoff.clientState) ||
      !crypto.timingSafeEqual(Buffer.from(state, "hex"), Buffer.from(handoff.clientState, "hex"))
    ) {
      return res.status(403).json({ message: "Sign-in request could not be verified" });
    }

    const session = { ...handoff };
    delete session.clientState;
    return res.status(200).json(session);
  } catch (error) {
    console.error("OAuth handoff exchange failed:", error.message);
    return res.status(503).json({ message: "Sign-in is temporarily unavailable" });
  }
};

const redirectOAuthError = (res, error) => {
  try {
    res.set("Cache-Control", "no-store");
    return res.redirect(getFrontendRedirect("/login", { error }));
  } catch (redirectError) {
    console.error("OAuth error redirect failed:", redirectError.message);
    return res.status(503).send("Sign-in is temporarily unavailable");
  }
};

const microsoftRedirect = (req, res) => {
  const { client_state: clientState } = req.query;
  const {
    MICROSOFT_CLIENT_ID,
    MICROSOFT_CLIENT_SECRET,
    MICROSOFT_CALLBACK_URL,
  } = process.env;
  if (!MICROSOFT_CLIENT_ID || !MICROSOFT_CLIENT_SECRET || !MICROSOFT_CALLBACK_URL) {
    return redirectOAuthError(res, "microsoft_unavailable");
  }
  if (typeof clientState !== "string" || !/^[a-f0-9]{64}$/i.test(clientState)) {
    return redirectOAuthError(res, "microsoft_invalid_state");
  }

  const tenant = process.env.MICROSOFT_TENANT_ID || "common";
  if (!/^(common|organizations|consumers|[0-9a-f-]{36})$/i.test(tenant)) {
    return redirectOAuthError(res, "microsoft_unavailable");
  }

  const state = crypto.randomBytes(32).toString("hex");
  setOAuthStateCookie(req, res, "microsoft", state, clientState);

  const params = new URLSearchParams({
    client_id: MICROSOFT_CLIENT_ID,
    response_type: "code",
    redirect_uri: MICROSOFT_CALLBACK_URL,
    response_mode: "query",
    scope: "openid profile email User.Read",
    state,
  });

  return res.redirect(
    `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/authorize?${params}`
  );
};

const microsoftCallback = async (req, res) => {
  const { code, state, error } = req.query;
  const clientState = consumeOAuthStateCookie(req, res, "microsoft", state);
  if (!clientState) {
    return redirectOAuthError(res, "microsoft_invalid_state");
  }
  if (error) {
    return redirectOAuthError(res, "microsoft_denied");
  }
  if (typeof code !== "string" || !code) {
    return redirectOAuthError(res, "microsoft_no_code");
  }
  if (
    !process.env.MICROSOFT_CLIENT_ID ||
    !process.env.MICROSOFT_CLIENT_SECRET ||
    !process.env.MICROSOFT_CALLBACK_URL
  ) {
    return redirectOAuthError(res, "microsoft_unavailable");
  }

  try {
    const tenant = process.env.MICROSOFT_TENANT_ID || "common";
    const tokenResponse = await axios.post(
      `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/token`,
      new URLSearchParams({
        client_id: process.env.MICROSOFT_CLIENT_ID,
        client_secret: process.env.MICROSOFT_CLIENT_SECRET,
        grant_type: "authorization_code",
        code,
        redirect_uri: process.env.MICROSOFT_CALLBACK_URL,
        scope: "openid profile email User.Read",
      }),
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        timeout: 10000,
      }
    );
    const accessToken = tokenResponse.data?.access_token;
    if (!accessToken) {
      return redirectOAuthError(res, "microsoft_token_failed");
    }

    const profileResponse = await axios.get(
      "https://graph.microsoft.com/v1.0/me?$select=id,displayName,mail,userPrincipalName",
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        timeout: 10000,
      }
    );
    const profile = profileResponse.data;
    const providerId = profile?.id;
    const rawEmail =
      typeof profile?.userPrincipalName === "string"
        ? profile.userPrincipalName
        : profile?.mail;
    const email = typeof rawEmail === "string" ? rawEmail.trim().toLowerCase() : "";

    if (
      typeof providerId !== "string" ||
      !providerId ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      email.length > 254
    ) {
      return redirectOAuthError(res, "microsoft_profile_incomplete");
    }

    let user;
    let isNewUser = false;
    const providerUser = await pool.query(
      "SELECT * FROM users WHERE auth_provider = 'microsoft' AND provider_id = $1",
      [providerId]
    );

    if (providerUser.rows.length > 0) {
      user = providerUser.rows[0];
    } else {
      const emailUser = await pool.query(
        "SELECT * FROM users WHERE lower(email) = $1",
        [email]
      );
      if (emailUser.rows.length > 0) {
        return redirectOAuthError(res, "email_registered_other");
      }

      let username;
      for (let attempt = 0; attempt < 5; attempt++) {
        const candidate = `user_${crypto.randomBytes(8).toString("hex")}`;
        const usernameExists = await pool.query(
          "SELECT 1 FROM users WHERE username = $1",
          [candidate]
        );
        if (usernameExists.rows.length === 0) {
          username = candidate;
          break;
        }
      }
      if (!username) {
        throw new Error("Could not generate a unique OAuth username");
      }

      const insertResult = await pool.query(
        `INSERT INTO users
          (username, email, password_hash, is_verified, auth_provider, provider_id, avatar_url)
         VALUES ($1, $2, NULL, 1, 'microsoft', $3, NULL)
         RETURNING *`,
        [username, email, providerId]
      );
      user = insertResult.rows[0];
      isNewUser = true;
    }

    return await issueOAuthHandoff(res, user, isNewUser, clientState);
  } catch (callbackError) {
    console.error("Microsoft OAuth callback failed:", callbackError.message);
    return redirectOAuthError(res, "server_error");
  }
};

// login logical 
const login = async (req, res) => {
  try {

    const { email, password } = req.body || {};

    if (typeof email !== "string" || !email.trim() ||
        typeof password !== "string" || !password) {
      return res.status(400).json({
        message: "Email and Password are required"
      });
    }

    const result = await pool.query(
      "SELECT * FROM users WHERE lower(email) = $1",
      [email.trim().toLowerCase()]
    );
    const users = result.rows;

    if (users.length === 0) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    const user = users[0];

    const passwordValid = user.password_hash
      ? await bcrypt.compare(password, user.password_hash)
      : false;

    if (!passwordValid) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    if (user.is_verified === 0 || user.is_verified === false) {
      return res.status(403).json({
        message: "Please verify your email before logging in",
        needsVerification: true
      });
    }

    const token = createToken({
      userId: user.id,
    });

    return res.status(200).json({
      message: "Login Successfully",
      token,
    });

  } catch (error) {

    console.error("loginMember error:", error);

    return res.status(500).json({
      message: "Server Error, Please try again later",
    });
  }
};

// Google OAuth login/register
const googleLogin = async (req, res) => {
  const startedAt = Date.now();
  try {
    const { credential, accessToken } = req.body || {};

    const hasCredential = typeof credential === "string" && credential.length > 0 && credential.length <= 10000;
    const hasAccessToken = typeof accessToken === "string" && accessToken.length > 0 && accessToken.length <= 10000;
    if (hasCredential === hasAccessToken) {
      return res.status(400).json({ message: "Invalid Google credential" });
    }
    if (!process.env.GOOGLE_CLIENT_ID) {
      return res.status(503).json({ message: "Google sign-in is temporarily unavailable" });
    }

    let payload;
    try {
      if (hasCredential) {
        const ticket = await googleClient.verifyIdToken({
          idToken: credential,
          audience: process.env.GOOGLE_CLIENT_ID,
        });
        payload = ticket.getPayload();
      } else {
        const tokenInfo = await googleClient.getTokenInfo(accessToken);
        if (tokenInfo.aud !== process.env.GOOGLE_CLIENT_ID) {
          return res.status(401).json({ message: "Invalid Google token" });
        }

        const profile = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: { Authorization: `Bearer ${accessToken}` },
          timeout: 10000,
        });
        if (
          profile.data.sub !== tokenInfo.sub ||
          profile.data.email?.toLowerCase() !== tokenInfo.email?.toLowerCase()
        ) {
          return res.status(401).json({ message: "Invalid Google token" });
        }
        payload = {
          ...profile.data,
          email_verified:
            profile.data.email_verified ??
            profile.data.verified_email ??
            tokenInfo.email_verified ??
            tokenInfo.verified_email,
        };
      }
    } catch (verifyErr) {
      console.error("Google token verification failed:", verifyErr.message);
      return res.status(401).json({ message: "Invalid Google token" });
    }

    const {
      email,
      sub: providerId,
      picture,
      email_verified: emailVerified,
      verified_email: verifiedEmail,
    } = payload || {};
    const verifiedClaim = emailVerified ?? verifiedEmail;
    const isEmailVerified =
      verifiedClaim === true ||
      (typeof verifiedClaim === "string" && verifiedClaim.toLowerCase() === "true");

    if (typeof email !== "string" || !email.trim() || !isEmailVerified || !providerId) {
      console.warn("[OAuth:google] verified identity claim rejected", {
        hasEmail: typeof email === "string" && !!email.trim(),
        hasProviderId: !!providerId,
        verifiedClaimType: typeof verifiedClaim,
        verifiedClaim,
        elapsedMs: Date.now() - startedAt,
      });
      return res.status(401).json({ message: "Google account has no verified email" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existing = await pool.query(
      "SELECT * FROM users WHERE lower(email) = $1",
      [normalizedEmail]
    );
    let user;
    let isNewUser = false;

    if (existing.rows.length > 0) {
      user = existing.rows[0];

      if (user.auth_provider === 'local' || !user.auth_provider) {
        return res.status(409).json({
          message: "This email is already registered. Please log in with your password instead."
        });
      }

      if (user.auth_provider !== 'google') { 
        return res.status(409).json({
          message: `This email is already registered via ${user.auth_provider}. Please use that method to log in.`
        });
      }
      if (String(user.provider_id) !== String(providerId)) {
        return res.status(409).json({ message: "This Google account does not match the account on file." });
      }

    } else {
      isNewUser = true;

      const generatePlaceholderUsername = () => `user_${crypto.randomBytes(4).toString('hex')}`;
      let usernameBase = generatePlaceholderUsername();

      let attempts = 0;
      while (attempts < 5) {
        const check = await pool.query("SELECT id FROM users WHERE username = $1", [usernameBase]);
        if (check.rows.length === 0) break;
        usernameBase = generatePlaceholderUsername();
        attempts++;
      }

      const insertResult = await pool.query(
        `INSERT INTO users
          (username, email, password_hash, is_verified, auth_provider, provider_id, avatar_url)
        VALUES ($1, $2, NULL, 1, 'google', $3, $4)
        RETURNING *`,
        [usernameBase, normalizedEmail, providerId, picture || null]
      );
      user = insertResult.rows[0];
    }

    const token = createToken({ userId: user.id });

    return res.status(200).json({
      message: "Login Successfully",
      token,
      isNewUser,
      userId: user.id,
      email: user.email
    });

  } catch (error) {
    console.error("[OAuth:google] sign-in failed:", error.message);
    console.info("[OAuth:google] request timing", {
      elapsedMs: Date.now() - startedAt,
    });
    return res.status(500).json({ message: "Server Error, Please try again later" });
  }
};

// Facebook OAuth login/register
const facebookLogin = async (req, res) => {
  try {
    const { accessToken } = req.body || {};

    if (typeof accessToken !== "string" || !accessToken || accessToken.length > 10000) {
      return res.status(400).json({ message: "Missing Facebook access token" });
    }
    if (!process.env.FACEBOOK_APP_ID || !process.env.FACEBOOK_APP_SECRET) {
      return res.status(503).json({ message: "Facebook sign-in is temporarily unavailable" });
    }

    let fbUser;
    try {
    
      const verifyRes = await axios.get("https://graph.facebook.com/debug_token", {
        params: {
          input_token: accessToken,
          access_token: `${process.env.FACEBOOK_APP_ID}|${process.env.FACEBOOK_APP_SECRET}`,
        },
        timeout: 10000,
      });

      const tokenData = verifyRes.data.data;
      if (!tokenData.is_valid || tokenData.app_id !== process.env.FACEBOOK_APP_ID) {
        return res.status(401).json({ message: "Invalid Facebook token" });
      }

      const profileRes = await axios.get("https://graph.facebook.com/me", {
        params: {
          fields: "id,email,picture",
          access_token: accessToken,
        },
        timeout: 10000,
      });
      fbUser = profileRes.data;

    } catch (verifyErr) {
      console.error("Facebook verification failed:", verifyErr.response?.data || verifyErr.message);
      return res.status(401).json({ message: "Invalid Facebook token" });
    }

    const { email, id: providerId, picture } = fbUser;

    if (typeof email !== "string" || !email.trim() || !providerId) {
      return res.status(400).json({
        message: "Your Facebook account has no email attached. Please register with email instead."
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const avatarUrl = picture?.data?.url || null;
    const existing = await pool.query(
      "SELECT * FROM users WHERE lower(email) = $1",
      [normalizedEmail]
    );
    let user;
    let isNewUser = false;

    if (existing.rows.length > 0) {
      user = existing.rows[0];

      if (user.auth_provider === 'local' || !user.auth_provider) {
        return res.status(409).json({
          message: "This email is already registered. Please log in with your password instead."
        });
      }

      if (user.auth_provider !== 'facebook') { 
        return res.status(409).json({
          message: `This email is already registered via ${user.auth_provider}. Please use that method to log in.`
        });
      }
      if (String(user.provider_id) !== String(providerId)) {
        return res.status(409).json({ message: "This Facebook account does not match the account on file." });
      }

    } else {
      isNewUser = true;

      const generatePlaceholderUsername = () => `user_${crypto.randomBytes(4).toString('hex')}`;
      let usernameBase = generatePlaceholderUsername();

      let attempts = 0;
      while (attempts < 5) {
        const check = await pool.query("SELECT id FROM users WHERE username = $1", [usernameBase]);
        if (check.rows.length === 0) break;
        usernameBase = generatePlaceholderUsername();
        attempts++;
      }

      const insertResult = await pool.query(
        `INSERT INTO users
          (username, email, password_hash, is_verified, auth_provider, provider_id, avatar_url)
        VALUES ($1, $2, NULL, 1, 'facebook', $3, $4)
        RETURNING *`,
        [usernameBase, normalizedEmail, providerId, avatarUrl]
      );
      user = insertResult.rows[0];
    }

    const token = createToken({ userId: user.id });

    return res.status(200).json({
      message: "Login Successfully",
      token,
      isNewUser,
      userId: user.id,
      email: user.email,
      username: user.username
    });

  } catch (error) {
    console.error("facebookLogin error:", error);
    return res.status(500).json({ message: "Server Error, Please try again later" });
  }
};

// GitHub OAuth — step 1: redirect user to GitHub's authorize page
const githubRedirect = (req, res) => {
  const { client_state: clientState } = req.query;
  if (
    !process.env.GITHUB_CLIENT_ID ||
    !process.env.GITHUB_CALLBACK_URL ||
    !process.env.GITHUB_CLIENT_SECRET
  ) {
    return redirectOAuthError(res, "github_unavailable");
  }
  if (typeof clientState !== "string" || !/^[a-f0-9]{64}$/i.test(clientState)) {
    return redirectOAuthError(res, "github_invalid_state");
  }

  const state = crypto.randomBytes(32).toString("hex");
  setOAuthStateCookie(req, res, "github", state, clientState);
  const params = new URLSearchParams({
    client_id: process.env.GITHUB_CLIENT_ID,
    redirect_uri: process.env.GITHUB_CALLBACK_URL,
    scope: "read:user user:email",
    state,
  });
  return res.redirect(`https://github.com/login/oauth/authorize?${params.toString()}`);
};

// GitHub OAuth — step 2: handle the callback GitHub redirects to
const githubCallback = async (req, res) => {
  const { code, state, error } = req.query;
  const clientState = consumeOAuthStateCookie(req, res, "github", state);
  if (!clientState) {
    return redirectOAuthError(res, "github_invalid_state");
  }
  if (error) {
    return redirectOAuthError(res, "github_denied");
  }

  try {
    if (typeof code !== "string" || !code) {
      return redirectOAuthError(res, "github_no_code");
    }

    // Exchange code for access token
    const tokenRes = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: process.env.GITHUB_CALLBACK_URL,
      },
      { headers: { Accept: "application/json" }, timeout: 10000 }
    );

    const { access_token } = tokenRes.data;

    if (!access_token) {
      return redirectOAuthError(res, "github_token_failed");
    }

    // Fetch profile
    const profileRes = await axios.get("https://api.github.com/user", {
      headers: { Authorization: `Bearer ${access_token}` },
    });
    const profile = profileRes.data;

    let email = profile.email;

    // GitHub often hides email on the profile — fetch it separately if missing
    if (typeof email !== "string" || !email.trim()) {
      const emailsRes = await axios.get("https://api.github.com/user/emails", {
        headers: { Authorization: `Bearer ${access_token}` },
      });
      const primary = emailsRes.data.find(e => e.primary && e.verified);
      email = primary?.email || null;
    }

    if (
      typeof email !== "string" ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
    ) {
      return redirectOAuthError(res, "github_no_email");
    }

    const providerId = profile.id.toString();
    const picture = profile.avatar_url;

    const normalizedEmail = email.trim().toLowerCase();
    const existing = await pool.query(
      "SELECT * FROM users WHERE lower(email) = $1",
      [normalizedEmail]
    );
    let user;
    let isNewUser = false;

    if (existing.rows.length > 0) {
      user = existing.rows[0];

      if (user.auth_provider === 'local' || !user.auth_provider) {
        return redirectOAuthError(res, "email_registered_local");
      }

      if (user.auth_provider !== 'github') {
        return redirectOAuthError(res, "email_registered_other");
      }

      if (String(user.provider_id) !== providerId) {
        return redirectOAuthError(res, "provider_account_mismatch");
      }

    } else {
      isNewUser = true;

      const generatePlaceholderUsername = () => `user_${crypto.randomBytes(4).toString('hex')}`;
      let usernameBase = generatePlaceholderUsername();

      let attempts = 0;
      while (attempts < 5) {
        const check = await pool.query("SELECT id FROM users WHERE username = $1", [usernameBase]);
        if (check.rows.length === 0) break;
        usernameBase = generatePlaceholderUsername();
        attempts++;
      }

      const insertResult = await pool.query(
        `INSERT INTO users
          (username, email, password_hash, is_verified, auth_provider, provider_id, avatar_url)
         VALUES ($1, $2, NULL, 1, 'github', $3, $4)
         RETURNING *`,
        [usernameBase, normalizedEmail, providerId, picture || null]
      );
      user = insertResult.rows[0];
    }

    return await issueOAuthHandoff(res, user, isNewUser, clientState);

  } catch (error) {
    console.error("GitHub OAuth callback failed:", error.message);
    return redirectOAuthError(res, "server_error");
  }
};

//Register Or Signup
const register = async (req, res) => {
  try {

    const { username, email, password} = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        message: "Username, Email and Password are required"
      });
    }

    const existingResult = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );

    if (existingResult.rows.length > 0) {
      return res.status(409).json({
        message: "Oups! This Email is already registered"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const pinCode = Math.floor(100000 + Math.random() * 900000).toString();

    await pool.query(
      `INSERT INTO users
      (username, email, password_hash, pin_code, pin_created_at)
      VALUES ($1, $2, $3, $4, NOW())`,
      [username, email, hashedPassword, pinCode]
    );

    let emailSent = false;

    try {
      await sendVerifyCodeEmail(email, pinCode);
      emailSent = true;

    } catch (emailError) {
      console.error("Email send failed:", emailError);
      await pool.query("DELETE FROM users WHERE email = $1", [email]);
      return res.status(506).json({ message: "Sever can't send the PIN at this moment. Please try again later" });
    }

    return res.status(200).json({
      message: emailSent
        ? "Registration successful. Please check your email."
        : "Registration successful but email failed. Please resend verification.",
      needsVerification: true,
      email
    });

  } catch (error) {

    console.error("createMember error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// verifyEmail + send code for fist register
const verifyEmail = async (req, res) => {
  try {
    const { pin, email } = req.body;
    if(!email){
      return res.status(401).json({ message: "Email is required" });
    }

    if (!pin || pin.trim().length !== 6) {
      return res.status(402).json({ message: "Invalid PIN format" });
    }

    const pinTrimmed = pin.trim();

    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1 AND pin_code = $2",
      [email, pinTrimmed]
    );
    const users = result.rows;

    if (!users.length) {
      return res.status(400).json({ message: "No Registrant found. Please register first" });
    }
    const user = users[0];

    if (user.pin_attempts >= 5) {
      return res.status(429).json({
        message: "Too many attempts. Please Request a new PIN",
      });
    }

    if (user.pin_code !== pinTrimmed) {
      await pool.query(
        "UPDATE users SET pin_attempts = pin_attempts + 1 WHERE id = $1",
        [user.id]
      );

      return res.status(403).json({ message: "Invalid PIN" });
    }

    

    const pinAgeMinutes =
      (Date.now() - new Date(user.pin_created_at).getTime()) / 60000;

    if (pinAgeMinutes > 10) {
      return res.status(405).json({ message: "Your PIN has expired, please request a new one" });
    }

    await pool.query(
      "UPDATE users SET is_verified = 1, pin_code = NULL, pin_attempts = 0, pin_created_at = NULL WHERE email = $1",
      [email]
    );

    return res.status(200).json(
      { message: "Email verified Successfully",
        userId: user.id,
        email: user.email,
        username: user.username
       }
    );

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

const resendverifyEmailPin = async (req, res) => {
  try {
    
    const {email} = req.body;
    if(!email){
      return res.status(401).json({ message: "Email is required" });
    }
    const result = await pool.query(
      "SELECT pin_created_at FROM users WHERE email = $1",
      [email]
    );
    const user = result.rows[0];
 
    if(!user){
      return res.status(404).json({ message: "No Registrant found. Please register first" });
    }
    // 🚨 prevent spam (1 min cooldown)
    if (user.pin_created_at) {
      const diff =
        (Date.now() - new Date(user.pin_created_at).getTime()) / 1000;

      if (diff < 60) {
        return res.status(429).json({
          message: "Please wait 1 minutes before requesting new PIN",
        });
      }
    }

    const pinCode = Math.floor(100000 + Math.random() * 900000).toString();

    await pool.query(
      "UPDATE users SET pin_code = $1, pin_created_at = NOW(), pin_attempts = 0 WHERE email = $2",
      [pinCode, email]
    );
   
    try{
      await sendResendPinEmail(email, pinCode);
    }
    catch(EmailError){
      console.error(EmailError);
      return res.status(506).json({ message: "Sever can't send the PIN at this moment. Please try again later" });
    }

    res.status(200).json({ message: "New PIN sent" });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

    // USER FORGET PASSWORD //

//step 1
const forgetPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !email.trim()) {
      return res.status(400).json({ message: "Email is required" });
    }

    const trimmedEmail = email.trim();

    const result = await pool.query(
      "SELECT id, pin_created_at, auth_provider FROM users WHERE email = $1",
      [trimmedEmail]
    );
    const user = result.rows[0];

    if (!user) {
      return res.status(404).json({
        message: "No user found with this Email",
      });
    }

    // OAuth-only account — no password exists to reset
    if (user.auth_provider && user.auth_provider !== 'local') {
      const providerLabel = {
        google: "Google",
        facebook: "Facebook",
        github: "GitHub",
        microsoft: "Microsoft",
      }[user.auth_provider] || user.auth_provider;

      return res.status(409).json({
        message: `This email is registered via ${providerLabel}. Please use "Continue with ${providerLabel}" to log in instead.`
      });
    }

    if (user?.pin_created_at) {
      const diff =
        (Date.now() - new Date(user.pin_created_at).getTime()) / 1000;

      if (diff < 60) {
        return res.status(429).json({
          message: "Please wait before requesting again",
        });
      }
    }

    const pinCode = Math.floor(100000 + Math.random() * 900000).toString();

    await pool.query(
      "UPDATE users SET pin_code = $1, pin_created_at = NOW() WHERE id = $2",
      [pinCode, user.id]
    );

    try{
      await sendVerifyCodeForgetPasswordEmail(trimmedEmail, pinCode);
    }
    catch(EmailError){
      console.error(EmailError);
      return res.status(506).json({ message: "Sever can't send the PIN at this moment. Please try again later" });
    }

    return res.status(200).json({
      message: "A verification code has been sent to your Email",
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

// step 2
const verifyforgetPasswordPin = async (req, res) => {
  try {
    const { email, pin } = req.body;

    if (!email || !pin || pin.trim().length !== 6) {
      return res.status(400).json({ message: "Email and PIN are required" });
    }

    const result = await pool.query(
      "SELECT id, pin_code, pin_created_at, pin_attempts FROM users WHERE email = $1",
      [email.trim()]
    );
    const user = result.rows[0];

  
    if (!user) {
      return res.status(404).json({ message: "No user found with this Email" });
    }

   
    if (user.pin_attempts >= 5) {
      return res.status(429).json({
        message: "Too many attempts, please request a new PIN",
      });
    }

    if (user.pin_code !== pin.trim()) {
      await pool.query(
        "UPDATE users SET pin_attempts = pin_attempts + 1 WHERE id = $1",
        [user.id]
      );

      return res.status(421).json({ message: "Invalid PIN" });
    }

    const pinAgeMinutes =
      (Date.now() - new Date(user.pin_created_at).getTime()) / 60000;

    if (pinAgeMinutes > 10) {
      return res.status(422).json({ message: "Your PIN has expired, please request a new one" });
    }

    // ✅ SUCCESS → clear PIN + attempts
    await pool.query(
      "UPDATE users SET pin_code = NULL, pin_attempts = 0, reset_verified = 1 WHERE id = $1",
      [user.id]
    );

    return res.status(200).json({ message: "PIN verified successfully" });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

const resendForgetPasswordPin = async (req, res) => {
  try {

    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const result = await pool.query(
      "SELECT id, pin_created_at FROM users WHERE email = $1",
      [email.trim()]
    );
    const user = result.rows[0];

    
    if (!user) {
      return res.status(404).json({ message: "No user found with this Email" });
    }

    // ⏱ cooldown 1min
    if (user.pin_created_at) {
      const diff =
        (Date.now() - new Date(user.pin_created_at).getTime()) / 1000;

      if (diff < 60) {
        return res.status(429).json({
          message: "Please wait 1 minutes before requesting a new PIN",
        });
      }
    }

    const pinCode = Math.floor(100000 + Math.random() * 900000).toString();

    await pool.query(
      "UPDATE users SET pin_code = $1, pin_created_at = NOW(), pin_attempts = 0 WHERE id = $2",
      [pinCode, user.id]
    );

    try{
      await sendVerifyCodeForgetPasswordEmail(email, pinCode);
    }
    catch(EmailError){
      console.error(EmailError);
      return res.status(506).json({ message: "Sever can't send the PIN at this moment. Please try again later" });
    }

    return res.status(200).json({ message: "New PIN sent" });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

const setNewPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({ message: "Email and new password are required" });
    }

    // 🔐 strong password check (same as frontend)
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d])[^\s]{8,}$/;

    if (!passwordRegex.test(newPassword)) {
      return res.status(401).json({ message: "Password is not strong enough" });
    }

    const result = await pool.query(
      "SELECT id, reset_verified FROM users WHERE email = $1",
      [email.trim()]
    );
    const user = result.rows[0];

    if (!user || user.reset_verified !== 1) {
      return res.status(403).json({ message: "Unauthorized request" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await pool.query(
      `UPDATE users 
       SET password_hash = $1, reset_verified = 0 
       WHERE id = $2`,
      [hashedPassword, user.id]
    );

    return res.status(200).json({ message: "Password reset successfully" });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};
//  USER WANT TO CHANGE CURRENT PASSWORD
const changePassword = async (req, res) => {
  const {userId} = req.user.userId;
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: "Missing current or new password." });
  }

  const result = await pool.query("SELECT password FROM users WHERE user_id = $1", [userId]);
  const user = result.rows[0];

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    return res.status(401).json({ message: "Incorrect current password." });
  }

  const hashed = await bcrypt.hash(newPassword, 10);
  await pool.query("UPDATE users SET password = $1 WHERE user_id = $2", [hashed, userId]);

  res.json({ message: "Password updated successfully." });
};

const newPassword = async (req, res) => {
  const { email, newPassword, pin } = req.body;

  if (!email || !newPassword || !pin) {
    return res.status(400).json({ message: "Email, PIN, and new password are required" });
  }

  try {
    const normalizedEmail = email.trim().toLowerCase();
    const trimmedPin = pin.trim();

    // Check if the user with matching PIN exists
    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1 AND pin_code = $2",
      [normalizedEmail, trimmedPin]
    );
    const user = result.rows[0];

    if (!user) {
      return res.status(400).json({ message: "Invalid email or PIN" });
    }

    // Check if the PIN is still valid (within 10 minutes)
    const pinAgeMinutes = (Date.now() - new Date(user.pin_created_at).getTime()) / 60000;
    if (pinAgeMinutes > 10) {
      return res.status(400).json({ message: "PIN has expired, please request a new one" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and clear PIN
    await pool.query(
      `UPDATE users SET password = $1, pin_code = NULL, pin_created_at = NULL WHERE email = $2`,
      [hashedPassword, normalizedEmail]
    );

    return res.json({ message: "Password updated successfully. You can now log in." });

  } catch (error) {
    console.error("Error in updatePassword:", error);
    return res.status(500).json({ message: "Server error during password update" });
  }
};

const getUserInfo = async (req, res) => {
  try {
    const userId = req.user.userId;
    const result = await pool.query(
      "SELECT * FROM users WHERE id = $1",
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ userData: result.rows[0] });
  } catch (err) {
    console.error("Error in getUserInfo:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

const updateUser = async (req, res) => {

  try {
    const {
      profession,
      location,
      username, 
      nickname,
      userId,
      email,
      bio,
      avatarType,
    } = req.body;

    if (!profession || !location || !nickname || !userId || !email || !bio) {
      console.warn("[updateUser] Missing required field(s):", {
        profession: !!profession, location: !!location, nickname: !!nickname,
        userId: !!userId, email: !!email, bio: !!bio,
      });
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const currentUserResult = await pool.query(
      `SELECT avatar_url, banner_url FROM users WHERE id = $1 AND email = $2 LIMIT 1`,
      [parseInt(userId), email]
    );

    if (currentUserResult.rows.length === 0) {
      console.warn("[updateUser] No user found for id/email:", { userId, email });
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const currentUser = currentUserResult.rows[0];
    let avatarUrl = currentUser.avatar_url;
    let bannerUrl = currentUser.banner_url;

    console.log("[updateUser] Current DB values:", { avatarUrl, bannerUrl });

    // Banner
    if (req.files?.banner) {
      console.log("[updateUser] Banner file present, uploading...");
      try {
        const uploadedUrl = await convertAndUpload(req.files.banner[0], "banner");
        bannerUrl = uploadedUrl.url;
        console.log("[updateUser] Banner upload success:", bannerUrl);
      } catch (uploadError) {
        console.error("[updateUser] Banner upload FAILED:", uploadError.message);
        return res.status(500).json({
          success: false,
          message: "Failed to upload banner image",
        });
      }
    } else if (req.body.banner) {
      console.log("[updateUser] No banner file, using existing URL from body:", req.body.banner);
      bannerUrl = req.body.banner;
    } else {
      console.log("[updateUser] No banner file or URL sent, keeping current:", bannerUrl);
    }

    // Avatar
    if (avatarType === 'file' && req.files?.avatar) {
      console.log("[updateUser] Avatar file present, uploading...");
      try {
        const uploadedUrl = await convertAndUpload(req.files.avatar[0], "avatar");
        avatarUrl = uploadedUrl.url;
        console.log("[updateUser] Avatar upload success:", avatarUrl);
      } catch (uploadError) {
        console.error("[updateUser] Avatar upload FAILED:", uploadError.message);
        return res.status(500).json({
          success: false,
          message: "Failed to upload avatar image",
        });
      }
    } else if (avatarType === 'url' && req.body.avatar) {
      console.log("[updateUser] Using avatar URL from body:", req.body.avatar);
      avatarUrl = req.body.avatar;
    } else {
      console.log("[updateUser] No avatar file or URL sent, keeping current:", avatarUrl);
    }

    const nicknameResult = await pool.query(
      `SELECT id FROM users WHERE nickname = $1 AND id != $2 LIMIT 1`,
      [nickname, userId]
    );

    if (nicknameResult.rows.length > 0) {
      console.warn("[updateUser] Nickname taken:", nickname);
      return res.status(409).json({
        success: false,
        message: "Nickname already taken",
      });
    }
    await pool.query(
      `
      UPDATE users
      SET
        avatar_url = $1,
        banner_url = $2,
        profession = $3,
        work_place = $4,
        username = $5,
        nickname = $6,
        bio = $7,
        updated_at = NOW()
      WHERE id = $8
      AND email = $9
      `,
      [avatarUrl, bannerUrl, profession, location, username, nickname, bio, parseInt(userId), email]
    );
    return res.status(200).json({
      message: "Profile updated successfully",
    });
  } catch (err) {
    console.error("[updateUser] UNCAUGHT ERROR:", {
      message: err.message,
      code: err.code,
      detail: err.detail,
      stack: err.stack,
    });
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const getCurrentMonthKey = () => {
  const now = new Date();
  return `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;
};

const getUserInfoById = async (req, res) => {
  try {
    const userId = req.params.userId;

    const result = await pool.query(
      `
      SELECT 
        u.username,
        u.avatar_url,
        u.id,
        u.nickname,
        u.banner_url,
        u.profession,
        u.work_place,
        u.bio,
        u.created_at,
        u.followers_count,
        u.following_count,
        COUNT(p.id) as post_count
      FROM users u
      LEFT JOIN posts p ON u.id = p.user_id
      WHERE u.id = $1
      GROUP BY u.id
      `,
      [userId]
    );

    if (!result.rows.length) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    // Fetch THIS profile's rank/score from the live Redis leaderboard —
    // scoped to userId (the profile being viewed), not req.user.userId (the logged-in viewer)
    const redisKey = `hof:month:${getCurrentMonthKey()}`;

    const [totalMembers, ascendingRank, score] = await Promise.all([
      ranking.zCard(redisKey),
      ranking.zRank(redisKey, userId.toString()),
      ranking.zScore(redisKey, userId.toString()),
    ]);

    let rank = null;
    let badgeTier = null;

    if (ascendingRank !== null && score !== null) {
      const descendingRankZeroBased = totalMembers - 1 - ascendingRank;
      rank = descendingRankZeroBased + 1;
      badgeTier = rank <= 10 ? rank : null;
    }

    return res.status(200).json({
      userData: {
        ...result.rows[0],
        rank,
        score: score !== null ? Number(score) : 0,
        badgeTier,
      }
    });

  } catch (err) {
    console.error("Error in getUserInfo:", err);
    return res.status(500).json({
      message: "Server error"
    });
  }
};



// ============================================================
// LinkedIn OAuth — step 1: redirect user to LinkedIn's authorize page
// ============================================================
const linkedinRedirect = (req, res) => {
  const { client_state: clientState } = req.query;
  if (
    !process.env.LINKEDIN_CLIENT_ID ||
    !process.env.LINKEDIN_CLIENT_SECRET ||
    !process.env.LINKEDIN_CALLBACK_URL
  ) {
    return redirectOAuthError(res, "linkedin_unavailable");
  }
  if (typeof clientState !== "string" || !/^[a-f0-9]{64}$/i.test(clientState)) {
    return redirectOAuthError(res, "linkedin_invalid_state");
  }

  // LinkedIn now uses OpenID Connect (OIDC) — scopes: openid, profile, email
  const state = crypto.randomBytes(32).toString("hex");
  setOAuthStateCookie(req, res, "linkedin", state, clientState);
  const params = new URLSearchParams({
    response_type: "code",
    client_id: process.env.LINKEDIN_CLIENT_ID,
    redirect_uri: process.env.LINKEDIN_CALLBACK_URL,
    scope: "openid profile email",
    state,
  });

  res.redirect(
    `https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`
  );
};

// ============================================================
// LinkedIn OAuth — step 2: handle callback
// ============================================================
const linkedinCallback = async (req, res) => {
  const callbackStartedAt = Date.now();
  console.info("[OAuth:linkedin] callback received");
  const { code, state, error } = req.query;
  const clientState = consumeOAuthStateCookie(req, res, "linkedin", state);
  if (!clientState) {
    console.warn("[OAuth:linkedin] callback rejected: invalid state");
    return redirectOAuthError(res, "linkedin_invalid_state");
  }
  if (error) {
    console.info("[OAuth:linkedin] authorization denied", {
      elapsedMs: Date.now() - callbackStartedAt,
    });
    return redirectOAuthError(res, "linkedin_denied");
  }

  try {
    if (typeof code !== "string" || !code) {
      console.warn("[OAuth:linkedin] callback rejected: missing code");
      return redirectOAuthError(res, "linkedin_no_code");
    }

    // --- Exchange code for access token ---
    let tokenData;
    const tokenRequestStartedAt = Date.now();
    try {
      const tokenRes = await axios.post(
        "https://www.linkedin.com/oauth/v2/accessToken",
        new URLSearchParams({
          grant_type: "authorization_code",
          code,
          redirect_uri: process.env.LINKEDIN_CALLBACK_URL,
          client_id: process.env.LINKEDIN_CLIENT_ID,
          client_secret: process.env.LINKEDIN_CLIENT_SECRET,
        }),
        {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          timeout: 10000,
        }
      );
      tokenData = tokenRes.data;
      console.info("[OAuth:linkedin] token exchange completed", {
        elapsedMs: Date.now() - tokenRequestStartedAt,
      });
    } catch (tokenErr) {
      console.error(
        "LinkedIn token exchange failed:",
        tokenErr.response?.data || tokenErr.message
      );
      console.info("[OAuth:linkedin] token exchange failed", {
        elapsedMs: Date.now() - tokenRequestStartedAt,
      });
      return redirectOAuthError(res, "linkedin_token_failed");
    }

    const { access_token } = tokenData;
    if (!access_token) {
      return redirectOAuthError(res, "linkedin_token_failed");
    }

    // --- Fetch user info via OIDC userinfo endpoint ---
    let profile;
    const profileRequestStartedAt = Date.now();
    try {
      const profileRes = await axios.get(
        "https://api.linkedin.com/v2/userinfo",
        { headers: { Authorization: `Bearer ${access_token}` } }
      );
      profile = profileRes.data;
      console.info("[OAuth:linkedin] profile request completed", {
        elapsedMs: Date.now() - profileRequestStartedAt,
      });
    } catch (profileErr) {
      console.error(
        "LinkedIn profile fetch failed:",
        profileErr.response?.data || profileErr.message
      );
      console.info("[OAuth:linkedin] profile request failed", {
        elapsedMs: Date.now() - profileRequestStartedAt,
      });
      return redirectOAuthError(res, "linkedin_profile_failed");
    }

    // OIDC response shape:
    // { sub, name, given_name, family_name, picture, locale, email, email_verified }
    const {
      sub: providerId,
      email,
      name,
      picture,
      email_verified,
    } = profile;

    if (
      typeof email !== "string" ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
      email_verified !== true
    ) {
      return redirectOAuthError(res, "linkedin_no_verified_email");
    }

    // --- Find or create user ---
    const normalizedEmail = email.trim().toLowerCase();
    const existing = await pool.query(
      "SELECT * FROM users WHERE lower(email) = $1",
      [normalizedEmail]
    );
    let user;
    let isNewUser = false;

    if (existing.rows.length > 0) {
      user = existing.rows[0];

      if (user.auth_provider === "local" || !user.auth_provider) {
        return redirectOAuthError(res, "email_registered_local");
      }

      if (user.auth_provider !== "linkedin") {
        return redirectOAuthError(res, "email_registered_other");
      }

      if (String(user.provider_id) !== String(providerId)) {
        return redirectOAuthError(res, "provider_account_mismatch");
      }
    } else {
      isNewUser = true;

      const generatePlaceholderUsername = () =>
        `user_${crypto.randomBytes(4).toString("hex")}`;
      let usernameBase = generatePlaceholderUsername();

      let attempts = 0;
      while (attempts < 5) {
        const check = await pool.query(
          "SELECT id FROM users WHERE username = $1",
          [usernameBase]
        );
        if (check.rows.length === 0) break;
        usernameBase = generatePlaceholderUsername();
        attempts++;
      }

      const insertResult = await pool.query(
        `INSERT INTO users
          (username, email, password_hash, is_verified, auth_provider, provider_id, avatar_url)
         VALUES ($1, $2, NULL, 1, 'linkedin', $3, $4)
         RETURNING *`,
        [usernameBase, normalizedEmail, providerId, picture || null]
      );
      user = insertResult.rows[0];
    }

    const handoffResponse = await issueOAuthHandoff(res, user, isNewUser, clientState);
    console.info("[OAuth:linkedin] callback completed", {
      elapsedMs: Date.now() - callbackStartedAt,
    });
    return handoffResponse;
  } catch (error) {
    console.error("LinkedIn OAuth callback failed:", error.message);
    console.info("[OAuth:linkedin] callback failed", {
      elapsedMs: Date.now() - callbackStartedAt,
    });
    return redirectOAuthError(res, "server_error");
  }
};


// ============================================================
// LinkedIn OAuth login/register (client-side token flow)
// ============================================================
const linkedinLogin = async (req, res) => {
  try {
    const { accessToken } = req.body;

    if (!accessToken) {
      return res.status(400).json({ message: "Missing LinkedIn access token" });
    }

    let profile;
    try {
      // Optional: verify token is valid by calling userinfo
      const profileRes = await axios.get(
        "https://api.linkedin.com/v2/userinfo",
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      profile = profileRes.data;
    } catch (verifyErr) {
      console.error(
        "LinkedIn verification failed:",
        verifyErr.response?.data || verifyErr.message
      );
      return res.status(401).json({ message: "Invalid LinkedIn token" });
    }

    const {
      sub: providerId,
      email,
      name,
      picture,
      email_verified,
    } = profile;

    if (!email || email_verified === false) {
      return res.status(400).json({
        message:
          "Your LinkedIn account has no verified email attached. Please register with email instead.",
      });
    }

    const existing = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );
    let user;
    let isNewUser = false;

    if (existing.rows.length > 0) {
      user = existing.rows[0];

      if (user.auth_provider === "local" || !user.auth_provider) {
        return res.status(409).json({
          message:
            "This email is already registered. Please log in with your password instead.",
        });
      }

      if (user.auth_provider !== "linkedin") {
        return res.status(409).json({
          message: `This email is already registered via ${user.auth_provider}. Please use that method to log in.`,
        });
      }
    } else {
      isNewUser = true;

      const generatePlaceholderUsername = () =>
        `user_${crypto.randomBytes(4).toString("hex")}`;
      let usernameBase = generatePlaceholderUsername();

      let attempts = 0;
      while (attempts < 5) {
        const check = await pool.query(
          "SELECT id FROM users WHERE username = $1",
          [usernameBase]
        );
        if (check.rows.length === 0) break;
        usernameBase = generatePlaceholderUsername();
        attempts++;
      }

      const insertResult = await pool.query(
        `INSERT INTO users
          (username, email, password_hash, is_verified, auth_provider, provider_id, avatar_url)
         VALUES ($1, $2, NULL, 1, 'linkedin', $3, $4)
         RETURNING *`,
        [usernameBase, email, providerId, picture || null]
      );
      user = insertResult.rows[0];
    }

    const token = createToken({ userId: user.id });

    return res.status(200).json({
      message: "Login Successfully",
      token,
      isNewUser,
      userId: user.id,
      email: user.email,
      username: user.username,
    });
  } catch (error) {
    console.error("linkedinLogin error:", error);
    return res.status(500).json({ message: "Server Error, Please try again later" });
  }
};


module.exports = {
  
    login,
    register,
    verifyEmail,
    resendverifyEmailPin,

    // forget password process

    // step 1
    forgetPassword,
    //step 2
    verifyforgetPasswordPin,
    // step 2.1 if user miss the first Pin request for new one
    resendForgetPasswordPin,
    // last step or step 3
    setNewPassword,

    // user want to change current password
      changePassword,
      newPassword,

      updateUser,

    // get user info
      getUserInfo,
      getUserInfoById,

    // OAuth

      // Google OAuth
      googleLogin,

      // Facebook OAuth
      facebookLogin,

      // GitHub OAuth
      githubRedirect,
      githubCallback,

      // Microsoft OAuth
      microsoftRedirect,
      microsoftCallback,
      exchangeOAuthHandoff,

      // linkedin
      linkedinRedirect,   
      linkedinCallback,  

}