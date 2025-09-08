// src/contexts/AuthContext.jsx
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "./api"; // axios 대신 우리가 만든 api 인스턴스를 가져옵니다.
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

        // 인터셉터가 헤더를 자동으로 추가해주므로, 헤더 설정이 필요 없습니다.
        api.get("/api/auth/me")
            .then(res => setUser(res.data.user))
            .catch(() => { localStorage.removeItem("token"); setToken(null); setUser(null); })
            .finally(() => setLoading(false));
    }, []);

    // 구글 ID 토큰으로 로그인(서버 인증)
    const loginWithGoogle = async (googleIdToken) => {
        setError(null);
        try {
            // 1. 구글 ID 토큰을 서버로 보내 우리 앱의 토큰(appToken)을 받습니다.
            const res = await api.post("/api/auth/google", { token: googleIdToken });
            const { appToken } = res.data; // user 객체는 여기서 사용하지 않습니다.
            localStorage.setItem("token", appToken);
            setToken(appToken);

            // --- 여기에서 토큰 payload를 확인합니다 ---
            console.log("서버로부터 받은 JWT:", appToken);
            try {
                const payload = JSON.parse(atob(appToken.split('.')[1]));
                console.log("JWT Payload (사용자 정보):", payload);
            } catch (e) {
                console.error("JWT 디코딩 실패:", e);
            }
            // -----------------------------------------

            // 2. 방금 받은 appToken을 사용하여, 서버에서 완전한 사용자 정보를 다시 조회합니다.
            const meResponse = await api.get("/api/auth/me");
            const user = meResponse.data.user;
            console.log("[AuthContext] 🟡 2-1. refreshUser 실행: 서버로부터 받은 새 user 객체", user);
            // React가 상태 변경을 확실히 감지하도록 항상 새로운 객체 참조를 생성합니다.
            setUser({ ...user });
            console.log("[AuthContext] 🟡 2-2. refreshUser: 전역 user 상태(state) 업데이트 완료.");

            return user;
        } catch (e) {
            setError(e.response?.data || e.message);
            // 로그인 실패 시 토큰/사용자 정보 정리
            localStorage.removeItem("token");
            setToken(null);
            setUser(null);
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

    // [추가] MyPage 등 다른 곳에서 프로필을 수정한 후,
    // AuthContext의 user 상태를 최신으로 동기화하기 위한 함수입니다.
    const refreshUser = async () => {
        try {
            const meResponse = await api.get("/api/auth/me");
            const user = meResponse.data.user;
            // [최종 수정] React가 상태 변경을 확실히 감지하도록 항상 새로운 객체 참조를 생성합니다.
            // 이전 user 객체와 내용이 완전히 같더라도, {...user}는 새로운 메모리 주소를 가진
            // 객체를 생성하므로, 이 상태를 구독하는 useEffect가 반드시 실행됩니다.
            setUser({ ...user }); 
            console.log("[AuthContext] User state has been refreshed.");
            return user; // [CRITICAL] Return the newly fetched user object.
        } catch (e) {
            console.error("[AuthContext] Failed to refresh user state:", e);
            return null; // Return null on failure.
        }
    };

    const value = useMemo(() => ({
        user, token, loading, error,
        loginWithGoogle, logout, refreshUser,
        isAuthenticated: !!user
    }), [user, token, loading, error, refreshUser]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}