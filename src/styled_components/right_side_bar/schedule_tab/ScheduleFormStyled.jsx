import styled from "styled-components";

/** ScheduleForm.jsx & ScheduleEdit.jsx의 스타일을 정의합니다. (일정 추가/수정 폼) */

export const FormWrapper = styled.div`
    padding: 8px;
    box-sizing: border-box;
`;

export const FormBody = styled.div`
    display: grid;
    gap: 16px;
`;

/** 라벨과 입력 필드를 묶는 컨테이너 */
export const FieldSet = styled.div`
    display: grid;
    gap: 6px;
`;

/** 입력 필드의 라벨 */
export const Label = styled.label`
    font-size: 13px;
    font-weight: 500;
    color: #495057;
`;

/** input, textarea의 기본 스타일 */
export const Input = styled.input`
    width: 100%;
    padding: 8px 12px;
    border: 1px solid #dee2e6;
    border-radius: 4px;
    font-size: 14px;
    box-sizing: border-box;
    background-color: #f8f9fa;
    transition: border-color 0.2s, background-color 0.2s;

    &:focus {
        outline: none;
        border-color: #3498db;
        background-color: white;
    }
`;

/** '하루 종일' 체크박스를 위한 스타일 */
export const CheckboxWrapper = styled.label`
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    font-size: 14px;
`;

/** 날짜와 시간 입력 필드를 한 줄에 배치하기 위한 컨테이너 */
export const DateTimeRow = styled.div`
    display: grid; /* flex에서 grid로 변경하여 자식 요소들을 세로로 쌓습니다. */
    gap: 8px;
`;

export const ActionButtons = styled.div`
    padding-top: 16px;
    display: flex;
    gap: 8px;
`;

/** 버튼의 공통 스타일 */
export const Button = styled.button`
    flex-grow: 1;
    padding: 10px;
    border: 1px solid transparent;
    border-radius: 4px;
    font-size: 14px;
    font-weight: bold;
    cursor: pointer;
    transition: background-color 0.2s, color 0.2s, border-color 0.2s;

    &.primary {
        background-color: #3498db;
        color: white;
        &:hover { background-color: #2980b9; }
    }

    &.secondary {
        background-color: #f1f3f5;
        color: #495057;
        border-color: #dee2e6;
        &:hover { background-color: #e9ecef; }
    }
`;