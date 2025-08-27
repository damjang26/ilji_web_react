import styled from "styled-components";

// 왼쪽 사이드바 전체를 감싸는 메인 컨테이너
export const SidebarContainer = styled.aside`
  //z-index: 1000;
  width: 230px; /* 사이드바 너비 지정 */
  flex-shrink: 0; /* 창 크기가 줄어도 사이드바 너비는 유지 */
  height: 100%; /* 화면 전체 높이를 차지하도록 설정 */
  background-color: #f8f9fa; /* 배경색 */
  padding: 20px; /* 내부 여백 */
  border-right: 1px solid #e9ecef; /* 오른쪽에 구분선 추가 */
  box-sizing: border-box; /* 패딩과 테두리가 높이에 포함되도록 설정, 스크롤바 문제를 해결 */
  flex-direction: column; /* 아이템을 세로로 쌓음 */
  align-items: center; /* 아이템을 가로축의 중앙에 배치 */
  gap: 30px; /* 헤더와 메뉴 아이템 그룹 사이의 간격 */
  display: flex;
  //position: fixed; //maind을 중앙 정렬 방해 요소 : 나중에 확인용으로 일단 주석처리함
  //top: 0;
  //left: 0;
  //z-index: 10;
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
  display: flex;
  width: 100%;
  flex: 1; /* 자식 요소들이 남은 공간을 동일한 1:1:1 비율로 나누어 가짐 */
  align-items: flex-start; /* 컨텐츠를 할당된 공간의 상단 정렬 */
  justify-content: center; /* 컨텐츠를 수평 중앙에 정렬 */

  &:not(:last-child) {
    border-bottom: 1px solid #e0e0e0; /* 마지막 아이템을 제외, 각 아이템의 공간 하단에 구분선 추가  */
  }

  /* 2번째 자식 요소에만 padding-bottom을 적용합니다. */
  &:nth-child(2) {
    padding-bottom: 30px;
  }
`;

// 알림 눌렀을 때 나오는 사이드바
export const NotiSidebarWrapper = styled.div`
  position: fixed;
  top: 0;
  left: 230px; /* LeftSideBar(230px) 바로 옆에 위치하도록 설정 */
  height: 100%;
  width: 300px;
  background-color: #fff;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.2);
  z-index: 1; /* Overlay보다 위에, LeftSideBar보다는 아래에 위치 */
  padding: 20px;

  /* open 상태에 따라 위치와 가시성을 제어합니다. */
  transform: translateX(${({ open }) => (open ? "0" : "-100%")});
  visibility: ${({ open }) => (open ? "visible" : "hidden")};

  /* transform과 visibility에 transition을 적용합니다. */
  transition: transform 0.3s ease-in-out, visibility 0.3s;
`;

// 알림 사이드바 오버레이 (열렸을 때 나머지 화면을 덮는 반투명 레이어 / 클릭 시 사이드바를 닫는 용도로 사용 가능)
export const Overlay = styled.div`
  /* open 상태일 때만 보이도록 설정 */
  visibility: ${({ open }) =>
    open
      ? "visible"
      : "hidden"}; /* open prop에 따라 요소의 렌더링 여부를 결정 (보이거나, 공간은 차지하지 않고 숨김) */
  opacity: ${({ open }) =>
    open
      ? "1"
      : "0"}; /* open prop에 따라 투명도를 조절하여 나타나고 사라지는 효과 */
  position: fixed; /* 뷰포트(화면)를 기준으로 위치를 고정 */
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  transition: opacity 0.3s ease-in-out, visibility 0.3s ease-in-out; /* opacity와 visibility 속성 변경 시 0.3초 동안 전환 효과 적용 */
`;
