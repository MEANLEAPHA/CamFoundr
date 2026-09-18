// utils/auth.js
export default function getToken() {
  const token = localStorage.getItem("token");
  const expiry = localStorage.getItem("tokenExpiry");

  if (!token || !expiry) return null;

  if (Date.now() > parseInt(expiry, 10)) {
    // expired → clear it
    localStorage.removeItem("token");
    localStorage.removeItem("tokenExpiry");
    return null;
  }

  return token;
}
