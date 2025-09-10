import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from "react";
import { useAuth } from "../AuthContext";
import { api } from "../api"; // api import 추가

// 1. Context 객체 생성
const MyPageContext = createContext(null);

// 2. Provider 컴포넌트 생성
export const MyPageProvider = ({ children }) => {
  const { user: loggedInUser, refreshUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const loadProfile = useCallback(async () => {
    // [되돌리기] 로그인한 유저가 없으면 아무것도 하지 않습니다.
    if (!loggedInUser) {
      setLoading(false);
      setProfile(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // [되돌리기] 항상 '나의' 프로필 정보를 불러오는 API를 호출합니다.
      const response = await api.get(`/api/user/profile`);
      setProfile(response.data);
    } catch (err) {
      console.error(`[MyPageContext] 프로필 로딩 실패:`, err);
      setError("프로필 정보를 불러오는 데 실패했습니다.");
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, [loggedInUser]); // [되돌리기] 이제 이 함수는 오직 loggedInUser에만 의존합니다.

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const updateProfile = async (profileData, { profileImageFile, bannerImageFile, revertToDefault = {} }) => {
    if (!loggedInUser) {
      const err = new Error("사용자 인증 정보가 없어 프로필을 업데이트할 수 없습니다.");
      setError(err.message);
      throw err;
    }

    try {
      const formData = new FormData();
      formData.append(
        "request",
        new Blob([JSON.stringify(profileData)], { type: "application/json" })
      );

      if (profileImageFile) formData.append("profileImage", profileImageFile);
      if (bannerImageFile) formData.append("bannerImage", bannerImageFile);

      if (revertToDefault.profileImage) formData.append("revertProfileImage", "true");
      if (revertToDefault.bannerImage) formData.append("revertBannerImage", "true");

      await api.put(`/api/user/profile`, formData);

      await refreshUser(); // 전역 상태 업데이트
      await loadProfile(); // 현재 Context의 프로필 다시 로드
      setIsEditing(false); // 수정 완료 후 보기 모드로 전환
    } catch (err) {
      console.error("[MyPageContext] updateProfile 오류", err);
      const message = err.response?.data?.message || "프로필 업데이트 중 오류 발생";
      setError(message);
      throw err;
    }
  };

  // 수정 모드 진입/취소 핸들러
  const handleEdit = () => setIsEditing(true);
  const handleCancel = () => setIsEditing(false);

  // Provider가 제공할 값들
  const value = {
    profile,
    loading,
    error,
    userId: loggedInUser?.id, // [되돌리기] 항상 로그인한 유저의 ID를 전달합니다.
    updateProfile,
    isEditing,
    handleEdit,
    handleCancel,
  };

  return <MyPageContext.Provider value={value}>{children}</MyPageContext.Provider>;
};

// 3. Custom Hook 생성
export const useMyPage = () => {
  const context = useContext(MyPageContext);
  if (!context) {
    throw new Error("useMyPage must be used within a MyPageProvider");
  }
  return context;
};