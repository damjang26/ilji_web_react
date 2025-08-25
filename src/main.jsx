import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import App from './App.jsx'
import {GoogleOAuthProvider} from '@react-oauth/google';
import AuthProvider from './AuthContext.jsx';
import {ScheduleProvider} from "./contexts/ScheduleContext.jsx";

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
console.log('Client ID loaded:', googleClientId);

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <GoogleOAuthProvider clientId={googleClientId}>
            <AuthProvider>
                <ScheduleProvider>
                    <App/>
                </ScheduleProvider>
            </AuthProvider>
        </GoogleOAuthProvider>
    </StrictMode>,
)
