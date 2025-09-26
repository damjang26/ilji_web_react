// src/contexts/AuthContext.jsx
import { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import { api, getFollowingList } from "./api"; // [추가] getFollowingList import
import { googleLogout } from "@react-oauth/google";

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export default function AuthProvider({ children }) {
    const [user, setUser] = useState(null);     // 사용자 정보
    const [token, setToken] = useState(null);   // 우리 서비스 전용 토큰(appToken)
    const [loading, setLoading] = useState(true);
    const [postChangeSignal, setPostChangeSignal] = useState(0); // [추가] 게시물 변경 신호
    const [myPageViewRequest, setMyPageViewRequest] = useState(0); // [추가] 마이페이지 뷰 요청 신호
    const [error, setError]   = useState(null);
    const [following, setFollowing] = useState([]); // [추가] '나'의 팔로잉 목록 상태

    // [추가] '나'의 팔로잉 목록을 가져오는 함수
    const fetchMyFollowing = useCallback(async () => {
        if (!localStorage.getItem("token")) return; // 토큰 없으면 실행 안함
        try {
            const response = await getFollowingList(); // userId 없이 호출하면 '나'의 목록을 가져옴
            setFollowing(response.data);
        } catch (e) {
            console.error("Failed to fetch following list.", e);
            setFollowing([]); // 실패 시 목록을 비웁니다.
        }
    }, []);

    // 앱 시작 시 localStorage에서 토큰 복구 → 사용자 정보 조회
    useEffect(() => {
        const t = localStorage.getItem("token");
        if (!t) { setLoading(false); return; }

        api.get("/api/auth/me")
            .then(res => { setUser(res.data.user); fetchMyFollowing(); }) // [수정] 사용자 정보 로드 후 팔로잉 목록도 가져옴
            .catch(() => { localStorage.removeItem("token"); setToken(null); setUser(null); })
            .finally(() => setLoading(false));
    }, [fetchMyFollowing]); // fetchMyFollowing을 의존성 배열에 추가

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
            // console.log("서버로부터 받은 JWT:", appToken);
            try {
                const payload = JSON.parse(atob(appToken.split('.')[1]));
                // console.log("JWT Payload (사용자 정보):", payload);
            } catch (e) {
                console.error("JWT decoding failed:", e);
            }
            // -----------------------------------------

            // 2. 방금 받은 appToken을 사용하여, 서버에서 완전한 사용자 정보를 다시 조회합니다.
            const meResponse = await api.get("/api/auth/me");
            const user = meResponse.data.user;
            // console.log("[AuthContext] 🟡 2-1. refreshUser 실행: 서버로부터 받은 새 user 객체", user);
            // React가 상태 변경을 확실히 감지하도록 항상 새로운 객체 참조를 생성합니다.
            setUser({ ...user });
            // console.log("[AuthContext] 🟡 2-2. refreshUser: 전역 user 상태(state) 업데이트 완료.");
            await fetchMyFollowing(); // [추가] 로그인 성공 후 팔로잉 목록도 가져옴

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
        setFollowing([]); // [추가] 로그아웃 시 팔로잉 목록 초기화
    };

    // [추가] MyPage 등 다른 곳에서 프로필을 수정한 후, AuthContext의 user 상태를 최신으로 동기화하기 위한 함수
    const refreshUser = async () => {
        try {
            const meResponse = await api.get("/api/auth/me");
            const user = meResponse.data.user; // [수정] 다른 로직과 일관되게 .user에서 객체를 가져옵니다.
            // React가 상태 변경을 확실히 감지하도록 항상 새로운 객체 참조를 생성,
            // 이전 user 객체와 내용이 완전히 같더라도, {...user}는 새로운 메모리 주소를 가진 객체를 생성하므로, 이 상태를 구독하는 useEffect가 반드시 실행
            setUser({ ...user });
            // console.log("[AuthContext] User state has been refreshed.");
            await fetchMyFollowing(); // [추가] 사용자 정보 새로고침 시 팔로잉 목록도 새로고침
            return user; // [CRITICAL] Return the newly fetched user object.
        } catch (e) {
            console.error("[AuthContext] Failed to refresh user state:", e);
            return null; // Return null on failure.
        }
    };

    // [추가] 사이드바 등 다른 컴포넌트가 마이페이지 뷰로 돌아가고 싶을 때 호출하는 함수
    const requestMyPageView = () => {
        setMyPageViewRequest(prev => prev + 1); // 상태를 변경하여 useEffect를 트리거
    };

    // [추가] 게시물 생성/수정/삭제 시 호출하여 전역 신호를 발생시키는 함수
    const triggerPostChange = useCallback(() => {
        setPostChangeSignal(prev => prev + 1);
    }, []);

    const value = useMemo(() => ({
        user, token, loading, error, following, // [추가] following 상태 제공
        loginWithGoogle, logout, refreshUser,
        fetchMyFollowing, // [추가] 팔로잉 목록 새로고침 함수 제공
        isAuthenticated: !!user,
        myPageViewRequest, // 신호 상태
        requestMyPageView, // 신호 보내기 함수
        postChangeSignal, // [추가] 신호 상태 제공
        triggerPostChange, // [추가] 신호 발생 함수 제공
    }), [user, token, loading, error, following, refreshUser, fetchMyFollowing, myPageViewRequest, postChangeSignal, triggerPostChange]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}