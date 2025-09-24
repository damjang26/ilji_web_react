import React, { useState } from 'react';
import {FaComments, FaCalendarAlt, FaPlus, FaTimes} from 'react-icons/fa';
import {
    ButtonsContainer,
    ActionButton,
    MainActionButton
} from '../../styled_components/common/FloatingActionButtonsStyled';
import {RiQuillPenAiFill} from "react-icons/ri";

const FloatingActionButtons = ({onButtonClick}) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleMainButtonClick = () => {
        setIsOpen(prev => !prev);
    };

    return (
        <ButtonsContainer>
            <ActionButton
                data-title="메시지"
                onClick={() => onButtonClick('messages')}
                $isOpen={isOpen}
                $order={2} // 메시지 버튼이 아래에 위치
            >
                <FaComments/>
            </ActionButton>
            <ActionButton
                data-title="일정 목록"
                onClick={() => onButtonClick('schedule')}
                $isOpen={isOpen}
                $order={1} // 일정 목록 버튼이 위에 위치
            >
                <FaCalendarAlt/>
            </ActionButton>
            <ActionButton
                data-title="일기 작성"
                // ✅ [수정] 'writeJournal' 패널을 열도록 onButtonClick 호출
                onClick={() => onButtonClick('writeJournal')}
                $isOpen={isOpen}
                $order={3}
            >
                <RiQuillPenAiFill/>
            </ActionButton>
            <MainActionButton data-title="메뉴 열기/닫기" onClick={handleMainButtonClick} $isOpen={isOpen}>
                {isOpen ? <FaTimes/> : <FaPlus/>}
            </MainActionButton>
        </ButtonsContainer>
    );
};

export default FloatingActionButtons;
