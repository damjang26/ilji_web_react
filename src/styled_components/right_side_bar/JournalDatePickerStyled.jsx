import styled, {createGlobalStyle} from "styled-components";

// ✅ [신규] 캘린더 내부의 세부 스타일을 적용하기 위한 전역 스타일
export const CalendarGlobalStyle = createGlobalStyle`
    /* 선택된 날짜 (보라색 동그라미) */
    .react-datepicker__day--selected,
    .react-datepicker__day--keyboard-selected {
        background-color: #7b5fff !important;
        color: white !important;
        border-radius: 50%;
    }

    /* 오늘 날짜 */
    .react-datepicker__day--today {
        font-weight: bold;
    }

    /* 마우스 올렸을 때 */
    .react-datepicker__day:hover {
        background-color: #f0ebff !important;
        border-radius: 50%;
    }

    /* 비활성화된 날짜 */
    .react-datepicker__day--disabled {
        color: #ccc !important;
        cursor: not-allowed;

        &:hover {
            background-color: transparent !important; /* 호버 효과 제거 */
        }
    }
`;

// datepicker의 z-index를 antd Modal보다 높게 설정하고, 기본 틀 스타일을 지정합니다.
export const DatePickerWrapper = styled.div`
    .react-datepicker-popper {
        z-index: 1050 !important; // antd Modal z-index가 1000
    }

    .react-datepicker {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';
        border: 1px solid #d9d9d9;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .react-datepicker__header {
        background-color: #f0f0f0;
        border-bottom: 1px solid #d9d9d9;
    }
`;

// DatePicker와 버튼을 감싸는 전체 컨테이너
export const DatePickerContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center; /* 내부 요소들을 가운데 정렬합니다. */
    gap: 16px; /* 달력과 버튼 사이의 간격을 줍니다. */
    width: 100%;
    padding: 8px;
`;

// 패널 상단의 설명 텍스트
export const PanelDescription = styled.p`
    font-size: 14px;
    color: #555;
    margin: 0;
    padding-top: 8px;
`;