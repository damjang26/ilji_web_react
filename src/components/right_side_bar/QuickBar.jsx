import React, { useState } from 'react';
import {QuickBarButton, QuickBarContainer} from "../../styled_components/right_side_bar/QuickBarStyled.jsx";
import {FaPlus, FaChevronLeft, FaChevronRight} from "react-icons/fa";

const QuickBar = ({ onToggle, $isPanelOpen }) => {
    // 버튼의 활성 상태를 관리하기 위한 예시 state
    const [activeButton, setActiveButton] = useState(null);

    return (
        <QuickBarContainer $isPanelOpen={$isPanelOpen}>
            <QuickBarButton onClick={onToggle} title={$isPanelOpen ? "사이드바 닫기" : "사이드바 열기"}>
                {$isPanelOpen ? <FaChevronRight /> : <FaChevronLeft />}
            </QuickBarButton>
            {/* ✅ 'active' 대신 '$active' prop을 사용하여 DOM 에러를 방지합니다. */}
            <QuickBarButton title="친구 스토리 1" $active={activeButton === 1} onClick={() => setActiveButton(1)}>
                <FaPlus />
            </QuickBarButton>
            <QuickBarButton title="친구 스토리 2" $active={activeButton === 2} onClick={() => setActiveButton(2)}>
                <FaPlus />
            </QuickBarButton>
            <QuickBarButton title="친구 스토리 3" $active={activeButton === 3} onClick={() => setActiveButton(3)}>
                <FaPlus />
            </QuickBarButton>
            <QuickBarButton title="친구 스토리 4" $active={activeButton === 4} onClick={() => setActiveButton(4)}>
                <FaPlus />
            </QuickBarButton>
        </QuickBarContainer>
    );
}

export default QuickBar;