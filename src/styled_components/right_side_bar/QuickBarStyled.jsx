import styled from "styled-components";

// RightSideBar의 너비와 원하는 여백을 상수로 정의하면 유지보수가 편리합니다.
const RIGHT_SIDEBAR_WIDTH = 230; // px
const MARGIN_FROM_SIDEBAR = 20; // px

// 퀵바 아이템들을 감싸는 메인 컨테이너
export const QuickBarContainer = styled.div`
  position: fixed; /* 화면 스크롤과 상관없이 위치 고정 */
  top: 80px; /* 화면 상단에서의 위치 */
  /* RightSideBar 바로 왼쪽에 위치하도록 right 속성 계산 */
  right: ${RIGHT_SIDEBAR_WIDTH + MARGIN_FROM_SIDEBAR}px;
  z-index: 20; /* 다른 요소들보다 위에 표시되도록 설정 */
  display: flex;
  flex-direction: column; /* 버튼들을 세로로 정렬 */
  gap: 15px; /* 버튼들 사이의 간격 */
`;

// 퀵바 내부의 개별 버튼
export const QuickBarButton = styled.button`
  width: 50px;
  height: 50px;
  border-radius: 50%; /* 원형 버튼 */
  border: 1px solid #e9ecef;
  background-color: white;
  color: #495057;
  font-size: 1.2rem;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); /* 입체감을 주는 그림자 */
  display: flex;
  justify-content: center;
  align-items: center;
`;