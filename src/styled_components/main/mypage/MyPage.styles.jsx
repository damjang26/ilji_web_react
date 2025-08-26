import styled from 'styled-components';

// 전체 마이페이지 감싸는 컨테이너
export const MyPageContainer = styled.div`
  display: flex;
  flex-direction: column; /* 헤더와 메인을 수직으로 쌓기 */
  width: 100%;
  height: 100%;
`;

// 마이페이지 상단 배경 이미지를 위한 컨테이너
export const MypageImg = styled.div`
  height: 250px; /* 헤더,메인 박스가 겹칠 수 있도록 높이 확보 */
  margin: -40px 0 0; /* 부모의 여백 무시, 좌우 채우기*/
  width: 100%; 
  background-color: #e9ecef; /*  임시 배경색 */
  flex-shrink: 0; /* 컨테이너 크기 유지. */
  z-index: 0; /* 가장 낮은 레이어에 위치 */

  /* 나중에 실제 이미지를 넣을 때  */
  /* background-image: url(여기에 이미지 주소); */
  /* background-size: cover; */
  /* background-position: center; */
`;

// 헤더, 메인을 감싸서 이미지 위에 띄울 박스 컨테이너
export const ContentBox = styled.div`
  position: relative;
  z-index: 1; /* MypageImg(z-index: 0) 위에 위치하도록 설정 */
  margin-top: -110px; /* 이미지와 겹치는 정도를 변경 */
  margin-left: 30px;  /* 박스 모양과 위치 (좌우 여백) */
  margin-right: 30px;
  background-color: #fafafa;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);  /* 내부 컨텐츠(헤더, 메인) 배치 */
  display: flex;
  flex-direction: column;
  flex-grow: 1; /* 남은 세로 공간을 모두 차지 */
`;

// 페이지 상단에 위치할 헤더
export const MyPageHeader = styled.header`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  padding: 20px 40px;
  border-bottom: 1px solid #e0e0e0;
  flex-shrink: 0;
  gap: 60px;
`;

// 프로필 이미지를 감싸는 컨테이너
export const ImageWrapper = styled.div`
    margin-left: 100px; /*이미지와 왼쪽 끝의 간격 */
    width: 90px; /* 이미지 크기를 변경 */
    height: 90px;
    border-radius: 50%; /* 원형으로 만듭니다 */
    overflow: hidden; /* 이미지가 컨테이너를 벗어나지 않도록 합니다 */
    display: flex; /* 이미지를 중앙에 배치하기 위해 */
    justify-content: center;
    align-items: center;
    flex-shrink: 0; /* 컨테이너가 줄어들어도 이미지 크기는 유지 */
  
  & > img {  /* 실제 이미지 스타일 */
    width: 100%; /* 부모 컨테이너에 꽉 채웁니다 */
    height: 100%; /* 부모 컨테이너에 꽉 채웁니다 */
    object-fit: cover; /* 이미지가 비율을 유지하며 컨테이너를 채우도록 합니다 */
  }
`;

// 이미지 오른쪽의 모든 정보를 감싸는 컨테이너
export const HeaderContent = styled.div`
  display: flex;
  justify-content: flex-start; /* 헤더 info과 헤더 action을 양 끝으로 보냄 */
  align-items: center;
  gap:300px; /* 헤더 info 와 헤더 action의 사이의 간격 */
  flex-grow: 1; /* 헤더의 남은 공간을 모두 차지 */
  min-width: 0; /* flex item이 부모를 넘어가는 것을 방지 */
`;

// 닉네임, 이메일, 이름을 수직으로 묶는 컨테이너
export const UserInfo = styled.div`
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
export const UserActions = styled.div`
   display: flex;
   align-items: center;
   gap: 25px; /* 액션 아이템들 사이의 간격 */
 `;

// 탭 메뉴를 감싸는 컨테이너
export const TabMenuContainer = styled.div`
   display: flex;
   justify-content: center; 
   border-bottom: 1px solid #e9ecef;
   width: 100%; /* ContentBox의 너비 채우기 */
 `;

// 개별 탭 버튼
export const Tab = styled.button`
   padding: 12px 20px;
   font-size: 1rem;
   font-weight: ${props => (props.active ? '600' : '500')};
   color: ${props => (props.active ? '#343a40' : '#868e96')};
   background-color: transparent;
   border: none;
   border-bottom: 3px solid ${props => (props.active ? '#343a40' : 'transparent')};
   cursor: pointer;
   margin-bottom: -1px; /* 탭의 border-bottom이 TabMenuContainer의 border-bottom과 겹치기 */
   transition: all 0.2s ease-in-out;
 
   &:hover {
     color: #343a40;
     background-color: #f8f9fa;
   }
 `;

// 기능들이 위치할 메인 컨텐츠 영역
export const MyPageMain = styled.main`
   flex-grow: 1; /* 헤더를 제외한 나머지 모든 수직 공간을 차지 */
   display: flex;
   flex-direction: column; /* 탭 메뉴와 컨텐츠를 수직으로 배치 */
   align-items: center;
 `;


//  탭에 따라 선택된 기능이 표시될 영역
export const FeatureContent = styled.main`
  flex-grow: 1; /* 헤더를 제외한 나머지 모든 수직 공간을 차지 */
  display: flex;
  justify-content: center; /* 기능들 수평 중앙에 배치 */
  align-items: center; /* 기능들 수직 중앙에 배치 */
  padding: 20px;
  width: 100%;  
`;

// 각 기능을 감싸는 박스
export const FeatureBox = styled.div`
   padding: 40px;
   border: 1px dashed #ccc;
   border-radius: 8px;
   font-size: 1.2rem;
 `;