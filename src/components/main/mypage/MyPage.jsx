import { Link, useNavigate } from "react-router-dom";
import React, { useState } from "react";
import ImageBox from "./ImageBox.jsx";

import {
  ContentBox,
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
  UserInfo,
} from "../../../styled_components/main/mypage/MyPageStyled.jsx";
import { useMyPage } from "../../../contexts/MyPageContext.jsx";
import JournalList from "./feature/JournalList.jsx";

const MyPage = () => {
  // 기존의 로컬 상태와 함수들을 모두 Context에서 가져옵니다.
  const {
    profile,
    loading,
    error,
    handleImageUpdate,
    handleRevertToDefaultImage,
    handleEdit, // Context에서 수정 모드 전환 함수를 가져옵니다.
  } = useMyPage();

  console.log(`[MyPage] 컴포넌트 렌더링. Context로부터 받은 profile:`, profile);

  const [activeTab, setActiveTab] = useState("feature1");

  // 모달 상태 관리를 위한 state 추가
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingImageType, setEditingImageType] = useState(null); // 'profileImage' 또는 'bannerImage'

  // 이미지 클릭 시 모달을 여는 함수
  const handleImageClick = (imageType) => {
    setEditingImageType(imageType);
    setIsModalOpen(true);
  };

  if (loading) return <div>로딩 중...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;
  if (!profile) return <div>프로필 정보가 없습니다.</div>;

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
              <div className="email">
                {profile.email || "guest@example.com"}
              </div>
              <div>{profile.bio || ""}</div>
            </UserInfo>
            <UserActions>
              <div>post</div>
              <div>follow</div>
              <div>follower</div>
              <button onClick={handleEdit}>정보수정</button>
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
      <ImageBox
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        // profile이 로드되기 전에 모달이 열리는 경우를 대비
        currentImageUrl={profile ? profile[editingImageType] : ""}
        onConfirm={handleImageUpdate}
        imageType={editingImageType}
        onRevert={handleRevertToDefaultImage} // 새로 만든 함수를 prop으로 전달
      />
    </MyPageContainer>
  );
};
export default MyPage;
