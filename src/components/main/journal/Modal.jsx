import React, {useEffect} from 'react';
import ReactDOM from 'react-dom';
import {ModalBackdrop, ModalContainer} from '../../../styled_components/main/journal/ModalStyled.jsx';

const Modal = ({isOpen, onClose, children, isFabricStep = false}) => {
    // Esc 키를 눌렀을 때 모달을 닫는 이벤트 핸들러
    useEffect(() => {
        const handleEsc = (event) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        if (isOpen) {
            window.addEventListener('keydown', handleEsc);
        }

        return () => {
            window.removeEventListener('keydown', handleEsc);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    // Portal을 사용해 body 최상단에 렌더링하여 z-index 문제를 방지합니다.
    return ReactDOM.createPortal(
        <ModalBackdrop onClick={onClose}>
            <ModalContainer onClick={(e) => e.stopPropagation()} isFabricStep={isFabricStep}>{children}</ModalContainer>
        </ModalBackdrop>,
        document.body
    );
};

export default Modal;