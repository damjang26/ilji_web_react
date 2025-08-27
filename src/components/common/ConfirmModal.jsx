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
            <ModalWrapper>
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