import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../AuthContext';
import SocialLogin from "../account/GoogleLogin";
import { FaSearch } from "react-icons/fa";
import { EllipsisOutlined } from '@ant-design/icons';
import { Dropdown } from 'antd';
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
  const { user, loading, logout } = useAuth();
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
      document.removeEventListener("mousedown", handelClickOut)
    };
  }, [isModalSearch]);

  const handleMenuClick = ({ key }) => {
    if (key === 'logout') {
      logout();
    }
  };

  const menuItems = [
    { key: 'logout', label: '로그아웃' },
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
            <Dropdown menu={{ items: menuItems, onClick: handleMenuClick }} trigger={['click']}>
              <EllipsisOutlined style={{ fontSize: '20px', cursor: 'pointer' }} />
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
            <ImageWrapper to="/mypage">
              <img
                src={user.picture}
                alt={`${user.name} 프로필`}
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
