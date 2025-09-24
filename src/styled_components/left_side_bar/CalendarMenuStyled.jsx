import styled from 'styled-components';

export const MenuContainer = styled.div`
    width: 100%;
    height: 100%; // 부모 요소의 전체 높이를 차지하도록 설정
    display: flex;
    flex-direction: column;
    overflow-y: auto; // 이제 이 컨테이너가 전체 스크롤을 담당

    // Ant Design의 Collapse 컴포넌트 폰트를 전역 폰트로 덮어쓰기

    .ant-collapse {
        font-family: inherit;
    }
`;

// Collapse 컴포넌트 내부에 있는 태그 목록을 감싸는 컨테이너
export const TagListContainer = styled.div`
    flex-grow: 1; // 남는 공간을 모두 차지
    // overflow-y: auto; // 스크롤 기능 제거
`;


export const FriendSelectContainer = styled.div`
    padding: 0 15px;
    /* border-top: 1px solid #f0f0f0; // 구분선 제거 */
    flex-shrink: 0; // 축소되지 않도록 설정
`;

export const MenuButton = styled.div`
    visibility: hidden;
    margin-left: auto;
`;

export const TagItem = styled.div`
    display: flex;
    align-items: center;
    margin-bottom: 8px;
    cursor: pointer;
    padding: 4px 8px;
    border-radius: 4px;
    transition: background-color 0.2s;

    &:hover {
        background-color: #f0f0f0;

        ${MenuButton} {
            visibility: visible;
        }
    }
`;

// 태그의 색상을 표시하는 사각형
export const ColorSquare = styled.div`
    width: 18px;
    height: 18px;
    border-radius: 4px;
    background-color: ${props => props.color || '#ccc'}; // props로 전달된 색상 적용
    margin-right: 10px;
    flex-shrink: 0; /* 공간이 부족해도 줄어들지 않도록 설정 */
`;

// 태그 이름(라벨)
export const TagLabel = styled.span`
    font-size: 14px;
    flex-grow: 1; /* 남는 공간을 모두 차지하도록 설정 */
    white-space: nowrap; /* 텍스트가 길어져도 줄바꿈 방지 */
    overflow: hidden; /* 넘치는 텍스트 숨기기 */
    text-overflow: ellipsis; /* 넘치는 텍스트를 ...으로 표시 */
`;

// ✅ [신규] 태그 목록에 사용될 커스텀 체크박스 스타일
export const TagCheckbox = styled.input.attrs({ type: 'checkbox' })`
    appearance: none; /* 브라우저 기본 스타일 제거 */
    -webkit-appearance: none;
    -moz-appearance: none;

    width: 16px;
    height: 16px;
    border: 1.5px solid #ccc;
    border-radius: 4px;
    margin-right: 8px;
    cursor: pointer;
    position: relative; /* 체크 표시의 기준점 */
    transition: all 0.2s ease;
    flex-shrink: 0; /* 너비가 줄어들지 않도록 설정 */

    &:checked {
        border-color: #7b5fff;
        background-color: #7b5fff;
    }

    /* ✅ [수정] 체크되었을 때 텍스트 대신 SVG 아이콘을 사용합니다. */
    &:checked::after {
        content: "";
        display: block;
        width: 10px;
        height: 10px;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 14 11' fill='none'%3e%3cpath d='M1 5.5L5 9.5L13 1.5' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3e%3c/svg%3e");
        background-size: contain;
        background-repeat: no-repeat;
        background-position: center;
    }

    &:hover {
        border-color: #a995ff;
    }
`;
