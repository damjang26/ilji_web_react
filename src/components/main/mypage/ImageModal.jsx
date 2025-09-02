import React from 'react';
import { ModalBackdrop, ModalContainer, ModalTitle } from '../../../styled_components/main/mypage/ImageModalStyled';

const ImageModal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) {
        return null;
    }

    // 모달 컨텐츠 클릭 시 이벤트 전파를 막아, 뒷 배경을 눌렀을 때만 닫힘
    const handleModalContentClick = (e) => {
        e.stopPropagation();
    };

    return (
        <ModalBackdrop onClick={onClose}>
            <ModalContainer onClick={handleModalContentClick}>
                {title && <ModalTitle>{title}</ModalTitle>}
                {children}
            </ModalContainer>
        </ModalBackdrop>
    );
};

export default ImageModal;