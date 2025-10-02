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

        /* ✅ textarea로 쓸 때는 리사이즈 막기 */
    &[as="textarea"],
    textarea& {
        resize: none;
    }
`;

/** '하루 종일' 체크박스를 위한 스타일 */
export const CheckboxWrapper = styled.label`
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    font-size: 14px;
    user-select: none;
`;

/** '하루 종일'에 사용될 커스텀 체크박스 input */
export const CustomCheckbox = styled.input.attrs({ type: 'checkbox' })`
    appearance: none;
    -webkit-appearance: none;
    -moz-appearance: none;

    width: 18px;
    height: 18px;
    border: 2px solid #adb5bd;
    border-radius: 4px;
    background-color: #f8f9fa;
    cursor: pointer;
    transition: background-color 0.2s, border-color 0.2s;
    position: relative;

    &:checked {
        border-color: transparent;
        background-color: #7b5fff; /* ✅ 보라색 */
    }

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

/** 날짜/시간 블록 전체를 감싸는 컨테이너 */
export const DateTimeSection = styled.div`
    display: flex;
    flex-direction: column;
    gap: 12px;
`;

/** 한 줄(Row) 컨테이너 - "날짜 한 줄", "시간 한 줄" */
export const DateTimeRow = styled.div`
    display: flex;
    align-items: center;
    gap: 24px; /* Start와 End 사이 간격 */
    flex-wrap: nowrap;

    @media (max-width: 560px) {
        flex-direction: column;
        align-items: stretch;
        gap: 8px;
    }
`;

/** 라벨 + 인풋을 한 줄로 묶는 컨테이너 */
export const InlineField = styled.div`
    display: flex;
    align-items: center;
    gap: 6px;

    > label {
        white-space: nowrap;
    }

    > input {
        flex: 1;
        min-width: 120px;
    }
`;
