import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../AuthContext";
import SocialLogin from "../account/GoogleLogin";
import { FaSearch } from "react-icons/fa";
import { EllipsisOutlined } from "@ant-design/icons";
import { Dropdown } from "antd";
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
} from "../../styled_components/left_side_bar/ProfileStyled.jsx";

const Profile = () => {
  // [수정] MyPageContext 의존성 제거, AuthContext만 사용합니다.
  const { user, loading, logout, requestMyPageView } = useAuth();
  const navigate = useNavigate();

  // [개선] 우리 서비스의 정보(nickname, profileImage)를 우선 사용하되,
  // 값이 없으면 구글 초기 정보(name, picture)를 대신 보여줍니다. (Fallback)
  const displayName = user?.nickname || user?.name;
  const displayImage = user?.profileImage || user?.picture;

  const [isModalSearch, setIsModalSearch] = useState(false);
  const modalRef = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => {
    const handelClickOut = (e) => {
      if (searchRef.current && searchRef.current.contains(e.target)) {
        return;
      }
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        setIsModalSearch(false);
      }
    };
    if (isModalSearch) {
      document.addEventListener("mousedown", handelClickOut);
    }
    return () => {
      document.removeEventListener("mousedown", handelClickOut);
    };
  }, [isModalSearch]);

  const handleMenuClick = ({ key }) => {
    if (key === "logout") {
      logout();
    }
  };

  const handleMyPageClick = () => {
    requestMyPageView(); // [추가] 마이페이지 보기 요청 신호를 보냄
    navigate('/mypage'); // URL은 그대로 변경
  };

  const menuItems = [
    { key: "logout", label: "로그아웃" },
    // 다른 메뉴 아이템 추가 가능
  ];

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
            <Dropdown
              menu={{ items: menuItems, onClick: handleMenuClick }}
              trigger={["click"]}
            >
              <EllipsisOutlined
                style={{ fontSize: "20px", cursor: "pointer" }}
              />
            </Dropdown>
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
            <ImageWrapper as="div" onClick={handleMyPageClick} style={{ cursor: 'pointer' }}>
              <img
                src={displayImage || "/default-profile.png"}
                alt={`${displayName} 프로필`}
                referrerPolicy="no-referrer"
              />
            </ImageWrapper>
          </ProfileImageArea>
          <InfoWrapper>
            <Nickname>{user.name}</Nickname>
            <Email>{user.email}</Email>
          </InfoWrapper>
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
