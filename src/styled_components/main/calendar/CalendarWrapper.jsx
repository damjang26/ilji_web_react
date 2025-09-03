import styled, {keyframes} from "styled-components";

export const CalendarWrapper = styled.div`

    flex-grow: 1; /* 남는 공간 모두 채움 */
    display: flex;
    flex-direction: column;
    color: #8394a6;

    /* week/day view 스크롤 숨김 */

    .fc-timegrid-scroller,
    .fc-scroller {
        scrollbar-width: none;
        -ms-overflow-style: none;
    }

    .fc-timegrid-scroller::-webkit-scrollbar,
    .fc-scroller::-webkit-scrollbar {
        display: none;
    }

    /* FullCalendar 헤더 중앙 정렬을 위한 CSS */

    .fc-header-toolbar {
        position: relative; /* 자식 absolute 기준 */
        display: flex;
        align-items: center;
        justify-content: space-between; /* 좌우 버튼 자연스럽게 배치 */
        margin-left: 20px;
        margin-right: 20px;
    }

    .fc-header-toolbar .fc-toolbar-chunk:nth-child(2) {
        position: absolute;
        left: 50%;
        transform: translateX(-50%); /* 가로축 정확히 가운데 */
        display: flex;
        align-items: center;
        gap: 0.5em; /* 버튼과 제목 간격 유지 */
    }


    /* 캘린더 상단 제목 (예: August 2025) */

    .fc .fc-toolbar-title {
        font-family: 'Inter', sans-serif;
        font-size: 15px; /* 원하는 크기로 조정 */
        font-weight: 600; /* 글자 두께 */
        margin: 0 12px; /* prev/next 사이 간격 */
    }

    /* 공통 버튼 스타일 */

    .fc .fc-button {
        background-color: #fff;
        color: #8394a6;
        border: 2px solid #e4eaf1;
        border-radius: 50px;
        padding: 8px 16px;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
        font-weight: 500;
        transition: all 0.2s ease-in-out;
    }

    /* 🔹 일반 버튼 글자 크기 (today, month/week/day) */

    .fc .fc-button:not(.fc-prev-button):not(.fc-next-button) {
        font-size: 11px;
    }

    /* 🔹 prev/next 버튼 화살표만 크게 */

    .fc .fc-prev-button,
    .fc .fc-next-button {
        font-size: 13px; /* 화살표 크기 */
        padding: 6px 14px; /* 버튼 크기도 조금 키움 */
    }

    /* hover 효과 */

    .fc .fc-button:hover {
        background-color: #f7f7f7;
        border: 2px solid #c4d3e3;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
    }

    /* active 상태 (클릭 중) */

    .fc .fc-button:active {
        background-color: #eee;
        box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.2);
    }

    /* 선택된 버튼 (예: 현재 뷰) */

    .fc .fc-button.fc-button-active {
        background: linear-gradient(45deg, #97c0ff, #7b5fff, #ff7eb9); /* 왼쪽 보라-블루, 오른쪽 핑크 */
        color: #fff; /* 글자는 흰색 */
        border: 1px solid rgba(85, 85, 85, 0.5);
        box-shadow: 0 2px 6px rgba(123, 94, 255, 0.5); /* 왼쪽 색 기준 그림자 */
    }


    /* 캘린더 전체 표(grid)의 테두리를 제거합니다. */

    .fc-scrollgrid {
        border: none;
    }

    /* 요일 헤더 전체 */

    .fc-col-header-cell {
        text-align: center;
        padding: 10px 0;
        border-right: none;
        border-left: none;
        border-top: none;
        border-bottom: 1px solid #dee2e8;
        font-family: 'Inter', sans-serif;
    }

    /* 주말(토/일) 색상 따로 */

    .fc-col-header-cell.fc-day-sat {
        color: #898cdc; /* 분홍 */
    }

    .fc-col-header-cell.fc-day-sun {
        color: #d3a2a2; /* 빨강 */
    }

    /* 일요일 */

    .fc-daygrid-day.fc-day-sun {
        background-color: #f9f9f9; /* 연한 회색 */
    }

    /* 토요일 */

    .fc-daygrid-day.fc-day-sat {
        background-color: #f9f9f9;
    }

    /* 날짜(1~31) 셀에만 테두리를 적용합니다. */

    .fc-daygrid-day {
        border: 1px solid #e4eaf1; /* 버튼 테두리와 동일한 색상으로 통일감 */
        position: relative; /* highlight 요소의 기준점 */
        min-height: 90px; /* 셀 자체에 최소 높이를 지정 */
    }


    .fc .fc-daygrid-day-top {
        display: flex;
        flex-direction: row;
    }

    /* dayCellContent로 생성된 커스텀 컨테이너 스타일 */

    .day-cell-content-wrapper {
        display: flex;
        align-items: center;
        gap: 4px; /* 날짜와 아이콘 간격 */
        padding: 2px; /* 셀 가장자리와의 여백 */
    }

    .fc .fc-daygrid-day-number {
        /* ✅ [수정] 중앙 정렬 및 기타 불필요한 속성을 제거하고,
           자식 컨테이너(.day-cell-content-wrapper)가 내용을 그리도록 위임합니다. */
        padding: 0;
        font-size: 14px;
    }

    /* ✅ [제거] .journal-icon 규칙은 아래에서 상태별로 한 번에 관리합니다. */

    /* ✅ [수정] 오늘 날짜 숫자만 감싸는 보라색 동그라미 */

    .today-number-circle {
        border-radius: 50%;
        background: #9781ff;
        width: 26px;
        height: 26px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #fff;
        font-weight: 600;
    }

    /* 오늘이 아닌 날짜의 숫자 (정렬을 위해 동그라미와 동일한 크기 차지) */

    .other-day-number {
        width: 26px;
        height: 26px;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    /* 아이콘 공통 스타일 및 상태별 색상 */

    .journal-icon {
        font-size: 18px; /* 아이콘 크기 */
        display: flex; /* 아이콘 수직 정렬을 위해 */
        align-items: center;

        &.plus {
            color: #9781ff;
        }

        &.check {
            color: #28a745;
        }

        &.lock {
            color: #6c757d;
        }
    }

    .fc .fc-daygrid-day-frame {
        /* min-height: 90px; */ /* 부모인 fc-daygrid-day로 이동 */
    }

    // 오늘 날짜 배경 색상 변경!

    .fc .fc-daygrid-day.fc-day-today {
        background: #eaf6ff; /* 연한 파란색 */
    }

    /* Week / Day view - today 컬럼 전체 */

    .fc-timegrid-col.fc-day-today {
        background-color: #eaf6ff; /* 연한 파란색 */
    }

    /* Week / Day view - all-day 영역 */

    .fc-timegrid-all-day.fc-day-today {
        background-color: #eaf6ff; /* 연한 파란색 */
    }

    // 일정 컨테이너 디자인 나중에 일정 카테고리 생기면 그거별로 나눠야 함

    .fc-event {
        border: none; /* 기본 파란 테두리 제거 */
        background: transparent; /* 필요 없으면 배경도 투명 */
        box-shadow: none; /* 혹시 그림자 있으면 제거 */
    }

    .fc-event .fc-event-main {
        /* background: rgba(255, 247, 251, 0.79); */ /* 동적 색상 적용을 위해 제거 */
        /* border: 1.5px solid #ff7eb9; */ /* 동적 색상 적용을 위해 제거 */
        border-radius: 3px;
        /* color: #ff7eb9; */ /* 동적 색상 적용을 위해 제거 */
    }

    .fc-event-time {
        text-transform: uppercase;
    }

    /* 날짜 선택 시 배경이 셀을 꽉 채우도록 수정 */

    .fc .fc-highlight {
        background: rgba(255, 126, 185, 0.1); /* 더 연한 분홍색 */
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
    }

`;

// 날짜에 호버했을 때 나타나는 일기 메뉴(모달) 스타일
export const DiaryPopoverContainer = styled.div`
    position: fixed; /* Portal을 사용하므로 fixed로 위치를 잡습니다. */
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 1100; /* 다른 모든 요소 위에 오도록 높은 z-index 설정 */
    padding: 8px;
    display: flex;
    flex-direction: column;
    gap: 4px;
    /* 마우스가 팝오버 위로 이동할 수 있도록 설정 */
    pointer-events: auto;
    transition: opacity 0.15s ease-in-out;
    opacity: ${({$visible}) => ($visible ? 1 : 0)};
    visibility: ${({$visible}) => ($visible ? 'visible' : 'hidden')};
`;

// 팝오버 안의 개별 버튼 스타일
export const DiaryPopoverButton = styled.button`
    background: none;
    border: none;
    padding: 8px 12px;
    width: 100%;
    text-align: left;
    font-size: 14px;
    color: #333;
    border-radius: 4px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;

    &:hover {
        background-color: #f0f2f5;
    }
`;

// --- 로딩 스피너 관련 스타일 ---

// 스피너 회전 애니메이션
const spin = keyframes`
    from {
        transform: rotate(0deg);
    }
    to {
        transform: rotate(360deg);
    }
`;

// 스피너를 캘린더 중앙에 위치시키기 위한 래퍼
export const SpinnerWrapper = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(255, 255, 255, 0.7); // 반투명 배경
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000; // 캘린더 위에 표시
    border-radius: 8px; // 부모 컨테이너와 맞춤
`;

// 스피너 자체의 스타일
export const Spinner = styled.div`
    border: 4px solid rgba(0, 0, 0, 0.1);
    border-left-color: #9781ff; // 스피너 색상 (테마 색상과 유사하게)
    border-radius: 50%;
    width: 40px;
    height: 40px;
    animation: ${spin} 1s linear infinite;
`;