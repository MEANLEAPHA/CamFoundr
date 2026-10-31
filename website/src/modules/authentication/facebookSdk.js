const appId = import.meta.env.VITE_FACEBOOK_APP_ID;
let sdkPromise;
let initializedAppId;

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
  if (!appId) {
    return Promise.reject(new Error("Facebook sign-in is not configured"));
  }
  if (sdkPromise) {
    return sdkPromise;
  }

  sdkPromise = new Promise((resolve, reject) => {
    const initialize = () => {
      try {
        resolve(initializeFacebookSdk());
      } catch (error) {
        reject(error);
      }
    };

    if (window.FB) {
      initialize();
      return;
    }

    let script = document.querySelector(
      'script[data-camfoundr-facebook-sdk="true"]'
    );
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
