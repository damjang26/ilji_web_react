import React from 'react';
import { FaTimes, FaChevronLeft } from 'react-icons/fa';
import {
    PanelContainer,
    PanelHeader,
    PanelTitle,
    BackButton, // 새로 추가
    CloseButton,
    PanelBody
} from '../../styled_components/common/FloatingPanelStyled';

const FloatingPanel = ({ title, children, onClose, onBack }) => {
    return (
        <PanelContainer onMouseDown={(e) => e.stopPropagation()}>
            <PanelHeader>
                {onBack ? (
                    <BackButton onClick={onBack} title="뒤로가기">
                        <FaChevronLeft />
                    </BackButton>
                ) : (
                    <div style={{ width: '24px' }} /> // 제목 중앙 정렬을 위한 플레이스홀더
                )}
                <PanelTitle>{title}</PanelTitle>
                <CloseButton onClick={onClose}>
                    <FaTimes/>
                </CloseButton>
            </PanelHeader>
            <PanelBody>
                {children}
            </PanelBody>
        </PanelContainer>
    );
};

export default FloatingPanel;
