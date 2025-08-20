import Profile from "./LeftSideBar/Profile.jsx";
import CalendarMenu from "./LeftSideBar/CalendarMenu.jsx";
import TabMenu from "./LeftSideBar/TabMenu.jsx";
import styled from "styled-components";

const SidebarContainer = styled.aside`
  width: 280px; /* 사이드바 너비 지정 */
  flex-shrink: 0; /* 창 크기가 줄어들어도 사이드바 너비는 유지 */
  height: 100vh; /* 화면 전체 높이를 차지하도록 설정 */
  background-color: #f8f9fa; /* 배경색 */
  padding: 20px; /* 내부 여백 */
  border-right: 1px solid #e9ecef; /* 오른쪽에 구분선 추가 */

  /* Flexbox를 사용하여 내부 요소들을 정렬합니다. */
  display: flex;
  flex-direction: column; /* 아이템을 세로로 쌓음 */
  align-items: center;   /* 아이템을 가로축의 중앙에 배치 */
  gap: 20px;             /* 아이템 사이의 수직 간격을 추가 */
`;

const LeftSideBar = () => {
    return (
        <SidebarContainer>
            <div>left side bar</div>
            <Profile />
            <TabMenu />
            <CalendarMenu />
        </SidebarContainer>
    );
}

export default LeftSideBar;