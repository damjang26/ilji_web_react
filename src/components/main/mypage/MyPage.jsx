import { Link, useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import ImageBox from "./ImageBox.jsx";
import BannerImageEditor from "./BannerImageEditor.jsx"; // 새로 만든 Editor를 import

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
    updateProfile, // 통합된 업데이트 함수를 가져옵니다.
    handleEdit, // Context에서 수정 모드 전환 함수를 가져옵니다.
  } = useMyPage();


  const [activeTab, setActiveTab] = useState("feature1");

  // 기존 프로필 이미지 모달 상태
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingImageType, setEditingImageType] = useState(null); // 'profileImage' 또는 'bannerImage'

  // 배너 이미지 편집기 모달 상태
  const [isBannerEditorOpen, setIsBannerEditorOpen] = useState(false);

  // 이미지 클릭 시 모달을 여는 함수
  const handleImageClick = (imageType) => {
    if (imageType === 'bannerImage') {
      // 배너를 클릭하면 BannerImageEditor를 엽니다.
      setIsBannerEditorOpen(true);
    } else {
      // 프로필 이미지는 기존 ImageBox를 엽니다.
      setEditingImageType(imageType);
      setIsModalOpen(true);
    }
  };

  // BannerImageEditor가 편집을 완료했을 때 호출될 콜백 함수
  const handleBannerCropComplete = async (croppedFile) => {
    try {
      // [개선] 이미지 업데이트 시에는 텍스트 데이터를 보내지 않습니다. (첫 번째 인자를 빈 객체로 전달)
      await updateProfile({}, { bannerImageFile: croppedFile });
      alert('배너 이미지가 성공적으로 업데이트되었습니다.');
    } catch (err) {
      console.error('배너 이미지 업데이트 실패:', err);
    }
    setIsBannerEditorOpen(false); // 모달 닫기
  };

  // 모달에서 '확인'을 눌렀을 때 호출될 함수
  const handleImageConfirm = async (imageType, imageFile) => {
    if (!profile || !imageFile) return;

    try {
      // [개선] 이미지 업데이트 시에는 텍스트 데이터를 보내지 않습니다.
      await updateProfile({}, { profileImageFile: imageFile });
      alert('프로필 이미지가 성공적으로 업데이트되었습니다.');
      setIsModalOpen(false); // 성공 시 모달 닫기
    } catch (err) {
      // Context에서 에러를 throw하면 alert가 자동으로 뜨므로 콘솔 로그만 남깁니다.
      console.error('프로필 이미지 업데이트 실패:', err);
    }
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
        // [수정] ImageBox에는 캐시 버스팅용 타임스탬프를 제거한 순수한 URL을 전달합니다.
        // 이렇게 해야 ImageBox 내부에서 URL을 다룰 때 발생할 수 있는 오류를 방지할 수 있습니다.
        currentImageUrl={(
          profile && editingImageType && profile[editingImageType]
        ) ? profile[editingImageType].split('?')[0] : ""}
        onConfirm={handleImageConfirm}
        imageType={editingImageType}
      />

      {/* 새로운 배너 이미지 편집 모달 */}
      <BannerImageEditor
        isOpen={isBannerEditorOpen}
        onClose={() => setIsBannerEditorOpen(false)}
        onCropComplete={handleBannerCropComplete}
      />
    </MyPageContainer>
  );
};
export default MyPage;
