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
export const MyPageProvider = ({ children, userId }) => { // userId를 prop으로 받습니다.
  const { refreshUser } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

  const loadProfile = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      setProfile(null);
      return;
    }
    setLoading(true);
    setError(null);
    // [중요] 새로운 프로필을 불러오기 전에 기존 프로필 데이터를 초기화합니다.
    setProfile(null);
    try {
        console.log(`[MyPageContext] userId=${userId} API 호출:`, `/api/members/${userId}`);
      console.log(`[MyPageContext] 🟡 5. fetchProfile 실행: 서버에 상세 프로필을 요청합니다. (userId: ${userId})`);
      // [수정] 404 에러 해결을 위해, 서버에 실제 존재하는 프로필 조회 API 주소로 변경합니다.
      const response = await api.get(`/api/members/${userId}`);
      const newProfileData = response.data;

      // 새 프로필을 불러올 때는 이전 상태와 병합할 필요 없이 완전히 새로 설정합니다.
      setProfile(newProfileData);
      setError(null);
    } catch (err) {
      console.error("프로필 정보 로딩 실패:", err);
      setError("프로필 정보를 불러오는 데 실패했습니다.");
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    console.log(`[MyPageContext] 🟡 Provider의 useEffect 실행: userId가 변경되어 loadProfile을 호출합니다. (userId: ${userId})`);
    loadProfile();
  }, [loadProfile]);

    const updateProfile = async (loggedInUserId, profileData, { profileImageFile, bannerImageFile, revertToDefault = {} }) => {
        if (!loggedInUserId) {
            const err = new Error('사용자 인증 정보가 없어 프로필을 업데이트할 수 없습니다.');
            setError(err.message);
            throw err;
        }

        try {
            const formData = new FormData();

            // 1. 프로필 데이터(JSON) 추가
            formData.append('request', new Blob([JSON.stringify(profileData)], { type: 'application/json' }));

            // 2. 새 이미지 파일 추가 (파일이 있을 경우)
            if (profileImageFile) {
                formData.append('profileImage', profileImageFile);
            }
            if (bannerImageFile) {
                formData.append('bannerImage', bannerImageFile);
            }

            // 3. 기본 이미지 복원 요청 추가 (백엔드와 약속된 필드명 사용)
            if (revertToDefault.profileImage) {
                formData.append('revertProfileImage', 'true');
            }
            if (revertToDefault.bannerImage) {
                formData.append('revertBannerImage', 'true');
            }

            // 4. 서버에 PUT 요청 (multipart/form-data)
            console.log("[MyPageContext] 🟢 1. updateProfile 실행: 서버에 프로필 변경을 요청합니다.");
            await api.put(`/api/user/profile`, formData);

            // 5. 성공 시, 전역 상태와 지역 상태를 모두 최신화합니다.
            console.log("[MyPageContext] 🟢 2. updateProfile: AuthContext의 refreshUser를 호출합니다.");
            await refreshUser(); // 사이드바 등 다른 곳을 위한 전역 user 상태 업데이트

            console.log("[MyPageContext] 🟢 3. updateProfile: 현재 페이지의 프로필을 다시 불러옵니다.");
            await loadProfile(); // 현재 보고 있는 마이페이지의 profile 상태 업데이트

        } catch (err) {
            console.error("[CONTEXT] updateProfile 함수에서 오류 발생", err);
            const message = err.response?.data?.message || "프로필 업데이트 중 오류가 발생했습니다.";
            setError(message);
            throw err;
        }
    };

    const value = {
        profile, loading, error,
        userId, // MyPageContent에서 paramUserId 대신 사용할 수 있도록 전달합니다.
        updateProfile,
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