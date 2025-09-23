import styled, { css } from "styled-components";

/** ScheduleForm.jsx & ScheduleEdit.jsx의 스타일을 정의합니다. (일정 추가/수정 폼) */

export const FormWrapper = styled.div`
    padding: 8px;
    box-sizing: border-box;
`;

export const FormBody = styled.div`
    display: grid;
    gap: 16px;

    ${props => props.isInsideModal && css`
        gap: 12px;
    `}
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

    ${props => props.isInsideModal && css`
        font-size: 12px;
    `}
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

    ${props => props.isInsideModal && css`
        font-size: 13px;
        padding: 7px 10px;
    `}
`;

/** '하루 종일' 체크박스를 위한 스타일 */
export const CheckboxWrapper = styled.label`
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    font-size: 14px;
    user-select: none; /* 클릭 시 텍스트가 선택되는 것을 방지 */
`;

/** '하루 종일'에 사용될 커스텀 체크박스 input */
export const CustomCheckbox = styled.input.attrs({ type: 'checkbox' })`
    appearance: none; /* 브라우저 기본 스타일 제거 */
    -webkit-appearance: none;
    -moz-appearance: none;

    width: 18px;
    height: 18px;
    border: 2px solid #adb5bd;
    border-radius: 4px;
    background-color: #f8f9fa;
    cursor: pointer;
    transition: background-color 0.2s, border-color 0.2s;
    position: relative; /* 체크 표시를 위한 기준점 */

    &:checked {
        border-color: transparent;
        background-color: #7b5fff; /* ✅ 그라데이션에서 보라색 단색으로 변경 */
    }

    /* 체크 표시 (V) 아이콘 */
    &:checked::after {
        content: '✔';
        font-size: 14px;
        font-weight: bold;
        color: white;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
    }
`;

/** 날짜와 시간 입력 필드를 한 줄에 배치하기 위한 컨테이너 */
export const DateTimeRow = styled.div`
    display: grid; /* flex에서 grid로 변경하여 자식 요소들을 세로로 쌓습니다. */
    gap: 8px;
`;