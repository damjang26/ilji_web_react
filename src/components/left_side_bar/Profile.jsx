import styled from "styled-components";
import {Link} from "react-router-dom";
import React from 'react';

const ProfileContainer = styled.div`
  display: flex;
  flex-direction: column; /* 자식 요소들을 수직(위->아래)으로 정렬합니다. */
  align-items: center;
  width: 100%;
  padding: 20px 0; /* 컴포넌트 상하 여유 공간을 더 줍니다. */
`;

const ImageWrapper = styled(Link)`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 15px; /* 이미지와 아래 정보 사이에 간격을 줍니다. */

  /* 실제 이미지를 위한 임시 스타일 */
  & > div {
    width: 70px;
    height: 70px;
    border-radius: 50%;
    background-color: #ddd;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 12px;
  }
`;

const InfoWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center; /* 닉네임과 버튼을 수평 중앙에 배치합니다. */
  gap: 10px; /* 닉네임과 버튼 사이에 간격을 줍니다. */
`;

const Nickname = styled.div`
  font-weight: 600;
  font-size: 1.1rem;
  margin-bottom: 1px; /* 버튼과의 간격을 살짝 더 줍니다. */
`
const Email = styled.div`
  font-weight: 300;
  font-size: 0.9rem;
  margin-bottom: 3px; /* 버튼과의 간격을 살짝 더 줍니다. */
`;

// Link 컴포넌트에 직접 스타일을 적용하여 버튼처럼 만듭니다.
const MyPageLink = styled(Link)`
  padding: 6px 12px;
  font-size: 0.9rem;
  border: 1px solid #ccc;
  border-radius: 5px;
  background-color: white;
  cursor: pointer;
  text-decoration: none; /* 링크의 기본 밑줄을 제거합니다. */
  color: #333; /* 링크의 기본 색상을 변경합니다. */
`;

const Profile = () => {
    return  (
        <ProfileContainer>
            <ImageWrapper to="/mypage">
                <div>profile-img</div>
            </ImageWrapper>
            <InfoWrapper>
                <Nickname>nickname</Nickname>
                <Email>email</Email>
            </InfoWrapper>
        </ProfileContainer>
    );
}

export default Profile;