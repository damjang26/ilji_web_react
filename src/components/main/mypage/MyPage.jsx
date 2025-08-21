import styled from 'styled-components';
import {Link} from "react-router-dom";

// 전체 마이페이지를 감싸는 컨테이너
const MyPageContainer = styled.div`
  display: flex;
  flex-direction: column; /* 헤더와 메인을 수직으로 쌓습니다. */
  width: 100%;
  height: 100%;
`;

// 마이페이지 상단 배경 이미지를 위한 컨테이너
const MypageImg = styled.div`
  margin: -40px -40px 0;  
  width: calc(100%+  40px);
  height: 150px; /* 원하는 배경이미지 높이로 조절하세요. */
  background-color: #e9ecef; /* 이미지가 없을 때 보일 임시 배경색 */
  flex-shrink: 0; /* 컨테이너 크기가 줄어들지 않도록 합니다. */

  /* 텍스트를 중앙에 배치하기 위한 스타일 */
  display: flex;
  justify-content: center;
  align-items: center;
  color: #adb5bd;

  /* 나중에 실제 이미지를 넣을 때 아래 주석을 해제하고 텍스트를 지우세요. */
  /* background-image: url('여기에 이미지 주소를 넣으세요'); */
  /* background-size: cover; */
  /* background-position: center; */
`;

// 페이지 상단에 위치할 헤더
const MyPageHeader = styled.header`
  display: flex;
  /* justify-content: space-around; -> flex-start로 변경하여 왼쪽부터 정렬 */
  justify-content: flex-start;
  align-items: center;
  padding: 20px 40px; /* 좌우 패딩을 넉넉하게 줍니다. */
  border-bottom: 1px solid #e0e0e0;
  background-color: #fafafa;
  flex-shrink: 0; /* 헤더 크기가 줄어들지 않도록 합니다. */
  gap: 60px; /* 이미지와 나머지 컨텐츠 사이의 간격 */
`;

// 프로필 이미지를 감싸는 컨테이너
const ImageWrapper = styled.div`
    margin-left: 100px; /*이미지와 왼쪽 끝의 간격 */
  /* 실제 이미지를 위한 임시 스타일 */
  & > div {
    width: 120px; /*이 값을 조절하여 이미지 크기를 변경할 수 있습니다. */
    height: 120px;
    border-radius: 50%;
    background-color: #ddd;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 1rem;
    flex-shrink: 0; /* 컨테이너가 줄어들어도 이미지 크기는 유지 */
  }
`;

// 이미지 오른쪽의 모든 정보를 감싸는 컨테이너
const HeaderContent = styled.div`
  display: flex;
  justify-content: flex-start; /* 헤더 info과 헤더 action을 양 끝으로 보냅니다. */
  align-items: center;
  gap:300px; /* 헤더 info 와 헤더 action의 사이의 간격 */
  flex-grow: 1; /* 헤더의 남은 공간을 모두 차지합니다. */
  min-width: 0; /* flex item이 부모를 넘어가는 것을 방지 */
`;

// 닉네임, 이메일, 이름을 수직으로 묶는 컨테이너
const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px; /* 이름들 사이의 간격 */

  & > .nickname {
    font-size: 1.5rem;
    font-weight: 600;
  }
  & > .email {
    color: #6c757d;
  }
`;

// 게시물, 팔로우, 설정 등을 수평으로 묶는 컨테이너
const UserActions = styled.div`
  display: flex;
  align-items: center;
  gap: 25px; /* 액션 아이템들 사이의 간격 */
`;

// 기능들이 위치할 메인 컨텐츠 영역
const MyPageMain = styled.main`
  flex-grow: 1; /* 헤더를 제외한 나머지 모든 수직 공간을 차지합니다. */
  display: flex;
  justify-content: center; /* 기능들을 수평 중앙에 배치합니다. */
  align-items: center; /* 기능들을 수직 중앙에 배치합니다. */
  gap: 20px; /* 기능들 사이의 간격을 줍니다. */
`;

// 각 기능을 감싸는 박스
const FeatureBox = styled.div`
  width: 180px;
  height: 120px;
  border: 1px solid #ccc;
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1.1rem;
  background-color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

const MyPage = () => {
    return(
        <MyPageContainer>
            <MypageImg>마이페이지 이미지</MypageImg>
            <MyPageHeader>
                <ImageWrapper>
                    <div>profile-photo</div>
                </ImageWrapper>
                <HeaderContent>
                    <UserInfo>
                        <div className="nickname">nickname</div>
                        <div className="email">email</div>
                        <div>name</div>
                    </UserInfo>
                    <UserActions>
                        <div>post</div>
                        <div>follow</div>
                        <div>follower</div>
                        <div>setting</div>
                    </UserActions>
                </HeaderContent>
            </MyPageHeader>
            <MyPageMain>
                <FeatureBox>기능1</FeatureBox>
                <FeatureBox>기능2</FeatureBox>
                <FeatureBox>기능3</FeatureBox>
                <FeatureBox>기능4</FeatureBox>
            </MyPageMain>
        </MyPageContainer>
    )
}
export default MyPage;