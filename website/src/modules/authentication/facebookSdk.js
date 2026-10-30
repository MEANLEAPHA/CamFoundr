const appId = import.meta.env.VITE_FACEBOOK_APP_ID;
let sdkPromise;

export const loadFacebookSdk = () => {
  if (!appId) {
    return Promise.reject(new Error("Facebook sign-in is not configured"));
  }
  if (window.FB) {
    return Promise.resolve(window.FB);
  }
  if (sdkPromise) {
    return sdkPromise;
  }

  sdkPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://connect.facebook.net/en_US/sdk.js";
    script.async = true;
    script.defer = true;

    script.onload = () => {
      try {
        if (!window.FB) {
          throw new Error("Facebook SDK did not initialize");
        }
        window.FB.init({
          appId,
          cookie: true,
          xfbml: false,
          version: "v24.0",
        });
        resolve(window.FB);
      } catch (error) {
        sdkPromise = null;
        reject(error);
      }
    };

    script.onerror = () => {
      sdkPromise = null;
      reject(new Error("Could not load Facebook SDK"));
    };

    document.head.appendChild(script);
  });

  return sdkPromise;
};
