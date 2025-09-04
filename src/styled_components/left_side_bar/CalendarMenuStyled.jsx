import styled from 'styled-components';

export const MenuContainer = styled.div`
  width: 100%; /* 너비를 100%로 설정하여 좌우 움직임 방지 */
  margin-top: auto; /* 상단 여백을 자동으로 채워 하단에 고정 */
  min-height: 320px; /* 컴포넌트의 최소 높이를 지정하여 레이아웃 쉬프트 방지 */
`;

// Collapse 컴포넌트 내부에 있는 태그 목록을 감싸는 컨테이너
export const TagListContainer = styled.div`
  max-height: 200px;
  overflow-y: auto;
`;

export const TagItem = styled.label`
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background-color 0.2s;

  &:hover {
    background-color: #f0f0f0;
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


