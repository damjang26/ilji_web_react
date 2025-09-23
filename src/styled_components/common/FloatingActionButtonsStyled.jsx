import styled, { css } from 'styled-components';

export const ButtonsContainer = styled.div`
    position: fixed;
    bottom: 20px;
    right: 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    /* gap: 10px; */ /* gap 대신 ActionButton의 margin-bottom으로 간격 조절 */
    z-index: 999;
`;

const baseButton = css`
    width: 56px;
    height: 56px;
    border-radius: 50%;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 24px;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55); /* 부드러운 애니메이션 */

    &:hover {
        transform: scale(1.05);
    }
`;

export const MainActionButton = styled.button`
    ${baseButton}
    background-color: #7b5fff; // Main purple color
    position: relative; /* 다른 버튼들이 이 버튼 위로 올라오도록 */
    z-index: 1000; /* 항상 최상단에 위치 */

    &:hover {
        background-color: #6a4fe9;
    }

    svg {
        transition: transform 0.3s ease-in-out;
        transform: rotate(${props => props.$isOpen ? '225deg' : '0deg'}); /* X자로 회전 */
    }
`;

export const ActionButton = styled.button`
    ${baseButton}
    background-color: #868e96; // Gray color
    position: absolute;
    bottom: 0; /* MainActionButton과 같은 위치에서 시작 */
    opacity: 0;
    pointer-events: none; /* 숨겨져 있을 때 클릭 방지 */

    ${props => props.$isOpen && css`
        opacity: 1;
        pointer-events: auto;
        /* $order에 따라 위치 조정 */
        transform: translateY(-${props.$order * 66}px); /* 56px(버튼 높이) + 10px(간격) */
    `}

    &:hover {
        transform: translateY(-${props => props.$order * 66}px) scale(1.05); /* translateY와 scale을 함께 적용 */
        /* opacity는 이미 1이므로 변경 불필요 */
    }

    /* ✅ [추가] 툴팁 스타일 */
    &::after {
        content: attr(data-title); /* data-title 속성에서 텍스트 가져오기 */
        position: absolute;
        right: 115%; /* 버튼 왼쪽에 위치 */
        top: 50%;
        transform: translateY(-50%);
        background-color: rgba(0, 0, 0, 0.7);
        color: #fff;
        padding: 6px 12px;
        border-radius: 4px;
        white-space: nowrap; /* 텍스트가 줄바꿈되지 않도록 */
        font-size: 14px;
        font-weight: 500;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.2s ease;
        z-index: 1001; /* 다른 요소 위에 보이도록 */
    }

    /* ✅ [추가] 버튼에 마우스를 올렸을 때 툴팁 표시 */
    &:hover::after {
        /* $isOpen이 true일 때만 (즉, 버튼이 보일 때만) 툴팁 표시 */
        opacity: ${props => props.$isOpen ? 1 : 0};
        transition-delay: 0.3s; /* 툴팁이 약간 늦게 나타나도록 */
    }
`;
