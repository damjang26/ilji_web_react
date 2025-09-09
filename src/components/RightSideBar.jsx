import React from "react";
import MessageTab from "./right_side_bar/MessageTab.jsx";
import { Tooltip } from "antd";
import ScheduleTab from "./right_side_bar/ScheduleTab.jsx";
import QuickBar from "./right_side_bar/QuickBar.jsx";
import { FaChevronRight } from "react-icons/fa";
import {
    CloseButton,
    PanelBody,
    PanelHeader,
    RightSectionContainer,
    SidebarPanelWrapper,
} from "../styled_components/RightSideBarStyled.jsx";
import { useSchedule } from "../contexts/ScheduleContext.jsx";

// 사이드바 패널의 전체 내용을 담는 컴포넌트
const SidebarPanel = ({ onClose }) => (
    <>
        <PanelHeader>
            <Tooltip title="사이드바 접기" placement="left">
                <CloseButton onClick={onClose}>
                    <FaChevronRight />
                </CloseButton>
            </Tooltip>
        </PanelHeader>
        <PanelBody>
            <MessageTab />
            <ScheduleTab />
        </PanelBody>
    </>
);

const RightSideBar = () => {
    const { isSidebarOpen, closeSidebar, toggleSidebar } = useSchedule();

    return (
        /* ✅ [수정] mousedown 이벤트의 전파를 막아, 다른 팝업(일정 팝업 등)이 닫히는 현상을 방지합니다. */
        <RightSectionContainer $isPanelOpen={isSidebarOpen} onMouseDown={(e) => e.stopPropagation()}>
            {/* 사이드바 패널은 상태에 따라 슬라이드 인/아웃 됩니다. */}
            <SidebarPanelWrapper $isPanelOpen={isSidebarOpen}>
                <SidebarPanel onClose={toggleSidebar} />
            </SidebarPanelWrapper>

            {/* QuickBar는 항상 렌더링되며, 스타일 컴포넌트 내부에서 위치가 동적으로 변경됩니다. */}
            <QuickBar onToggle={toggleSidebar} $isPanelOpen={isSidebarOpen} />
        </RightSectionContainer>
    );
};

export default RightSideBar;
