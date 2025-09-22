import React from 'react';
import { FaTimes } from 'react-icons/fa';
import {
    PanelContainer,
    PanelHeader,
    PanelTitle,
    CloseButton,
    PanelBody
} from '../../styled_components/common/FloatingPanelStyled';

const FloatingPanel = ({ title, children, onClose }) => {
    return (
        <PanelContainer onMouseDown={(e) => e.stopPropagation()}>
            <PanelHeader>
                <PanelTitle>{title}</PanelTitle>
                <CloseButton onClick={onClose} title="닫기">
                    <FaTimes />
                </CloseButton>
            </PanelHeader>
            <PanelBody>
                {children}
            </PanelBody>
        </PanelContainer>
    );
};

export default FloatingPanel;
