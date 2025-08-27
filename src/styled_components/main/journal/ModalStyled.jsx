import styled from "styled-components";

// 모달이 떴을 때 뒤에 깔리는 반투명 배경
export const ModalBackdrop = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1200; /* 캘린더 팝오버(1100)보다 위에 오도록 설정 */
`;

// 모달의 흰색 컨테이너 박스
export const ModalContainer = styled.div`
    background: white;
    padding: 24px;
    border-radius: 12px;
    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
    width: 90%;
    max-width: 600px; /* 모달 최대 너비 */
    display: flex;
    flex-direction: column;
`;

export const CloseButton = styled.button`
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: #888;
    &:hover {
        color: #333;
    }
`;

// 모달 헤더 (제목, 닫기 버튼)
export const ModalHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    h2 {
        margin: 0;
        font-size: 20px;
    }
`;

// 모달의 주 내용이 들어갈 영역
export const ModalContent = styled.div`
    flex-grow: 1;
`;