import React, { useState } from 'react';
import { FaComments, FaCalendarAlt, FaPlus, FaTimes } from 'react-icons/fa';
import {
    ButtonsContainer,
    ActionButton,
    MainActionButton
} from '../../styled_components/common/FloatingActionButtonsStyled';

const FloatingActionButtons = ({ onButtonClick }) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleMainButtonClick = () => {
        setIsOpen(prev => !prev);
    };

    return (
        <ButtonsContainer>
            <ActionButton
                title="메시지"
                onClick={() => onButtonClick('messages')}
                $isOpen={isOpen}
                $order={2} // 메시지 버튼이 아래에 위치
            >
                <FaComments />
            </ActionButton>
            <ActionButton
                title="일정 목록"
                onClick={() => onButtonClick('schedule')}
                $isOpen={isOpen}
                $order={1} // 일정 목록 버튼이 위에 위치
            >
                <FaCalendarAlt />
            </ActionButton>
            <ActionButton
                title="추가 메뉴"
                onClick={() => {}}
                $isOpen={isOpen}
                $order={3}
            >
                <FaPlus />
            </ActionButton>
            <MainActionButton title="메뉴 열기/닫기" onClick={handleMainButtonClick} $isOpen={isOpen}>
                {isOpen ? <FaTimes /> : <FaPlus />}
            </MainActionButton>
        </ButtonsContainer>
    );
};

export default FloatingActionButtons;
