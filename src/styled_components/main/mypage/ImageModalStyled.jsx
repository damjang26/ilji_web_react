import styled from 'styled-components';

// 모달 뒷배경. 화면 전체를 덮고, 반투명합니다.
export const ModalBackdrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000; // 다른 요소들 위에 오도록 z-index를 높게 설정
`;

// 실제 모달 창 컨테이너
export const ModalContainer = styled.div`
  background-color: #fff;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  width: 90%;
  max-width: 500px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

// 모달 제목
export const ModalTitle = styled.h2`
  margin: 0;
  font-size: 1.5rem;
  color: #333;
`;

// 모달 내용 (URL 입력 필드 등)
export const ModalBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

// 모달 하단 버튼 그룹
export const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 16px;
`;