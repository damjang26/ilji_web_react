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
  // [MODIFY] Import the refreshUser function from AuthContext.
  const { user, refreshUser } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    // 수정 모드를 관리하는 상태를 Context로 이동합니다.
    const [isEditing, setIsEditing] = useState(false);
    const [error, setError] = useState(null);


    // [디버깅용] 프로필 업데이트를 감지하기 위한 '트리거' 상태
    const [updateTrigger, setUpdateTrigger] = useState(0);

  // [MODIFY] fetchProfile이 더 이상 외부 user 상태에 의존하지 않도록 userId를 인자로 받습니다.
  const fetchProfile = useCallback(async (userId) => {
    if (!userId) {
      setLoading(false);
      // 초기 로딩 시 user가 없을 수 있으므로 에러 메시지는 주석 처리
      // setError("사용자 정보를 불러올 수 없습니다.");
      return;
    }
    try {
      setLoading(true);
        console.log(`[MyPageContext] 🟡 5. fetchProfile 실행: 서버에 상세 프로필을 요청합니다. (userId: ${userId})`);
      const response = await api.get(`/api/user/profile`);
      const newProfileData = response.data;

      // [FIX] 함수형 업데이트와 객체 병합을 사용하여 상태를 '덮어쓰지' 않고 안전하게 '병합'합니다.
      // 이렇게 하면 비동기 작업 중 발생할 수 있는 상태 유실을 방지하고,
      // 기존 상태를 보존하면서 서버에서 받은 데이터로 갱신할 수 있습니다.
      setProfile(prevProfile => ({ ...prevProfile, ...newProfileData }));

      setError(null);
    } catch (err) {
      console.error("프로필 정보 로딩 실패:", err);
      setError("프로필 정보를 불러오는 데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }, []); // 의존성 배열에서 user.id 제거

  useEffect(() => {
    // user.id가 있을 때만 프로필을 불러옵니다.
    if (user?.id) {
        console.log("[MyPageContext] 🔵 4. useEffect 실행: 'user' 또는 'updateTrigger' 변경을 감지했습니다.");
      fetchProfile(user.id); // 호출 시 user.id를 인자로 전달
    }
  }, [user?.id, fetchProfile, updateTrigger]); // useEffect의 의존성은 유지



    // 프로필 정보 및 이미지 업데이트 함수
    // 💥 파라미터를 구조 분해 할당으로 변경하여 파일과 복원 옵션을 받습니다.
    const updateProfile = async (profileData, { profileImageFile, bannerImageFile, revertToDefault = {} }) => {
        if (!user?.id) {
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
                // 'revertProfileImage' 필드에 'true' 값을 담아 백엔드에 전달
                formData.append('revertProfileImage', 'true');
            }
            if (revertToDefault.bannerImage) {
                // 'revertBannerImage' 필드에 'true' 값을 담아 백엔드에 전달
                formData.append('revertBannerImage', 'true');
            }


            // 4. 서버에 PUT 요청 (multipart/form-data)

            // FormData를 전송할 때는 브라우저가 Content-Type(multipart/form-data)을 자동으로 설정하도록 헤더를 명시하지 않습니다.
            // const response = await api.put(`/api/user/profile`, formData, {
            //     headers: {
            //         // 'Content-Type': 'multipart/form-data' 라고 명시하지 않아도,
            //         // axios가 formData를 보고 자동으로 설정해줍니다.
            //     },
            // });
            console.log("[MyPageContext] 🟢 1. updateProfile 실행: 서버에 프로필 변경을 요청합니다.");
            await api.put(`/api/user/profile`, formData);

            // 5. 성공 시, 서버가 반환한 최신 프로필 데이터로 Context 상태를 업데이트
            // const updatedProfile = response.data;
            // const timestamp = `?_=${Date.now()}`;
            //
            // // "Cache Busting": 이미지 URL이 존재하면, URL 뒤에 타임스탬프를 추가하여
            // // 브라우저가 항상 새로운 이미지 파일을 서버에서 가져오도록 강제합니다.
            // if (updatedProfile.profileImage) {
            //     updatedProfile.profileImage += timestamp;
            // }
            // if (updatedProfile.bannerImage) {
            //     updatedProfile.bannerImage += timestamp;
            // }
            //
            // setProfile(updatedProfile);
            // setError(null); // 이전 에러 상태 초기화
            // console.log("프로필 업데이트 성공:", response.data);
            // return response.data;

            console.log("[MyPageContext] 🟢 2. updateProfile: AuthContext의 refreshUser를 호출합니다.");
            await refreshUser();

            console.log("[MyPageContext] 🟢 3. updateProfile: useEffect를 트리거하기 위해 내부 상태를 변경합니다.");
            setUpdateTrigger(prev => prev + 1);

        } catch (err) {
            console.error("[CONTEXT] updateProfile 함수에서 오류 발생", err);
            const message = err.response?.data?.message || "프로필 업데이트 중 오류가 발생했습니다.";
            setError(message);
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