import styled from "styled-components";

// 왼쪽 사이드바 전체를 감싸는 메인 컨테이너
export const SidebarContainer = styled.aside`
    width: 230px;
    flex-shrink: 0;
    height: 100vh;
    background-color: #f8f9fa;
    padding: 20px;
    border-right: 1px solid #e9ecef;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 30px;
    z-index: 10;
`;

// Profile, TabMenu, CalendarMenu 감싸는 컨테이너
export const MenuItemsContainer = styled.div`
    position: relative; // 자식 absolute 요소의 기준점
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    width: 100%;
    overflow: hidden; // 자식 요소가 넘칠 경우 숨김
`;

// 각 메뉴 아이템을 감싸서 동일한 공간을 차지, 내부 정렬을 제어
export const MenuItemWrapper = styled.div`
    position: relative; // 자식 absolute 요소의 기준점
    display: flex;
    width: 100%;
    align-items: flex-start;
    justify-content: center;
    transition: all 0.5s ease-in-out;

    // $isCollapsed 상태에 따라 스타일 변경
    max-height: ${({ $isCollapsed }) => ($isCollapsed ? '0' : '500px')};
    opacity: ${({ $isCollapsed }) => ($isCollapsed ? '0' : '1')};
    overflow: hidden;

    &:not(:last-child) {
        border-bottom: 1px solid #e0e0e0;
        padding-top: ${({ $isCollapsed }) => ($isCollapsed ? '0' : 'undefined')};
        padding-bottom: ${({ $isCollapsed }) => ($isCollapsed ? '0' : 'undefined')};
    }
`;

// [신규] Profile 컴포넌트 우측 상단에 위치할 알림 아이콘 버튼
export const NotificationIconButton = styled.button`
    position: absolute;
    top: 10px;
    right: 10px;
    background: none;
    border: none;
    cursor: pointer;
    font-size: 20px;
    color: #868e96;

    &:hover {
        color: #343a40;
    }
`;

// [신규] 읽지 않은 알림 개수를 표시할 뱃지
export const Badge = styled.span`
    position: absolute;
    top: -5px;
    right: -5px;
    background-color: #fa5252; // 빨간색
    color: white;
    border-radius: 50%;
    padding: 1px 4px;
    font-size: 9px;
    font-weight: bold;
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 16px;
    height: 16px;
    border: 1px solid white;
`;



// 알림 눌렀을 때 나오는 사이드바
export const NotiSidebarWrapper = styled.div`
    position: fixed;
    top: 0;
    left: 230px;
    height: 100%;
    width: 300px;
    background-color: #fff;
    box-shadow: 2px 0 8px rgba(0, 0, 0, 0.2);
    z-index: 1;
    transform: translateX(${({open}) => (open ? "0" : "-100%")});
    visibility: ${({open}) => (open ? "visible" : "hidden")};
    transition: transform 0.3s ease-in-out, visibility 0.3s;
`;

// 알림 사이드바 오버레이
export const Overlay = styled.div`
    visibility: ${({open}) => (open ? "visible" : "hidden")};
    opacity: ${({open}) => (open ? "1" : "0")};
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
    transition: opacity 0.3s ease-in-out, visibility 0.3s ease-in-out;
`;