import React from 'react';
import {QuickBarButton, QuickBarContainer} from "../../styled_components/right_side_bar/QuickBarStyled.jsx";
import {FaCommentDots, FaPlus} from "react-icons/fa";

const QuickBar = () => {

    return (
        <QuickBarContainer>
        <QuickBarButton title="새 메시지">
            <FaCommentDots />
        </QuickBarButton>
        <QuickBarButton title="새 일정">
            <FaPlus />
        </QuickBarButton>
    </QuickBarContainer>
    );
}

export default QuickBar;