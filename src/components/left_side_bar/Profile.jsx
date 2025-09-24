import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../AuthContext";
import SocialLogin from "../account/GoogleLogin";
import { EllipsisOutlined } from "@ant-design/icons";
import { Dropdown } from "antd";
import defaultProfileImage from '../../static/image/default-profile.png';
import {
  Email,
  // IconContainer,
  ImageWrapper,
  InfoWrapper,
  LoginWrapper,
  Nickname,
  ProfileContainer,
  ProfileImageArea,
} from "../../styled_components/left_side_bar/ProfileStyled.jsx";

const Profile = () => {
  // [수정] MyPageContext 의존성 제거, AuthContext만 사용합니다.
  const { user, loading, logout, requestMyPageView } = useAuth();
  const navigate = useNavigate();

  // [개선] 우리 서비스의 정보(nickname, profileImage)를 우선 사용하되,
  // 값이 없으면 구글 초기 정보(name, picture)를 대신 보여줍니다. (Fallback)
  const displayName = user?.nickname || user?.name;
  const displayImage = user?.profileImage || user?.picture;

  // const handleMenuClick = ({ key }) => {
  //   if (key === "logout") {
  //     logout();
  //   }
  // };

  const handleMyPageClick = () => {
    requestMyPageView(); // [추가] 마이페이지 보기 요청 신호를 보냄
    navigate('/mypage'); // URL은 그대로 변경
  };

  // const menuItems = [
  //   { key: "logout", label: "로그아웃" },
  //   // 다른 메뉴 아이템 추가 가능
  // ];

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
          {/*<IconContainer>*/}
          {/*  <Dropdown*/}
          {/*    menu={{ items: menuItems, onClick: handleMenuClick }}*/}
          {/*    trigger={["click"]}*/}
          {/*  >*/}
          {/*    <EllipsisOutlined*/}
          {/*      style={{ fontSize: "20px", cursor: "pointer" }}*/}
          {/*    />*/}
          {/*  </Dropdown>*/}
          {/*</IconContainer>*/}
          <ProfileImageArea>
            <ImageWrapper as="div" onClick={handleMyPageClick} style={{ cursor: 'pointer' }}>
              <img
                src={displayImage || defaultProfileImage}
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
