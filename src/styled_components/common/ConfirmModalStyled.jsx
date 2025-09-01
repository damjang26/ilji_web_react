import styled from 'styled-components';

export const ModalWrapper = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000; // 다른 요소들 위에 오도록 z-index 설정
`;

export const ModalBackdrop = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
`;

export const ModalContent = styled.div`
    position: relative;
    background-color: white;
    border-radius: 8px;
    width: 90%;
    max-width: 400px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    overflow: hidden;
`;

export const ModalHeader = styled.div`
    padding: 16px 20px;
    border-bottom: 1px solid #e9ecef;
    h3 {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
        color: #343a40;
    }
`;

export const ModalBody = styled.div`
    padding: 24px 20px;
    p {
        margin: 0;
        font-size: 16px;
        color: #495057;
        line-height: 1.5;
    }
`;

export const ModalFooter = styled.div`
    padding: 12px 20px;
    border-top: 1px solid #e9ecef;
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    background-color: #f8f9fa;
`;

export const Button = styled.button`
    padding: 8px 16px;
    border: 1px solid transparent;
    border-radius: 4px;
    font-size: 14px;
    font-weight: bold;
    cursor: pointer;
    transition: background-color 0.2s, color 0.2s, border-color 0.2s;

    &.secondary { background-color: white; color: #495057; border-color: #dee2e6; &:hover { background-color: #f8f9fa; } }
    &.danger { background-color: #fa5252; color: white; &:hover { background-color: #e03131; } }
`;