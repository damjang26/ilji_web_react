import styled from 'styled-components';

// 전체 마이페이지 감싸는 컨테이너
export const MyPageSetContainer = styled.div`
  display: flex;
  flex-direction: column; /* 헤더, 메인을 수직으로 쌓기 */
  width: 100%;
  height: 100%;
`;

// 마이페이지 상단 배경 이미지를 위한 컨테이너
export const MypageImg = styled.div`
  height: 250px; /* 헤더,메인 박스가 겹칠 수 있도록 높이를 확보 */
  margin: -40px 0 0; /* 부모의 여백을 무시, 좌우를 채우기 */
  width: 100%; 
  background-color: #e9ecef; /* 이미지가 없을 때 보일 임시 배경색 */
  flex-shrink: 0; /* 컨테이너 크기 줄어들기 방지 */
  z-index: 0; /* 배경 역할 가장 낮은 레이어에 위치 */

  /* 나중에 실제 이미지를 넣을 때  */
  /* background-image: url(여기에 이미지 주소); */
  /* background-size: cover; */
  /* background-position: center; */
`;

// 헤더와 메인을 감싸서 이미지 위에 띄울 박스 컨테이너
export const ContentBox = styled.div`
  position: relative;
  z-index: 1; /* MypageImg(z-index: 0) 위 설정 */
  margin-top: -110px; /* 이미지와 겹치는 정도를 변경 */
  margin-left: 30px;  /* 박스 모양과 위치 */
  margin-right: 30px;
  background-color: #fafafa;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);/* 내부 컨텐츠(이미지, 정보, 버튼)를 배치 */
  display: flex;
  flex-direction: column;
  align-items: center; /* 내부 요소 중앙 정렬 */
  padding: 30px; /* 박스 안쪽에 여유 공간 */
`;

// 페이지 상단에 위치할 헤더
export const UserInfo = styled.header`
  display: flex;
  flex-direction: column; /* 정보들을 세로로 나열 */
  align-items: flex-start; /* 왼쪽 정렬 */
  padding: 20px 40px;
  gap: 15px; /* 각 정보 항목 사이의 간격 */
  width: 100%; /* 부모 컨테이너의 너비를 채우기 */
`;

// 프로필 이미지를 감싸는 컨테이너
export const ImgWrapper = styled.div`
    margin-left: -800px; /*이미지와 왼쪽 끝의 간격 */

  & > img {/* <img> 태그에 직접 스타일을 적용합니다. */
    width: 120px; /* 이미지 크기를 변경. */
    height: 120px;
    border-radius: 50%; /* 이미지를 원형으로 만듭니다. */
    object-fit: cover; /* 이미지 비율을 유지하면서 원을 채웁니다. */
    flex-shrink: 0; /* 컨테이너가 줄어도 이미지 크기 유지 */
  }
`;

// 수정, 취소 버튼을 감싸는 컨테이너
export const Check = styled.div`
  display: flex;
  gap: 20px; /* 버튼 사이의 간격 */
  margin-top: 20px;
`;

// 선을 만들기 위한 간단한 컴포넌트
export const Divider = styled.div`
  width: 100%; /*  선의 길이를 변경 */
  height: 1px;
  background-color: #e0e0e0;
  margin: 10px 0 20px 0; /* 위, 아래 여백 */
`;