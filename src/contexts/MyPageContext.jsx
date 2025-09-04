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

    // profile 상태가 변경될 때마다 로그를 남깁니다.
    useEffect(() => {
        console.log(`[CONTEXT] profile 상태 변경 감지. 현재 profile:`, profile);
    }, [profile]);



    // 이미지 업데이트 함수
  const handleImageUpdate = async (imageType, imageFile) => {
    if (!profile || !imageFile) return;

    const formData = new FormData();
    formData.append("image", imageFile);

    const originalProfile = { ...profile };
    const tempImageUrl = URL.createObjectURL(imageFile);
    setProfile({ ...profile, [imageType]: tempImageUrl }); // 낙관적 업데이트

    try {
      const uploadResponse = await api.post("/api/upload/image", formData);
      const newImageUrl = uploadResponse.data.imageUrl;

      const updatedProfile = { ...profile, [imageType]: newImageUrl };
      const profileUpdateResponse = await api.put(
        `/api/profiles/user/${user.id}`,
        updatedProfile
      );
      setProfile(profileUpdateResponse.data); // 최종 데이터로 업데이트
    } catch (err) {
      console.error("이미지 업데이트 실패:", err);
      setProfile(originalProfile); // 실패 시 롤백
      alert("이미지 업데이트 중 오류가 발생했습니다.");
    }
  };

  // 기본 이미지로 되돌리는 함수
  const handleRevertToDefaultImage = async (imageType) => {
    if (imageType !== "profileImage" || !user?.picture) return;

    const defaultImageUrl = user.picture;
    const updatedProfile = { ...profile, profileImage: defaultImageUrl };

    try {
      await api.put(`/api/profiles/user/${user.id}`, updatedProfile);
      setProfile(updatedProfile);
    } catch (err) {
      console.error("기본 이미지 복원 실패:", err);
      alert("기본 이미지로 복원하는 중 오류가 발생했습니다.");
    }
  };

    // 프로필 정보 업데이트 함수 (가장 중요한 변경)
    const updateProfile = async (updatedProfileData) => {
        if (!profile || !profile.userId) {
            throw new Error('사용자 정보가 없어 업데이트할 수 없습니다.');
        }console.log(`[CONTEXT] updateProfile 함수 시작. 전달받은 데이터:`, updatedProfileData);
        try {
            // 1. 서버에 업데이트 요청
            const response = await api.put(`/api/profiles/user/${profile.userId}`, updatedProfileData);
            console.log(`[CONTEXT] 서버로부터 응답 받음:`, response.data);
            // 2. 성공 시 Context의 상태를 업데이트합니다.
            //    서버 응답 본문이 비어있을 수 있으므로, 요청에 사용했던 데이터로 상태를 업데이트합니다.
            setProfile(updatedProfileData);
            console.log(`[CONTEXT] setProfile(updatedProfileData) 호출 완료.`);
            // 3. 성공했다는 의미로 Promise를 통해 성공 결과를 반환 (예: true)
            return true;
        } catch (err) {
            console.error("[CONTEXT] updateProfile 함수에서 오류 발생", err);
            // 4. 실패 시 에러를 던져서 호출한 쪽에서 알 수 있게 함
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
        profile, loading, error, fetchProfile, setProfile,
        handleImageUpdate, handleRevertToDefaultImage, updateProfile,
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