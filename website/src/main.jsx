import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthProvider } from "./context/authContext.jsx";
import { NotificationProvider } from "./context/notificationContext.jsx";
import { RankingProvider } from "./context/rankContext.jsx";
import App from './App.jsx';

const main = document.getElementById('root');
const root = createRoot(main);

root.render(
  <StrictMode>
    <AuthProvider>
      <NotificationProvider>
        <RankingProvider>
          <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
            <App />
          </GoogleOAuthProvider>
        </RankingProvider>
      </NotificationProvider>
    </AuthProvider>
  </StrictMode>
);
