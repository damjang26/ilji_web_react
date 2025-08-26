import React, { useState } from "react";
import MessageTab from "./right_side_bar/MessageTab.jsx";
import ScheduleTab from "./right_side_bar/ScheduleTab.jsx";
import QuickBar from "./right_side_bar/QuickBar.jsx";
import { FaTimes } from "react-icons/fa";
import {
    CloseButton,
    PanelBody,
    PanelHeader,
    RightSectionContainer,
    SidebarPanelWrapper
} from "../styled_components/RightSideBarStyled.jsx";

// 사이드바 패널의 전체 내용을 담는 컴포넌트
const SidebarPanel = ({ onToggle }) => (
    <>
        <PanelHeader>
            <span>사이드바</span>
            <CloseButton onClick={onToggle} title="닫기"><FaTimes /></CloseButton>
        </PanelHeader>
        <PanelBody>
            <MessageTab />
            <ScheduleTab />
        </PanelBody>
    </>
);

const RightSideBar = () => {
    const [isPanelOpen, setPanelOpen] = useState(true);

    const togglePanel = () => setPanelOpen(prev => !prev);

    return (
        <RightSectionContainer>
            {/* 사이드바 패널은 상태에 따라 슬라이드 인/아웃 됩니다. */}
            <SidebarPanelWrapper isPanelOpen={isPanelOpen}>
                <SidebarPanel onToggle={togglePanel} />
            </SidebarPanelWrapper>

            {/* QuickBar는 항상 렌더링되며, 스타일 컴포넌트 내부에서 위치가 동적으로 변경됩니다. */}
            <QuickBar onToggle={togglePanel} isPanelOpen={isPanelOpen} />
        </RightSectionContainer>
    );
};

export default RightSideBar;
