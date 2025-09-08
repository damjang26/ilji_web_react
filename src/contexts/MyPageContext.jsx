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

  const fetchProfile = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      // 초기 로딩 시 user가 없을 수 있으므로 에러 메시지는 주석 처리
      // setError("사용자 정보를 불러올 수 없습니다.");
      return;
    }
    try {
      setLoading(true);
      const response = await api.get(`/api/user/profile`);
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
            const response = await api.put(`/api/user/profile`, formData, {
                headers: {
                    // 'Content-Type': 'multipart/form-data' 라고 명시하지 않아도,
                    // axios가 formData를 보고 자동으로 설정해줍니다.
                },
            });

            // 5. 성공 시, 서버가 반환한 최신 프로필 데이터로 Context 상태를 업데이트
            setProfile(response.data);
            setError(null); // 이전 에러 상태 초기화
            console.log("프로필 업데이트 성공:", response.data);
            return response.data;
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