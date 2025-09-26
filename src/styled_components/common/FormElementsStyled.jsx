import styled from "styled-components";

/** '저장', '취소' 등 액션 버튼들을 그룹화하는 컨테이너 */
export const ActionButtons = styled.div`
    padding-top: 16px;
    display: flex;
    gap: 8px;
`;

/** 앱 전반에서 사용되는 공용 버튼 스타일 */
/** 앱 전반에서 사용되는 공용 버튼 스타일 */
export const Button = styled.button`
    flex-grow: 1;
    padding: 10px;
    border: 1px solid transparent;
    border-radius: 4px;
    font-size: 14px;
    font-weight: bold;
    cursor: pointer;
    transition: opacity 0.2s, background-color 0.2s, color 0.2s, border-color 0.2s;

    &.primary {
        background: linear-gradient(45deg, #97c0ff, #7b5fff, #ff7eb9);
        color: white;
        border: none;

        &:hover {
            opacity: 0.9;
        }

        &:disabled {
            opacity: 0.5;
            cursor: not-allowed;
            background: linear-gradient(45deg, #97c0ff, #7b5fff, #ff7eb9);
            box-shadow: none;

            &:hover {
                /* hover 효과 무력화 */
                opacity: 0.5;
                cursor: not-allowed;
                background: linear-gradient(45deg, #97c0ff, #7b5fff, #ff7eb9);
                color: white;
                border: none;
                box-shadow: none;
            }
        }
    }

    &.secondary {
        background-color: #f1f3f5;
        color: #495057;
        border-color: #dee2e6;

        &:hover {
            background-color: #e9ecef;
        }

        &:disabled {
            opacity: 0.5;
            cursor: not-allowed;
            background-color: #f1f3f5;
            color: #495057;
            border-color: #dee2e6;
            box-shadow: none;

            &:hover {
                /* hover 효과 무력화 */
                opacity: 0.5;
                cursor: not-allowed;
                background-color: #f1f3f5;
                color: #495057;
                border-color: #dee2e6;
                box-shadow: none;
            }
        }
    }
`;
