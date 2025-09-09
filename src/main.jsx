import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "antd/dist/reset.css";
import App from "./App.jsx";
import { GoogleOAuthProvider } from "@react-oauth/google";
import AuthProvider from "./AuthContext.jsx";
import { ScheduleProvider } from "./contexts/ScheduleContext.jsx";
import { TagProvider } from "./contexts/TagContext.jsx"; // TagProvider import

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
("Client ID loaded:", googleClientId);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={googleClientId}>
      <AuthProvider>
        <ScheduleProvider>
          <TagProvider>
            <App />
          </TagProvider>
        </ScheduleProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  </StrictMode>
);
