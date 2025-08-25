import styled from "styled-components";

export const SidebarContainer = styled.aside`
    //z-index: 1000;
    width: 230px; /* 사이드바 너비 지정 */
    flex-shrink: 0; /* 창 크기가 줄어도 사이드바 너비는 유지 */
    height: 100vh; /* 화면 전체 높이를 차지하도록 설정 */
    background-color: #f8f9fa; /* 배경색 */
    padding: 20px; /* 내부 여백 */
    border-right: 1px solid #e9ecef; /* 오른쪽에 구분선 추가 */
    box-sizing: border-box; /* 패딩과 테두리가 높이에 포함되도록 설정, 스크롤바 문제를 해결 */
    display: flex;
    flex-direction: column; /* 아이템을 세로로 쌓음 */
    align-items: center; /* 아이템을 가로축의 중앙에 배치 */
    gap: 30px; /* 헤더와 메뉴 아이템 그룹 사이의 간격 */
    position: fixed;
    top: 0;
    left: 0;
    z-index: 10;
`;

// Profile, TabMenu, CalendarMenu 감싸는 컨테이너
export const MenuItemsContainer = styled.div`
    display: flex;
    flex-direction: column;
    flex-grow: 1; /* 부모 컨테이너의 남은 공간을 모두 차지 */
    width: 100%; /* 내부 아이템들의 정렬을 위해 너비를 100%로 설정 */
`;

// 각 메뉴 아이템을 감싸서 동일한 공간을 차지, 내부 정렬을 제어
export const MenuItemWrapper = styled.div`
    flex: 1; /* 세 아이템이 남은 공간을 1:1:1 비율로  나누기 */
    display: flex;
    align-items: flex-start; /* 컨텐츠를 할당된 공간의 상단 정렬 */
    justify-content: center; /* 컨텐츠를 수평 중앙에 정렬 */
    width: 100%;

    &:not(:last-child) {
        border-bottom: 1px solid #e0e0e0; /* 마지막 아이템을 제외, 각 아이템의 공간 하단에 구분선 추가  */
    }
`;

// 알림 눌렀을 때 나오는 사이드바
export const NotiSidebarWrapper = styled.div`
    position: fixed;
    top: 0;
    /* LeftSideBar(200px) 바로 옆에 위치하도록 설정 */
    left: 230px;
    height: 100%;
    width: 300px;
    background-color: #fff;
    box-shadow: 2px 0 8px rgba(0, 0, 0, 0.2);
    z-index: 1; /* Overlay보다 위에, LeftSideBar보다는 아래에 위치 */
    padding: 20px;

    /* open 상태에 따라 위치와 가시성을 제어합니다. */
    transform: translateX(${({open}) => (open ? "0" : "-100%")});
    visibility: ${({open}) => (open ? "visible" : "hidden")};

    /* transform과 visibility에 transition을 적용합니다. */
    transition: transform 0.3s ease-in-out, visibility 0.3s;
`;

// 알림 사이드바 오버레이 (사실 잘 모르겠음)
export const Overlay = styled.div`
    /* open 상태일 때만 보이도록 설정 */
    visibility: ${({open}) => (open ? "visible" : "hidden")};
    opacity: ${({open}) => (open ? "1" : "0")};
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 0; /* 모든 z-index의 기반이 되는 배경 */
    transition: opacity 0.3s ease-in-out, visibility 0.3s ease-in-out;
`;