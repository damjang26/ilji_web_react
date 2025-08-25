import styled from "styled-components";
import { useAuth } from "../../AuthContext";
import SocialLogin from "../account/GoogleLogin";
import React, { useState } from 'react';
import { FaSearch } from "react-icons/fa";
import {
    CloseButton,
    Email,
    IconContainer,
    ImageWrapper,
    InfoWrapper,
    ModalHeader,
    Nickname,
    ProfileContainer,
    ProfileImageArea,
    SearchInput,
    SearchModal,
} from "../../styled_components/left_side_bar/Profile.styles.jsx";

// Local styled components
const ButtonContainer = styled.div`
  display: flex;
  gap: 5px; // 간격 조절
`;

const BaseButton = styled.button`
  padding: 6px 12px;
  font-size: 0.9rem;
  border: 1px solid #ccc;
  border-radius: 5px;
  background-color: white;
  cursor: pointer;
`;

const LogoutButton = styled(BaseButton)`
  /* Inherits styles from BaseButton */
`;

const LoginWrapper = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Profile = () => {
    const { user, loading, logout } = useAuth();
    const [isModalSearch, setIsModalSearch] = useState(false);
    console.log(user);
    if (loading) {
        return <ProfileContainer><div>로딩 중...</div></ProfileContainer>;
    }

    return (
        <ProfileContainer>
            {user ? (
                <>
                    <IconContainer>
                        <FaSearch onClick={() => setIsModalSearch(!isModalSearch)} />
                        <div>....</div>
                    </IconContainer>
                    {isModalSearch && (
                        <SearchModal>
                            <ModalHeader>
                                <span>검색</span>
                                <CloseButton onClick={() => setIsModalSearch(false)}>닫기</CloseButton>
                            </ModalHeader>
                            <SearchInput type="text" placeholder="검색어를 입력하세요" />
                        </SearchModal>
                    )}
                    <ProfileImageArea>
                        <ImageWrapper to="/mypage">
                            <img src={user.picture} alt={`${user.name} 프로필`} referrerPolicy="no-referrer" />
                        </ImageWrapper>
                    </ProfileImageArea>
                    <InfoWrapper>
                        <Nickname>{user.name}</Nickname>
                        <Email>{user.email}</Email>
                        <ButtonContainer>
                            <LogoutButton onClick={logout}>로그아웃</LogoutButton>
                        </ButtonContainer>
                    </InfoWrapper>
                </>
            ) : (
                <LoginWrapper>
                    <SocialLogin />
                </LoginWrapper>
            )}
        </ProfileContainer>
    );
}

export default Profile;
