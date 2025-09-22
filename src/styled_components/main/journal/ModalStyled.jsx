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
    /* ✅ [수정] variant prop에 따라 padding을 동적으로 설정합니다. */
    padding: ${(props) => (props.variant === 'journalView' ? '0' : '24px')};
    border-radius: 10px;
    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
    /* ✅ [수정] variant에 따라 width와 max-width를 동적으로 설정합니다. */
    width: ${(props) => (props.variant === 'journalView' ? 'auto' : '90%')};
        max-width: ${(props) => {
        if (props.variant === 'journalView') return 'none'; // '책' 레이아웃일 때는 최대 너비 제한 없음
        if (props.$isFabricStep) return "900px";
        return "600px"; // 기본 모달의 최대 너비
    }};
    display: flex;
    flex-direction: column;

    /* max-width 값이 변경될 때 부드러운 애니메이션 효과를 적용합니다. */
    transition: max-width 0.4s ease-in-out;
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