import Profile from "./left_side_bar/Profile.jsx";
import CalendarMenu from "./left_side_bar/CalendarMenu.jsx";
import TabMenu from "./left_side_bar/TabMenu.jsx";
import styled from "styled-components";

const SidebarContainer = styled.aside`
    width: 200px; /* 사이드바 너비 지정 */
    flex-shrink: 0; /* 창 크기가 줄어들어도 사이드바 너비는 유지 */
    height: 100vh; /* 화면 전체 높이를 차지하도록 설정 */
    background-color: #f8f9fa; /* 배경색 */
    padding: 20px; /* 내부 여백 */
    border-right: 1px solid #e9ecef; /* 오른쪽에 구분선 추가 */
    box-sizing: border-box; /* 패딩과 테두리가 높이에 포함되도록 설정하여 스크롤바 문제를 해결합니다. */

    /* Flexbox를 사용하여 내부 요소들을 정렬합니다. */
    display: flex;
    flex-direction: column; /* 아이템을 세로로 쌓음 */
    align-items: center; /* 아이템을 가로축의 중앙에 배치 */
    gap: 30px; /* 헤더와 메뉴 아이템 그룹 사이의 간격 */
`;

// Profile, TabMenu, CalendarMenu를 감싸는 컨테이너입니다.
const MenuItemsContainer = styled.div`
    display: flex;
    flex-direction: column;
    flex-grow: 1; /* 부모 컨테이너의 남은 공간을 모두 차지합니다. */
    width: 100%; /* 내부 아이템들의 정렬을 위해 너비를 100%로 설정합니다. */
`;

// 각 메뉴 아이템을 감싸서 동일한 공간을 차지하게 하고, 내부 정렬을 제어합니다.
const MenuItemWrapper = styled.div`
    flex: 1; /* 세 아이템이 남은 공간을 1:1:1 비율로 균등하게 나눕니다. */
    display: flex;
    align-items: flex-start; /* 컨텐츠를 할당된 공간의 '상단'에 정렬합니다. */
    justify-content: center; /* 컨텐츠를 '수평 중앙'에 정렬합니다. */
    width: 100%;

    /* 마지막 아이템을 제외하고, 각 아이템의 공간 하단에 구분선을 추가합니다. */

    &:not(:last-child) {
        border-bottom: 1px solid #e0e0e0; /* 임시 구분선 */
    }
`;

const LeftSideBar = () => {
    return (
        <SidebarContainer>
            <MenuItemsContainer>
                <MenuItemWrapper><Profile/></MenuItemWrapper>
                <MenuItemWrapper><TabMenu/></MenuItemWrapper>
                <MenuItemWrapper><CalendarMenu/></MenuItemWrapper>
            </MenuItemsContainer>
        </SidebarContainer>
    );
}

export default LeftSideBar;