import { Link, useNavigate, useLocation } from "react-router-dom";
import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../../AuthContext";
import { api } from "../../../api";
import ImageBox from "./ImageBox";
import BannerImageEditor from "./BannerImageEditor.jsx"; // [추가] 새로운 Editor import
import {
  FeatureBox,
  FeatureContent,
  HeaderContent,
  ImgWrapper,
  MyPageContainer,
  MyPageHeader,
  MypageImg,
  MyPageMain,
  ProfileImage,
  Tab,
  TabMenuContainer,
  UserActions,
  ContentBox,
  UserInfo,
} from "../../../styled_components/main/mypage/MyPageStyled.jsx";
import { MyPageProvider, useMyPage } from "../../../contexts/MyPageContext.jsx";
import JournalList from "./feature/JournalList.jsx";
import FriendManagementModal from "../../friends/FriendManagementModal.jsx";

/**
 * MyPageContent - UI 렌더링만 담당
 */
// [되돌리기] MyPageContent의 이름을 MyPage로 변경하고, MyPageWrapper가 이 컴포넌트를 렌더링하도록 구조를 변경합니다.
const MyPage = () => {
  // 1. 필요한 재료들을 준비합니다. (이 주석은 제거해도 좋습니다)
  const { user: loggedInUser } = useAuth();

  const { profile, loading, error, updateProfile, handleEdit } = useMyPage();

  // [되돌리기] isOwner를 항상 true로 설정합니다. 이제 '나의 마이페이지'만 존재하기 때문입니다.
  const isOwner = true;
  // 모달 상태 관리를 위한 state 추가
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [editingImageType, setEditingImageType] = useState(null);
  const [isFriendModalOpen, setIsFriendModalOpen] = useState(false);
  const [friendModalInitialTab, setFriendModalInitialTab] =
    useState("following");

  // ImageBox에서 확인 버튼 눌렀을 때
  const handleImageConfirm = useCallback(
    async (imageFile) => {
      if (!imageFile) return;
      // [수정] updateProfile 호출 시 loggedInUser.id를 전달하지 않습니다.
      // Context가 이미 로그인 상태를 알고 있으므로, 파일 정보만 전달합니다.
      await updateProfile({}, { profileImageFile: imageFile });
    },
    [updateProfile]
  );

  const [activeTab, setActiveTab] = useState("feature1");

  // [수정] 기존 모달 상태
  // const [isModalOpen, setIsModalOpen] = useState(false);
  // const [editingImageType, setEditingImageType] = useState(null);

  const [isBannerEditorOpen, setIsBannerEditorOpen] = useState(false); // [추가] 배너 편집기 모달

  // 이미지 클릭 시 모달을 여는 함수 <--- 수정할수도 있음 그래서 주석 ㄱㄷㄱㄷ
  // const handleImageClick = (imageType) => {
  //   // [되돌리기] isOwner 체크가 더 이상 필요 없습니다.
  //   // if (!isOwner) return;

  //   if (imageType === 'bannerImage') {
  //     setIsBannerEditorOpen(true); // [추가] 배너 편집기 오픈
  //   } else {
  //     setEditingImageType(imageType);
  //     setIsModalOpen(true);
  //   }
  // };
  //   const handleImageClick = (imageType) => {
  //       setEditingImageType(imageType);
  //       setIsImageModalOpen(true);
  //   };

  const handleFriendModalOpen = (initialTab) => {
    setFriendModalInitialTab(initialTab);
    setIsFriendModalOpen(true);
  };

  const handleImageUpdate = async (imageType, newUrl) => {
    if (!profile) return;

    const updatedProfile = { ...profile, [imageType]: newUrl };
    setProfile(updatedProfile);

    try {
      await api.put(`/api/profiles/user/${user.id}`, updatedProfile);
      alert("이미지가 성공적으로 업데이트되었습니다.");
    } catch (err) {
      console.error("이미지 업데이트 실패:", err);
      alert("이미지 업데이트 중 오류가 발생했습니다.");
      fetchProfile();
    }
  };

  // [추가] BannerImageEditor에서 편집 완료 후
  const handleBannerCropComplete = useCallback(
    async (croppedFile) => {
      // [수정] updateProfile 호출 시 loggedInUser.id를 전달하지 않습니다.
      await updateProfile({}, { bannerImageFile: croppedFile });
      setIsBannerEditorOpen(false);
    },
    [updateProfile]
  );

  return (
    <MyPageContainer>
      <MypageImg
        style={{
          backgroundImage: `url(${profile.bannerImage || ""})`,
          cursor: "pointer",
          position: "relative",
        }}
        onClick={() => handleImageClick("bannerImage")}
      ></MypageImg>
      <ContentBox>
        <MyPageHeader>
          <ImgWrapper style={{ marginTop: "10px", marginBottom: "10px" }}>
            <img
              src={profile.profileImage || "/default-profile.png"}
              alt="Profile"
              onClick={() => handleImageClick("profileImage")}
              style={{
                width: "120px",
                height: "120px",
                borderRadius: "50%",
                objectFit: "cover",
                border: "4px solid #fff",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
                cursor: "pointer",
              }}
            />
          </ImgWrapper>
          <HeaderContent>
            <UserInfo>
              <div className="nickname">{profile.nickname || "Guest"}</div>
              <div className="email">
                {profile.email || "guest@example.com"}
              </div>
              <div>{profile.bio || ""}</div>
            </UserInfo>
            <UserActions>
              <div>post</div>
              <div
                onClick={() => handleFriendModalOpen("following")}
                style={{ cursor: "pointer" }}
              >
                follow
              </div>
              <div
                onClick={() => handleFriendModalOpen("followers")}
                style={{ cursor: "pointer" }}
              >
                follower
              </div>
              <button onClick={() => navigate("/mypageset")}>정보수정</button>
            </UserActions>
          </HeaderContent>
        </MyPageHeader>
        <MyPageMain>
          <TabMenuContainer>
            <Tab
              $active={activeTab === "feature1"}
              onClick={() => setActiveTab("feature1")}
            >
              i-log
            </Tab>
            <Tab
              $active={activeTab === "feature2"}
              onClick={() => setActiveTab("feature2")}
            >
              좋아요
            </Tab>
            <Tab
              $active={activeTab === "feature3"}
              onClick={() => setActiveTab("feature3")}
            >
              구독
            </Tab>
          </TabMenuContainer>
          <FeatureContent>
            {activeTab === "feature1" && <JournalList />}
            {activeTab === "feature2" && <FeatureBox>기능2</FeatureBox>}
            {activeTab === "feature3" && <FeatureBox>기능3</FeatureBox>}
          </FeatureContent>
        </MyPageMain>
      </ContentBox>

      <ImageBox
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        currentImageUrl={profile[editingImageType]}
        onConfirm={handleImageUpdate}
        imageType={editingImageType}
      />
      <FriendManagementModal
        open={isFriendModalOpen}
        onClose={() => setIsFriendModalOpen(false)}
        initialTab={friendModalInitialTab}
      />
    </MyPageContainer>
  );
};
export default MyPage;
