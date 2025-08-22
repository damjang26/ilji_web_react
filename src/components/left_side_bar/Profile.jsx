import styled from "styled-components";
import { useAuth } from "../../AuthContext";
import SocialLogin from "../account/GoogleLogin";

const ProfileContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  padding: 10px 0; /* 컴포넌트 상하에 약간의 여유 공간을 줍니다. */
  height: 90px; // 컨테이너 높이를 고정하여 로그인/아웃 시 레이아웃 변경을 최소화합니다.
`;

const ImageWrapper = styled.div`
  flex-basis: 50%;
  display: flex;
  justify-content: center;
  align-items: center;

  & > img {
    width: 70px;
    height: 70px;
    border-radius: 50%;
    object-fit: cover; // 이미지가 컨테이너에 맞게 잘 표시되도록 합니다.
  }
`;

const InfoWrapper = styled.div`
    flex-basis: 50%;
    display: flex;
    flex-direction: column;
    justify-content: center; // 세로 중앙 정렬
    text-align: center;
    height: 70px;
    margin-top: 10px;
`;

const Nickname = styled.div`
  font-weight: 600;
  font-size: 1.1rem;
  margin-bottom: 8px; // 버튼과의 간격
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 5px; // 간격 조절
`;

const MyPageButton = styled.button`
  padding: 6px 12px;
  font-size: 0.9rem;
  border: 1px solid #ccc;
  border-radius: 5px;
  background-color: white;
  cursor: pointer;
`;

const LogoutButton = styled(MyPageButton)`
  /* Inherits styles from MyPageButton */
`;

const LoginWrapper = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Profile = () => {
    const { user, loading, logout } = useAuth(); // Destructure logout

    if (loading) {
        return <ProfileContainer><div>로딩 중...</div></ProfileContainer>;
    }

    return (
        <ProfileContainer>
            {user ? (
                // 로그인된 경우: 사용자 정보 표시
                <>
                    <ImageWrapper>
                        <img src={user.picture} alt={`${user.name} 프로필`} referrerPolicy="no-referrer" />
                    </ImageWrapper>
                    <InfoWrapper>
                        <Nickname>{user.name}</Nickname>
                        <ButtonContainer>
                            <MyPageButton>마이페이지</MyPageButton>
                            <LogoutButton onClick={logout}>로그아웃</LogoutButton>
                        </ButtonContainer>
                    </InfoWrapper>
                </>
            ) : (
                // 로그인되지 않은 경우: 로그인 버튼 표시
                <LoginWrapper>
                    <SocialLogin />
                </LoginWrapper>
            )}
        </ProfileContainer>
    );
}

export default Profile;