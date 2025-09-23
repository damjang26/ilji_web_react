
import styled from 'styled-components';

export const ModalBackdrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: transparent; /* 어두운 배경 제거 */
  z-index: 999; /* 다른 모달에 비해 낮은 z-index */
`;

export const ModalContainer = styled.div`
  position: absolute;
  visibility: hidden; /* 위치 계산 전까지 숨김 */
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  width: 380px;
  max-height: 60vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  z-index: 1000; /* 다른 모달에 비해 낮은 z-index */
`;

export const ModalHeader = styled.div`
  padding: 12px 16px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: move;
  
  h2 {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 600;
  }
`;

export const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #888;
  line-height: 1;
  
  &:hover {
    color: #000;
  }
`;

export const ModalContent = styled.div`
  overflow-y: auto; /* 내용이 길어지면 스크롤 */
  flex-grow: 1;
  padding: 16px;
`;
