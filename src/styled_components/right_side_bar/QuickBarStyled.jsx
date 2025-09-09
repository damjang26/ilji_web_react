import styled from "styled-components";

// 퀵바 아이템들을 감싸는 메인 컨테이너
export const QuickBarContainer = styled.div`
  position: fixed; /* 화면 기준으로 위치를 고정합니다. */
  top: 30%; /* 헤더 높이를 고려한 상단 여백 */
  z-index: 10; /* 패널보다는 아래, Main 컨텐츠보다는 위에 위치 */
  transition: right 0.35s ease-in-out;

  display: flex;
  flex-direction: column; /* 버튼들을 세로로 정렬 */
  align-items: center; /* 내부 아이템들을 수평 중앙에 정렬합니다. */
  gap: 15px;

  /* 패널 상태에 따라 위치를 동적으로 변경합니다. */
  /* 패널이 열렸을 때: 패널(230px) 바로 왼쪽에 위치합니다. (230px + 30px 여백) */
  /* 패널이 닫혔을 때: 화면의 가장 오른쪽에 위치합니다. (30px 여백) */
  right: ${({ $isPanelOpen }) => ($isPanelOpen ? '260px' : '30px')};

  /* 버튼(60px) 좌우에 10px씩 여백을 주어 중앙 정렬될 공간(총 80px)을 만듭니다. */
  padding: 0 10px;
`;

// 퀵바 내부의 개별 버튼
export const QuickBarButton = styled.button`
  width: 60px; /* 원래 버튼 크기로 복구 */
  height: 60px; /* 원래 버튼 크기로 복구 */
  border-radius: 50%; /* 원형 버튼 */
  border: 1px solid #e9ecef;
  background-color: white;
  color: #495057;
  font-size: 1.5rem; /* 원래 아이콘 크기로 복구 */
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); /* 입체감을 주는 그림자 (원래 값) */
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 0.2s ease-in-out;

  &:hover {
    background-color: #f8f9fa;
    transform: scale(1.05); /* 미세한 확대 효과 */
  }

  /* ✅ $active prop을 사용하여 활성 상태의 스타일을 지정합니다. */
  ${({ $active }) => $active && `
    background-color: #3498db;
    color: white;
    border-color: #2980b9;
  `}
`;