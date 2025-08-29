import React from 'react';
import ReactDOM from 'react-dom';
import {
    ModalWrapper,
    ModalBackdrop,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button
} from '../../styled_components/common/ConfirmModalStyled.jsx';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, children }) => {
    if (!isOpen) {
        return null;
    }

    return ReactDOM.createPortal(
        (
            // ✅ [수정] mousedown 이벤트의 전파를 막습니다.
            // 이렇게 하면 모달 내부를 클릭했을 때, 다른 컴포넌트(예: SchedulePopUp)의
            // '외부 클릭 감지' 로직이 실행되어 팝업이 닫히는 현상을 방지할 수 있습니다.
            <ModalWrapper onMouseDown={(e) => e.stopPropagation()}>
                <ModalBackdrop onClick={onClose} />
                <ModalContent>
                    <ModalHeader>
                        <h3>{title}</h3>
                    </ModalHeader>
                    <ModalBody>
                        <p>{children}</p>
                    </ModalBody>
                    <ModalFooter>
                        <Button className="secondary" onClick={onClose}>취소</Button>
                        <Button className="danger" onClick={onConfirm}>삭제</Button>
                    </ModalFooter>
                </ModalContent>
            </ModalWrapper>
        ),
        document.getElementById('modal-root')
    );
};

export default ConfirmModal;