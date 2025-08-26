import React from 'react';
import {QuickBarButton, QuickBarContainer} from "../../styled_components/right_side_bar/QuickBarStyled.jsx";
import {FaPlus, FaChevronLeft, FaChevronRight} from "react-icons/fa";

const QuickBar = ({ onToggle, isPanelOpen }) => {

    return (
        <QuickBarContainer isPanelOpen={isPanelOpen}>
            <QuickBarButton onClick={onToggle} title={isPanelOpen ? "사이드바 닫기" : "사이드바 열기"}>
                {isPanelOpen ? <FaChevronRight /> : <FaChevronLeft />}
            </QuickBarButton>
        <QuickBarButton title="친구 스토리">
            <FaPlus />
        </QuickBarButton>
        <QuickBarButton title="친구 스토리">
            <FaPlus />
        </QuickBarButton>
        <QuickBarButton title="친구 스토리">
            <FaPlus />
        </QuickBarButton>
        <QuickBarButton title="친구 스토리">
            <FaPlus />
        </QuickBarButton>
        <QuickBarButton title="친구 스토리">
            <FaPlus />
        </QuickBarButton>
        </QuickBarContainer>
    );
}

export default QuickBar;