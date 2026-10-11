// authStore.js
let currentToken = null;
let logoutHandler = null;
let redirectHandler = null;
let isHydrated = false;

// runs immediately when this module is first imported —
// i.e. before any component's useEffect has a chance to fire.
function hydrate() {
  try {
    const savedToken = localStorage.getItem('token');
    const expiry = Number(localStorage.getItem('tokenExpiry'));
    if (savedToken && expiry && Date.now() < expiry) {
      currentToken = savedToken;
    }
  } finally {
    isHydrated = true;
  }
}
hydrate();

export const authStore = {
  setToken(token) {
    currentToken = token;
  },
  getToken() {
    return currentToken;
  },
  isHydrated() {
    return isHydrated;
  },
  registerLogoutHandler(fn) {
    logoutHandler = fn;
  },
  registerRedirectHandler(fn) {
    redirectHandler = fn;
  },
  triggerLogout() {
    logoutHandler?.();
  },
  triggerRedirectToLogin() {
    redirectHandler?.();
  },
};
// let currentToken = null;
// let logoutHandler = null;
// let redirectHandler = null;

// export const authStore = {
//   setToken(token) {
//     currentToken = token;
//   },
//   getToken() {
//     return currentToken;
//   },
//   registerLogoutHandler(fn) {
//     logoutHandler = fn;
//   },
//   registerRedirectHandler(fn) {
//     redirectHandler = fn;
//   },
//   triggerLogout() {
//     logoutHandler?.();
//   },
//   triggerRedirectToLogin() {
//     redirectHandler?.();
//   },
// };