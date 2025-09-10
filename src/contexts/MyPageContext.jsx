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
export const MyPageProvider = ({ children, userId }) => { // [수정] userId prop을 받습니다.
  const { user: loggedInUser, refreshUser, myPageViewRequest } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const loadProfile = useCallback(async (targetUserId) => {
    setLoading(true);
    setError(null);

    // [수정] userId 유무에 따라 API 엔드포인트를 결정합니다.
    // targetUserId가 있으면 친구 프로필, 없으면 내 프로필을 요청합니다.
    // 내 프로필은 /api/user/profile, 친구 프로필은 /api/users/profile/{id}
    const endpoint = targetUserId ? `/api/users/profile/${targetUserId}` : `/api/user/profile`;

    try {
      const response = await api.get(endpoint);
      setProfile(response.data);
    } catch (err) {
      console.error(`[MyPageContext] 프로필 로딩 실패:`, err);
      const message = err.response?.status === 404
          ? "존재하지 않는 사용자입니다."
          : "프로필 정보를 불러오는 데 실패했습니다.";
      setError(message);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, []); // [수정] 이 함수는 이제 외부 의존성이 없으므로 빈 배열을 사용합니다.

  useEffect(() => {
    // [수정] userId가 변경될 때마다 적절한 프로필을 로드합니다.
    // userId가 undefined이면(내 페이지) loadProfile()을 호출하고,
    // userId가 있으면(친구 페이지) loadProfile(userId)를 호출합니다.
    // loggedInUser가 로드된 이후에 프로필을 가져옵니다.
    if (userId || loggedInUser) {
        loadProfile(userId);
    }
  }, [userId, loggedInUser?.id, loadProfile]); // [수정] loggedInUser 객체 대신 id에 의존하여 불필요한 재실행 방지

  // [추가] AuthContext의 신호를 감지하여 isEditing 상태를 false로 되돌리는 useEffect
  useEffect(() => {
    // myPageViewRequest가 0이 아닐 때만 (초기 렌더링 방지) 실행
    if (myPageViewRequest > 0) {
      handleCancel();
    }
  }, [myPageViewRequest]); // myPageViewRequest 값이 바뀔 때마다 실행

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

      // [수정] 프로필 업데이트 API 경로도 일관성을 위해 'users'로 변경합니다.
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

  // [추가] 현재 보고 있는 페이지가 로그인한 사용자의 페이지인지 판별합니다.
  const isOwner = !userId || (loggedInUser && loggedInUser.id === profile?.id);

  // Provider가 제공할 값들
  const value = {
    profile,
    loading,
    error,
    isOwner, // [수정] isOwner 값을 제공합니다.
    // userId는 더 이상 제공할 필요가 없습니다.
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