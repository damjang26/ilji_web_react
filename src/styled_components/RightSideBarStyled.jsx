import styled from "styled-components";

/* 오른쪽 사이드바 전체 영역을 감싸는 최상위 컨테이너 */
export const RightSectionContainer = styled.aside`
    width: 230px;
    flex-shrink: 0; /* 창 크기가 줄어도 너비 유지 */
    position: relative; /* 내부 요소 포지셔닝 기준 */
`;

/*  실제 사이드바 패널(헤더, 내용)을 감싸는 래퍼 */
export const SidebarPanelWrapper = styled.div`
  position: absolute;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: #f8f9fa;
  border-left: 1px solid #e9ecef;
  box-sizing: border-box;
  transition: right 0.3s ease-in-out;

  /* isPanelOpen 상태에 따라 패널을 화면 안팎으로 슬라이드 */
  right: ${({ isPanelOpen }) => (isPanelOpen ? '0' : '-100%')};
  z-index: 20; /* QuickBar보다 위에 있도록 설정 */
`;

/* 사이드바 패널의 헤더 영역 */
export const PanelHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 20px 20px 0 20px;
  box-sizing: border-box;
  font-weight: bold;
`;

/* 사이드바 패널을 닫는 'X' 버튼입*/
export const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  color: #6c757d;
`;

/* 사이드바 패널의 주된 내용(MessageTab, ScheduleTab 등)이 들어가는 영역*/
export const PanelBody = styled.div`
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
`;