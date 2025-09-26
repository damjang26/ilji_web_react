import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from "react";
import { useAuth } from "../AuthContext";
import { api } from "../api";


// 1. Context 객체 생성
const MyPageContext = createContext(null);

// 2. Provider 컴포넌트 생성
export const MyPageProvider = ({ children, userId }) => { // [수정] userId prop을 받습니다.
  const { user: loggedInUser, refreshUser, myPageViewRequest } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // [추가] 현재 보고 있는 페이지가 로그인한 사용자의 페이지인지 판별합니다.
  // 이 값은 프로필 로딩 전에도 필요하므로 먼저 계산합니다.
  const isOwner = !userId || (loggedInUser && Number(userId) === loggedInUser.id);

  const loadProfile = useCallback(async (targetUserId) => {
    setLoading(true);
    setError(null);

    // targetUserId가 있으면 친구 프로필, 없으면 내 프로필을 요청합니다.
    // 내 프로필은 /api/user/profile, 친구 프로필은 /api/users/profile/{id}
    const endpoint = targetUserId ? `/api/users/profile/${targetUserId}` : `/api/user/profile`;

    try {
      // [수정] 프로필 정보만 요청하도록 로직을 단순화합니다. 친구 관계 확인 API는 더 이상 호출하지 않습니다.
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
  }, []); // [수정] 함수가 외부 변수에 의존하지 않으므로 빈 배열로 유지합니다.

  useEffect(() => {
    // [수정] userId가 변경될 때마다 적절한 프로필을 로드합니다.
    // 또한, 페이지 종류가 바뀔 때 isFollowing 상태를 올바르게 재설정합니다.
    loadProfile(userId);
  }, [userId, loadProfile]);

  // [추가] AuthContext의 신호를 감지하여 isEditing 상태를 false로 되돌리는 useEffect
  useEffect(() => {
    // myPageViewRequest가 0이 아닐 때만 (초기 렌더링 방지) 실행
    if (myPageViewRequest > 0) {
      setIsEditing(false); // [수정] 함수 직접 호출 대신 상태를 직접 변경하여 안정성 확보
    }
  }, [myPageViewRequest]); // myPageViewRequest 값이 바뀔 때마다 실행

  // [수정] updateProfile 함수를 useCallback으로 감싸서 안정화시킵니다.
  const updateProfile = useCallback(async (profileData, { profileImageFile, bannerImageFile, revertToDefault = {} }) => {
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
        await loadProfile(loggedInUser.id);
        // setIsEditing(false); // 수정 완료 후 보기 모드로 전환
      } catch (err) {
        console.error("[MyPageContext] updateProfile 오류", err);
        const message = err.response?.data?.message || "프로필 업데이트 중 오류 발생";
        setError(message);
        throw err;
      }
    }, [loggedInUser, refreshUser, loadProfile]); // 함수가 사용하는 외부 값들을 의존성 배열에 추가합니다.

  // 수정 모드 진입/취소 핸들러
  // [수정] 이 함수들도 useCallback으로 감싸 일관성을 유지합니다.
  const handleEdit = useCallback(() => setIsEditing(true), []);
  const handleCancel = useCallback(() => setIsEditing(false), []);

  // Provider가 제공할 값들
  const value = {
    profile,
    loading,
    error,
    isOwner,
    updateProfile,
    isEditing,
    handleEdit,
    handleCancel,
    refetchProfile: loadProfile, // [추가] 프로필 정보를 다시 불러오는 함수를 외부에 제공합니다.
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