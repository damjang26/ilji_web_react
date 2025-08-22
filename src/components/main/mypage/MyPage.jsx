import styled from 'styled-components';
import {Link} from "react-router-dom";
import {useState} from "react";

// 전체 마이페이지를 감싸는 컨테이너
const MyPageContainer = styled.div`
  display: flex;
  flex-direction: column; /* 헤더와 메인을 수직으로 쌓습니다. */
  width: 100%;
  height: 100%;
`;

// 마이페이지 상단 배경 이미지를 위한 컨테이너
const MypageImg = styled.div`
  /* 헤더/메인 박스가 겹칠 수 있도록 충분한 높이를 확보합니다. */
  height: 250px;
  /* 부모의 여백을 무시하고 좌우를 꽉 채웁니다. */
  margin: -40px 0 0;
  width: 100%; 
  background-color: #e9ecef; /* 이미지가 없을 때 보일 임시 배경색 */
  flex-shrink: 0; /* 컨테이너 크기가 줄어들지 않도록 합니다. */
  z-index: 0; /* 배경이므로 가장 낮은 레이어에 위치합니다. */

  /* 나중에 실제 이미지를 넣을 때  */
  /* background-image: url(여기에 이미지 주소); */
  /* background-size: cover; */
  /* background-position: center; */
`;

// 헤더와 메인을 감싸서 이미지 위에 띄울 '박스' 컨테이너
const ContentBox = styled.div`
  /* 레이어링 및 겹침 효과 */
  position: relative;
  z-index: 1; /* MypageImg(z-index: 0) 위에 위치하도록 설정 */
  margin-top: -110px; /* ◀ 이 값을 조절해 이미지와 겹치는 정도를 변경합니다. */

  /* 박스 모양과 위치 (좌우 여백을 주어 사이드바 영역을 침범하지 않도록 함) */
  margin-left: 30px;
  margin-right: 30px;
  background-color: #fafafa;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);

  /* 내부 컨텐츠(헤더, 메인) 배치 */
  display: flex;
  flex-direction: column;
  flex-grow: 1; /* 남은 세로 공간을 모두 차지 */
`;

// 페이지 상단에 위치할 헤더
const MyPageHeader = styled.header`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  padding: 20px 40px;
  border-bottom: 1px solid #e0e0e0;
  flex-shrink: 0;
  gap: 60px;
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
// 게시물, 팔로우, 정보수정 등을 묶는 컨테이너
const UserActions = styled.div`
   display: flex;
   align-items: center;
   gap: 25px; /* 액션 아이템들 사이의 간격 */
 `;

// 탭 메뉴를 감싸는 컨테이너
const TabMenuContainer = styled.div`
   display: flex;
   justify-content: center; 
   border-bottom: 1px solid #e9ecef;
   width: 100%; /* 부모(ContentBox)의 너비를 꽉 채웁니다. */
 `;

// 개별 탭 버튼
const Tab = styled.button`
   padding: 12px 20px;
   font-size: 1rem;
   font-weight: ${props => (props.active ? '600' : '500')};
   color: ${props => (props.active ? '#343a40' : '#868e96')};
   background-color: transparent;
   border: none;
   border-bottom: 3px solid ${props => (props.active ? '#343a40' : 'transparent')};
   cursor: pointer;
   margin-bottom: -1px; /* 탭의 border-bottom이 TabMenuContainer의 border-bottom과 겹치도록 */
   transition: all 0.2s ease-in-out;
 
   &:hover {
     color: #343a40;
     background-color: #f8f9fa;
   }
 `;

// 기능들이 위치할 메인 컨텐츠 영역
const MyPageMain = styled.main`
   flex-grow: 1; /* 헤더를 제외한 나머지 모든 수직 공간을 차지합니다. */
   display: flex;
   flex-direction: column; /* 탭 메뉴와 컨텐츠를 수직으로 배치 */
   align-items: center;
 `;


//  탭에 따라 선택된 기능이 표시될 영역
const FeatureContent = styled.main`
  flex-grow: 1; /* 헤더를 제외한 나머지 모든 수직 공간을 차지합니다. */
  display: flex;
  justify-content: center; /* 기능들을 수평 중앙에 배치합니다. */
  align-items: center; /* 기능들을 수직 중앙에 배치합니다. */
  padding: 20px;
  width: 100%;  
`;

// 각 기능을 감싸는 박스
const FeatureBox = styled.div`
   padding: 40px;
   border: 1px dashed #ccc;
   border-radius: 8px;
   font-size: 1.2rem;
 `;

const MyPage = () => {

    const [activeTab,setActiveTab] = useState('feature1');


    return(
        <MyPageContainer>
            <MypageImg />
            <ContentBox>
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
                            <Link to="/mypageset">정보수정</Link>
                        </UserActions>
                    </HeaderContent>
                </MyPageHeader>
                <MyPageMain>
                    <TabMenuContainer>
                        <Tab active ={activeTab ==='feature1'} onClick={() => setActiveTab('feature1')}>기능1</Tab>
                        <Tab active ={activeTab ==='feature2'} onClick={() => setActiveTab('feature2')}>기능2</Tab>
                        <Tab active ={activeTab ==='feature3'} onClick={() => setActiveTab('feature3')}>기능3</Tab>
                        <Tab active ={activeTab ==='feature4'} onClick={() => setActiveTab('feature4')}>기능4</Tab>
                    </TabMenuContainer>
                    <FeatureContent>
                        {activeTab === 'feature1' && <FeatureBox>기능1</FeatureBox>}
                        {activeTab === 'feature2' && <FeatureBox>기능2</FeatureBox>}
                        {activeTab === 'feature3' && <FeatureBox>기능3</FeatureBox>}
                        {activeTab === 'feature4' && <FeatureBox>기능4</FeatureBox>}
                    </FeatureContent>
                </MyPageMain>
            </ContentBox>
        </MyPageContainer>
    )
}
export default MyPage;