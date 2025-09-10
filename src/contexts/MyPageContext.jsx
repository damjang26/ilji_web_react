import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from "react";
import { useAuth } from "../AuthContext";
import {
  api,
  getFriendStatus,
  followUser,
  unfollowUser,
} from "../api"; // [수정] 친구 관련 api 함수들을 import 합니다.


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

  // [추가] 현재 보고 있는 사용자와의 팔로우 관계를 저장하는 상태입니다.
  // [수정] 친구 페이지(!isOwner)일 경우, 기본값을 true('언팔로우' 상태)로 설정하여 깜빡임 문제를 해결합니다.
  const [isFollowing, setIsFollowing] = useState(!isOwner);

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
  }, []); // [수정] 외부 의존성이 없으므로 빈 배열로 변경합니다.

  useEffect(() => {
    // [수정] userId가 변경될 때마다 적절한 프로필을 로드합니다.
    // 또한, 페이지 종류가 바뀔 때 isFollowing 상태를 올바르게 재설정합니다.
    setIsFollowing(!isOwner);
    loadProfile(userId);
  }, [userId, isOwner, loadProfile]); // [수정] isOwner가 바뀔 때도 useEffect가 실행되도록 의존성 배열을 수정합니다.

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

  // [추가] 팔로우/언팔로우 버튼 클릭 시 실행될 핸들러입니다.
  const handleFollowToggle = useCallback(async () => {
    // 친구 페이지가 아니거나, userId가 없으면 실행하지 않습니다.
    if (isOwner || !userId) return;

    try {
      if (isFollowing) {
        // 현재 팔로우 중이면 언팔로우 API를 호출합니다.
        await unfollowUser(userId);
        setIsFollowing(false); // 상태를 false로 변경
      } else {
        // 팔로우 중이 아니면 팔로우 API를 호출합니다.
        await followUser(userId);
        setIsFollowing(true); // 상태를 true로 변경
      }
    } catch (e) {
      console.error('[MyPageContext] 팔로우/언팔로우 처리 실패:', e);
      alert('작업을 처리하는 중 오류가 발생했습니다.');
    }
  }, [isOwner, userId, isFollowing]);

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
    isFollowing, // [추가] 팔로우 상태를 제공합니다.
    handleFollowToggle, // [추가] 팔로우/언팔로우 핸들러를 제공합니다.
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