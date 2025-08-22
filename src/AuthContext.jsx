// src/contexts/AuthContext.jsx
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { googleLogout } from "@react-oauth/google";

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export default function AuthProvider({ children }) {
    const [user, setUser] = useState(null);     // 사용자 정보
    const [token, setToken] = useState(null);   // 우리 서비스 전용 토큰(appToken)
    const [loading, setLoading] = useState(true);
    const [error, setError]   = useState(null);

    // 앱 시작 시 localStorage에서 토큰 복구 → 사용자 정보 조회
    useEffect(() => {
        const t = localStorage.getItem("token");
        if (!t) { setLoading(false); return; }

        setToken(t);
        axios.get("/api/auth/me", { headers: { Authorization: `Bearer ${t}` } })
            .then(res => setUser(res.data.user))
            .catch(() => { localStorage.removeItem("token"); setToken(null); setUser(null); })
            .finally(() => setLoading(false));
    }, []);

    // 토큰이 바뀔 때 axios 기본 헤더 세팅(공통)
    useEffect(() => {
        if (token) {
            axios.defaults.headers.common.Authorization = `Bearer ${token}`;
        } else {
            delete axios.defaults.headers.common.Authorization;
        }
    }, [token]);

    // 구글 ID 토큰으로 로그인(서버 인증)
    const loginWithGoogle = async (googleIdToken) => {
        setError(null);
        try {
            const res = await axios.post("/api/auth/google", { token: googleIdToken });
            const { appToken, user } = res.data;     // 서버가 준 우리 서비스 토큰 + 유저
            localStorage.setItem("token", appToken);
            setToken(appToken);
            setUser(user);
            return user;
        } catch (e) {
            setError(e.response?.data || e.message);
            throw e;
        }
    };

    // 로그아웃
    const logout = () => {
        googleLogout();            // 구글 세션도 정리
        localStorage.removeItem("token");
        setToken(null);
        setUser(null);
    };

    const value = useMemo(() => ({
        user, token, loading, error,
        loginWithGoogle, logout,
        isAuthenticated: !!user
    }), [user, token, loading, error]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}