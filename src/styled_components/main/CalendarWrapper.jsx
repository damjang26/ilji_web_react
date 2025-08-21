import styled from "styled-components";

export const CalendarWrapper = styled.div`

    flex-grow: 1; /* 남는 공간 모두 채움 */
    display: flex;
    flex-direction: column;

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
        color: #8394a6; /* 색상 */
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
        color: #8394a6;
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
    }


    .fc .fc-daygrid-day-top {
        display: flex;
        flex-direction: row;
    }

    .fc .fc-daygrid-day-number {
        color: #8394a6;
        font-size: 14px;
    }

    .fc .fc-daygrid-day-frame {
        min-height: 90px;
    }
    
`;