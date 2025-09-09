import React, {useEffect} from 'react';
import ReactDOM from 'react-dom';
import { ModalBackdrop, ModalContainer } from '../../../styled_components/main/journal/ModalStyled.jsx';

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

    // ✅ [신규] 백드롭 클릭 핸들러
    // 마우스 클릭이 백드롭 자체에서 시작되었을 때만 모달을 닫습니다.
    // 모달 컨텐츠에서 클릭을 시작하고 밖으로 드래그한 경우에는 닫히지 않습니다.
    const handleBackdropMouseDown = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    // Portal을 사용해 body 최상단에 렌더링하여 z-index 문제를 방지합니다.
    return ReactDOM.createPortal(
        <ModalBackdrop onMouseDown={handleBackdropMouseDown}>
            {/* 이제 백드롭의 onMouseDown에서만 닫기 로직을 처리하므로, 컨테이너의 stopPropagation은 필요 없습니다. */}
            <ModalContainer isFabricStep={isFabricStep}>{children}</ModalContainer>
        </ModalBackdrop>,
        document.body
    );
};

export default Modal;