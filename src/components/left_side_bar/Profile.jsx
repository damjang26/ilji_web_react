import styled from "styled-components";

const ProfileContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 100%;
  padding: 10px 0; /* 컴포넌트 상하에 약간의 여유 공간을 줍니다. */
`;

const ImageWrapper = styled.div`
  flex-basis: 50%; /* 컨테이너 너비의 50%를 차지합니다. */
  display: flex;
  justify-content: center;
  align-items: center;

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
  flex-basis: 50%; /* 나머지 50% 너비를 차지합니다. */
  display: flex;
  flex-direction: column;
  justify-content: space-between; /* 닉네임을 위로, 버튼을 아래로 밀어냅니다. */
  height: 70px; /* 이미지 높이와 맞춰 정렬을 돕습니다. */
  padding-left: 10px; /* 이미지와 텍스트 사이에 간격을 줍니다. */
`;

const Nickname = styled.div`
  font-weight: 600;
  font-size: 1.1rem;
`;

const MyPageButton = styled.button`
  padding: 6px 12px;
  font-size: 0.9rem;
  border: 1px solid #ccc;
  border-radius: 5px;
  background-color: white;
  cursor: pointer;
`;

const Profile = () => {
    return  (
        <ProfileContainer>
            <ImageWrapper>
                <div>profile-img</div>
            </ImageWrapper>
            <InfoWrapper>
                <Nickname>nickname</Nickname>
                <MyPageButton>mypage</MyPageButton>
            </InfoWrapper>
        </ProfileContainer>
    );
}

export default Profile;