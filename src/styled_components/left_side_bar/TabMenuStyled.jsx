import styled from "styled-components";
import {NavLink} from "react-router-dom"; // ✅ Link 대신 NavLink를 사용하면 활성 상태를 쉽게 스타일링할 수 있어!

export const TabMenuContainer = styled.div`
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    align-items: center; /* 메뉴 아이템들을 중앙 정렬 */
    padding-top: 20px; /* 상단 여백 */
    padding-bottom: 20px;
    gap: 8px; /* 메뉴 아이템 사이의 간격 */
`;

// ✅ 구분선 스타일
export const StyledHr = styled.hr`
    width: 85%; /* 전체 너비의 85% */
    border: none;
    border-top: 1px solid #e4eaf1; /* 캘린더 테두리와 동일한 색상 */
    margin: 10px 0; /* 위아래 여백 */
`;

// ✅ Link와 Button의 공통 스타일을 먼저 정의할게. (코드 중복 방지!)
const commonMenuItemStyle = `
    display: flex;
    align-items: center;
    gap: 16px; /* 아이콘과 텍스트 사이 간격 */
    padding: 12px 24px;
    width: 85%; /* 컨테이너에 맞춰 너비 조절 */
    border-radius: 10px; /* 둥근 알약 모양 */
    font-size: 14px;
    font-weight: 450; /* ✅ 세미볼드 굵기로 가독성 향상 */
    font-family: 'Inter', sans-serif; /* ✅ 캘린더와 폰트 통일 */
    color: #8394a6; /* 기본 텍스트 색상 (캘린더와 통일) */
    text-decoration: none;
    cursor: pointer;
    transition: all 0.2s ease-in-out;

    svg {
        font-size: 18px; /* 아이콘 크기 */
    }

    &:hover {
        background-color: #efefef;
        color: #7b5fff;
    }
`;

// ✅ react-router-dom의 NavLink 컴포넌트를 스타일링했어.
export const MenuLink = styled(NavLink)`
    ${commonMenuItemStyle}
        /* 현재 활성화된 링크 스타일 */
    &.active {
        font-weight: 600;
        color: #343a40;
    }
`;


export const ToggleButton = styled.button`
    ${commonMenuItemStyle}
    background: none;
    border: none;
`;