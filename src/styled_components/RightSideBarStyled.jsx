import styled from "styled-components";

/* 오른쪽 사이드바 전체 영역을 감싸는 최상위 컨테이너 */
export const RightSectionContainer = styled.aside`
    flex-shrink: 0; /* 창 크기가 줄어도 너비 유지 */
    position: relative; /* 내부 요소 포지셔닝 기준 */

    /* 패널 너비(230px)만큼 공간을 차지합니다. */
    width: 230px;
`;

/*  실제 사이드바 패널(헤더, 내용)을 감싸는 래퍼 */
export const SidebarPanelWrapper = styled.div`
    position: absolute;
    top: 0;
    right: 0;
    width: 230px;
    height: 100%;
    background-color: #ffffff;
    border-left: 1px solid #e9ecef;
    box-shadow: -2px 0 8px rgba(0, 0, 0, 0.05);
    z-index: 20; /* QuickBar보다 위에 있도록 설정 */
    transition: transform 0.35s ease-in-out;

    /* ✅ isPanelOpen 대신 $isPanelOpen을 사용하고, transform으로 애니메이션을 처리합니다. */
    transform: translateX(${({ $isPanelOpen }) => ($isPanelOpen ? "0" : "100%")});
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
  flex-grow: 1; /* 헤더를 제외한 나머지 공간을 모두 차지 */
  overflow-y: auto; /* 내용이 길어지면 스크롤 */
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  background-color: #f8f9fa;
`;