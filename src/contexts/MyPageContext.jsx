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
export const MyPageProvider = ({ children }) => {
  const { user } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    // 수정 모드를 관리하는 상태를 Context로 이동합니다.
    const [isEditing, setIsEditing] = useState(false);
    const [error, setError] = useState(null);

  // // 외부에서 사용할 상태 업데이트 함수. 콜백을 지원합니다.
  // const setProfile = (newProfile, callback) => {
  //   _setProfile(newProfile);
  //   // callback이 함수 형태일 경우에만 실행합니다.
  //   if (callback && typeof callback === "function") {
  //     // React의 상태 업데이트는 비동기일 수 있으므로,
  //     // useEffect나 setTimeout을 사용해 다음 렌더링 사이클에 실행하는 것이 더 안정적일 수 있으나,
  //     // 현재 시나리오에서는 즉시 호출해도 무방합니다.
  //     callback();
  //   }
  // };

  const fetchProfile = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      // 초기 로딩 시 user가 없을 수 있으므로 에러 메시지는 주석 처리
      // setError("사용자 정보를 불러올 수 없습니다.");
      return;
    }
    try {
      setLoading(true);
      const response = await api.get(`/api/profiles/user/${user.id}`);
      setProfile(response.data);
      setError(null);
    } catch (err) {
      console.error("프로필 정보 로딩 실패:", err);
      setError("프로필 정보를 불러오는 데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    // user.id가 있을 때만 프로필을 불러옵니다.
    if (user?.id) {
      fetchProfile();
    }
  }, [user?.id, fetchProfile]);



    // 프로필 정보 업데이트 함수 (기존 코드 유지, 기본 이미지 복원만 추가)
    const updateProfile = async (profileData, profileImageFile, bannerImageFile, profileImageUrl = null, bannerImageUrl = null) => {
        if (!user?.id) {
            throw new Error('사용자 정보가 없어 업데이트할 수 없습니다.');
        }
        console.log(`[CONTEXT] updateProfile 시작`, { profileData, profileImageFile, bannerImageFile, profileImageUrl, bannerImageUrl });

        const formData = new FormData();

        // 1. 프로필 데이터(JSON)를 'request' 파트에 추가
        formData.append('request', new Blob([JSON.stringify(profileData)], { type: 'application/json' }));

        // 2. 이미지 파일들을 각 파트에 추가 (파일이 있을 경우에만)
        if (profileImageFile) {
            formData.append('profileImage', profileImageFile);
        } else if (profileImageUrl) {
            // File 없고 URL만 있을 경우 서버에 profileImageUrl로 전달
            formData.append('profileImageUrl', profileImageUrl);
        }

        if (bannerImageFile) {
            formData.append('bannerImage', bannerImageFile);
        } else if (bannerImageUrl) {
            formData.append('bannerImageUrl', bannerImageUrl);
        }

        // FormData 상태 확인
        console.log(`[CONTEXT] FormData 상태 - 'request':`, formData.has('request'));
        console.log(`[CONTEXT] FormData 상태 - 'profileImage':`, formData.has('profileImage'));
        console.log(`[CONTEXT] FormData 상태 - 'profileImageUrl':`, formData.has('profileImageUrl'));
        console.log(`[CONTEXT] FormData 상태 - 'bannerImage':`, formData.has('bannerImage'));
        console.log(`[CONTEXT] FormData 상태 - 'bannerImageUrl':`, formData.has('bannerImageUrl'));

        try {
            // 3. 서버에 PUT 요청
            console.log(`[CONTEXT] 3. API 요청 전송 시작. URL: /api/profiles/user/${user.id}`);
            await api.put(`/api/profiles/user/${user.id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            // 4. 성공 시, 최신 프로필 정보를 다시 불러오기
            await fetchProfile();

            console.log(`[CONTEXT] 프로필 업데이트 및 리프레시 성공`);
            return true;
        } catch (err) {
            console.error("[CONTEXT] updateProfile 함수에서 오류 발생", err);
            throw err;
        }
    };

    // 수정 모드로 전환하는 함수
    const handleEdit = useCallback(() => {
        setIsEditing(true);
    }, []);

    // 보기 모드로 돌아가는 함수
    const handleCancel = useCallback(() => {
        setIsEditing(false);
    }, []);

    const value = {
        profile, loading, error, fetchProfile, updateProfile,
        isEditing, handleEdit, handleCancel // Context 값으로 제공합니다.
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