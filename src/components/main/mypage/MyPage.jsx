import { Link } from "react-router-dom";
import React, { useState, useCallback } from "react";
import { useAuth } from "../../../AuthContext.jsx";
import ImageBox from "./ImageBox.jsx";
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

/**
 * MyPageContent - UI 렌더링만 담당
 */
// [되돌리기] MyPageContent의 이름을 MyPage로 변경하고, MyPageWrapper가 이 컴포넌트를 렌더링하도록 구조를 변경합니다.
const MyPage = () => {
  // 1. 필요한 재료들을 준비합니다. (이 주석은 제거해도 좋습니다)
  const { user: loggedInUser } = useAuth();

  const {
    profile,
    loading,
    error,
    updateProfile,
    handleEdit,
  } = useMyPage();

  // [되돌리기] isOwner를 항상 true로 설정합니다. 이제 '나의 마이페이지'만 존재하기 때문입니다.
  const isOwner = true;

  // ImageBox에서 확인 버튼 눌렀을 때
  const handleImageConfirm = useCallback(async (imageFile) => {
    if (!imageFile) return;
    // [수정] updateProfile 호출 시 loggedInUser.id를 전달하지 않습니다.
    // Context가 이미 로그인 상태를 알고 있으므로, 파일 정보만 전달합니다.
    await updateProfile({}, { profileImageFile: imageFile });
  }, [updateProfile]);

  const [activeTab, setActiveTab] = useState("feature1");

  // [수정] 기존 모달 상태
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingImageType, setEditingImageType] = useState(null);

  const [isBannerEditorOpen, setIsBannerEditorOpen] = useState(false); // [추가] 배너 편집기 모달

  // 이미지 클릭 시 모달을 여는 함수
  const handleImageClick = (imageType) => {
    // [되돌리기] isOwner 체크가 더 이상 필요 없습니다.
    // if (!isOwner) return;

    if (imageType === 'bannerImage') {
      setIsBannerEditorOpen(true); // [추가] 배너 편집기 오픈
    } else {
      setEditingImageType(imageType);
      setIsModalOpen(true);
    }
  };

  // [추가] BannerImageEditor에서 편집 완료 후
  const handleBannerCropComplete = useCallback(async (croppedFile) => {
    // [수정] updateProfile 호출 시 loggedInUser.id를 전달하지 않습니다.
    await updateProfile({}, { bannerImageFile: croppedFile });
    setIsBannerEditorOpen(false);
  }, [updateProfile]);

  // 로딩/에러 처리
  if (loading) return <div>로딩 중...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;
  if (!loading && !profile) return <div>프로필 정보가 없습니다.</div>;

  return (
    <MyPageContainer>
      {/* 클릭 가능한 배경 배너 */}
      <MypageImg
        style={{
          backgroundImage: `url(${profile.bannerImage || ""})`,
        }}
        onClick={() => handleImageClick("bannerImage")}
      />
      <ContentBox>
        <MyPageHeader>
          {/* 클릭 가능한 프로필 이미지 */}
          <ImgWrapper>
            <ProfileImage
              src={profile.profileImage || "/default-profile.png"}
              alt="Profile"
              onClick={() => handleImageClick("profileImage")}
            />
          </ImgWrapper>
          <HeaderContent>
            <UserInfo>
              <div className="nickname">{profile.nickname || "Guest"}</div>
              {/* [수정] isOwner만 이메일 표시 */}
              {isOwner && <div className="email">{profile.email || "guest@example.com"}</div>}
              <div>{profile.bio || ""}</div>
            </UserInfo>
            <UserActions>
              <div>post</div>
              <div>follow</div>
              <div>follower</div>
              {/* [수정] 친구 페이지일 경우 정보수정 버튼 숨김 */}
              {isOwner && (
                <Link to="/mypageset"><button>정보수정</button></Link>
              )}
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
            {activeTab === "feature4" && <FeatureBox>기능4</FeatureBox>}
          </FeatureContent>
        </MyPageMain>
      </ContentBox>

      {/* 이미지 수정 모달 */}
      {/* [수정] ImageBox 모달 - isEditable에 isOwner 전달 */}
      <ImageBox
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        currentImageUrl={(profile && editingImageType && profile[editingImageType])
          ? profile[editingImageType].split('?')[0]
          : ""}
        onConfirm={handleImageConfirm}
        imageType={editingImageType}
        isEditable={isOwner}
      />

      {/* [추가] BannerImageEditor 모달 */}
      <BannerImageEditor
        isOpen={isBannerEditorOpen}
        onClose={() => setIsBannerEditorOpen(false)}
        onCropComplete={handleBannerCropComplete}
        isEditable={isOwner}
      />
    </MyPageContainer>
  );
};

/**
 * MyPage - Manager
 * paramUserId가 있으면 친구 페이지, 없으면 로그인 사용자 페이지
 * [되돌리기] 이 컴포넌트는 이제 Provider를 감싸는 Wrapper 역할만 담당합니다.
 */
const MyPageWrapper = () => {
  return (
    <MyPageProvider>
      <MyPage />
    </MyPageProvider>
  );
};

export default MyPageWrapper;
