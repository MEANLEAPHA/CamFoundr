const appId = import.meta.env.VITE_FACEBOOK_APP_ID;
let sdkPromise;
let initializedAppId;

const isConfiguredAppId = (value) => typeof value === "string" && /^\d+$/.test(value);

const initializeFacebookSdk = () => {
  if (!window.FB) {
    throw new Error("Facebook SDK did not initialize");
  }

  if (initializedAppId !== appId) {
    window.FB.init({
      appId,
      cookie: true,
      xfbml: false,
      version: "v24.0",
    });
    initializedAppId = appId;
  }

  return window.FB;
};

export const loadFacebookSdk = () => {
  if (!isConfiguredAppId(appId)) {
    return Promise.reject(
      new Error("Facebook sign-in is not configured with a valid app ID")
    );
  }
  if (sdkPromise) {
    return sdkPromise;
  }

  sdkPromise = new Promise((resolve, reject) => {
    let settled = false;
    const initialize = () => {
      if (settled) return;
      try {
        resolve(initializeFacebookSdk());
        settled = true;
      } catch (error) {
        settled = true;
        reject(error);
      }
    };

    let script = document.querySelector(
      'script[data-camfoundr-facebook-sdk="true"]'
    );

    if (window.FB) {
      initialize();
      return;
    }

    const previousAsyncInit = window.fbAsyncInit;
    window.fbAsyncInit = () => {
      initialize();
      if (typeof previousAsyncInit === "function") {
        previousAsyncInit();
      }
    };

    if (!script) {
      script = document.createElement("script");
      script.src = "https://connect.facebook.net/en_US/sdk.js";
      script.async = true;
      script.defer = true;
      script.dataset.camfoundrFacebookSdk = "true";
    }

    script.addEventListener("load", initialize, { once: true });
    script.addEventListener(
      "error",
      () => reject(new Error("Could not load Facebook SDK")),
      { once: true }
    );

    if (!script.isConnected) {
      document.head.appendChild(script);
    }
  }).catch((error) => {
    sdkPromise = null;
    throw error;
  });

  return sdkPromise;
};
