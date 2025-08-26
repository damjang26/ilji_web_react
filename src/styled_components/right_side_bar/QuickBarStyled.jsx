import styled, { css } from "styled-components";

// 퀵바 아이템들을 감싸는 메인 컨테이너
export const QuickBarContainer = styled.div`
  position: absolute;
  top: 95px; /* 헤더 높이 등을 고려한 상단 여백 */
  z-index: 10; /* 패널보다는 아래, Main 컨텐츠보다는 위에 위치 */
  transition: right 0.3s ease-in-out;

  display: flex;
  flex-direction: column; /* 버튼들을 세로로 정렬 */
  gap: 15px; /* 버튼들 사이의 간격 */

  ${({ isPanelOpen }) =>
    isPanelOpen
      ? css`
          /* 상태 1: 패널 열림 -> Main 영역 위에 오버레이 */
          right: 250px; /* RightSideBar 컨테이너(230px) 바로 왼쪽에 위치하도록 설정 */
        `
      : css`
          /* 상태 2: 패널 닫힘 -> RightSideBar 컨테이너 내부에 위치 */
          right: 30px;/* (컨테이너 너비 230px - 버튼 너비 50px) / 2 = 90px */
                /* 컨테이너 중앙에 오도록 right 값을 조정합니다. */
        `}
`;

// 퀵바 내부의 개별 버튼
export const QuickBarButton = styled.button`
  width: 60px;
  height: 60px;
  border-radius: 50%; /* 원형 버튼 */
  border: 1px solid #e9ecef;
  background-color: white;
  color: #495057;
  font-size: 1.5rem;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); /* 입체감을 주는 그림자 */
  display: flex;
  justify-content: center;
  align-items: center;
`;