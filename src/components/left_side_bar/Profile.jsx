import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../AuthContext";
import SocialLogin from "../account/GoogleLogin";
import { FaSearch } from "react-icons/fa";
import {
  ButtonContainer,
  CloseButton,
  Email,
  IconContainer,
  ImageWrapper,
  InfoWrapper,
  LoginWrapper,
  LogoutButton,
  ModalHeader,
  Nickname,
  ProfileContainer,
  ProfileImageArea,
  SearchInput,
  SearchModal,
  FriendManageButton,
} from "../../styled_components/left_side_bar/ProfileStyled.jsx";

import FriendManagementModal from '../friends/FriendManagementModal';

const Profile = () => {
  // [수정] MyPageContext 의존성 제거, AuthContext만 사용합니다.
  const { user, loading, logout } = useAuth();

  // [개선] 우리 서비스의 정보(nickname, profileImage)를 우선 사용하되,
  // 값이 없으면 구글 초기 정보(name, picture)를 대신 보여줍니다. (Fallback)
  const displayName = user?.nickname || user?.name;
  const displayImage = user?.profileImage || user?.picture;

  const [isModalSearch, setIsModalSearch] = useState(false);
  const [isFriendModalOpen, setIsFriendModalOpen] = useState(false); // 친구 관리 모달 상태
  const modalRef = useRef(null); // 모달 DOM을 참조하기 위한 ref
  const searchRef = useRef(null); // 검색 아이콘을 참조하기 위한 ref

  useEffect(() => { // 모달 외부 클릭을 감지하는 useEffect (모달창 외부에서 끄기 기능)
    const handelClickOut = (e) => {
      if (searchRef.current && searchRef.current.contains(e.target)) {
        return; // 검색 아이콘을 클릭한 경우는 무시 (아이콘의 자체 onClick으로 토글 처리)
      }
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        setIsModalSearch(false); // 모달이 열려 있고, 클릭된 곳이 모달 외부일 때 모달을 닫음
      }
    };
    if (isModalSearch) { // 모달이 열려 있을 때만 이벤트 리스너를 추가
      document.addEventListener("mousedown", handelClickOut); //"mousedown":버튼 누르는 순간의미
    }
    return () => { // 클린업 함수: 컴포넌트가 언마운트, 모달이 닫힐 때 이벤트 리스너를 제거
      document.removeEventListener("mousedown", handelClickOut)
    };
  }, [isModalSearch]); //상태가 변경될 때마다 이 효과를 다시 실행

  if (loading) {
    return (
      <ProfileContainer>
        <div>로딩 중...</div>
      </ProfileContainer>
    );
  }

  return (
    <ProfileContainer>
      {user ? (
        <>
          <IconContainer>
            <span ref={searchRef}>
              <FaSearch onClick={() => setIsModalSearch(!isModalSearch)} />
            </span>
            <div>....</div>
          </IconContainer>
          {isModalSearch && (
            <SearchModal ref={modalRef}>
              <ModalHeader>
                <span>검색</span>
                <CloseButton onClick={() => setIsModalSearch(false)}>
                  닫기
                </CloseButton>
              </ModalHeader>
              <SearchInput type="text" placeholder="검색어를 입력하세요" />
            </SearchModal>
          )}
          <ProfileImageArea>
            <ImageWrapper to="/mypage">
              <img
                src={displayImage || "/default-profile.png"}
                alt={`${displayName} 프로필`}
                referrerPolicy="no-referrer"
              />
            </ImageWrapper>
          </ProfileImageArea>
          <InfoWrapper>
            <Nickname>{displayName}</Nickname>
            {/*<Email>{user.email}</Email>*/}
            <ButtonContainer>
              <FriendManageButton onClick={() => setIsFriendModalOpen(true)}>친구 관리</FriendManageButton>
              <LogoutButton onClick={logout}>로그아웃</LogoutButton>
            </ButtonContainer>
          </InfoWrapper>
          <FriendManagementModal open={isFriendModalOpen} onClose={() => setIsFriendModalOpen(false)} />
        </>
      ) : (
        <LoginWrapper>
          <SocialLogin />
        </LoginWrapper>
      )}
    </ProfileContainer>
  );
};

export default Profile;
