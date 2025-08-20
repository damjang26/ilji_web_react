import styled from "styled-components";

export const CalendarWrapper = styled.div`
  max-width: 900px;
  margin: 20px auto;

  /* FullCalendar 헤더 중앙 정렬을 위한 CSS */
  .fc-header-toolbar .fc-toolbar-chunk:nth-child(2) {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5em; /* 버튼과 제목 사이의 간격을 예쁘게 조정합니다 */
  }

    .fc .fc-toolbar {
        align-items: center;
        display: flex
    ;
        justify-content: space-between;
    } 

    /* 캘린더 상단 제목 (예: August 2025) */
    .fc .fc-toolbar-title {
        font-size: 15px;   /* 원하는 크기로 조정 */
        font-weight: 600;  /* 글자 두께 */
        color: #333;       /* 색상 */
        margin: 0 12px;    /* prev/next 사이 간격 */
    }

    /* 공통 버튼 스타일 */
    .fc .fc-button {
        background-color: #fff;
        color: #333;
        border: none;
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
        font-size: 13px;  /* 화살표 크기 */
        padding: 6px 14px; /* 버튼 크기도 조금 키움 */
    }

    /* hover 효과 */
    .fc .fc-button:hover {
        background-color: #f7f7f7;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
    }

    /* active 상태 (클릭 중) */
    .fc .fc-button:active {
        background-color: #eee;
        box-shadow: inset 0 2px 4px rgba(0,0,0,0.2);
    }

    /* 선택된 버튼 (예: 현재 뷰) */
    .fc .fc-button.fc-button-active {
        background-color: #007bff;   /* 파란색 배경 */
        color: #fff;                 /* 흰색 글자 */
        box-shadow: 0 2px 6px rgba(0, 123, 255, 0.5);
    }

`;