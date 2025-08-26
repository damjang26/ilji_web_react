import styled from "styled-components";
import MessageTab from "./right_side_bar/MessageTab.jsx";
import ScheduleTab from "./right_side_bar/ScheduleTab.jsx";
import QuickBar from "./right_side_bar/QuickBar.jsx";

const RightSidebarContainer = styled.aside`
    width: 320px; /* 너비를 조금 넓혀서 내용이 답답하지 않게 합니다. */
    flex-shrink: 0;
    height: 100vh;
    background-color: #f8f9fa;
    padding: 20px;
    border-left: 1px solid #e9ecef;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
    position: fixed;
    top: 0;
    right: 0;
    z-index: 10;
`;

const Section = styled.section`
    width: 100%;
    background-color: white;
    border: 1px solid #e9ecef;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    display: flex;
    flex-direction: column;
    overflow: hidden; /* 내부 컨텐츠가 넘칠 경우를 대비 */
`;

const RightSideBar = () => {
    return (
        <div>
            <RightSidebarContainer>
                {/* 각 탭을 시각적으로 구분되는 섹션으로 만듭니다. */}
                <Section style={{ flex: '2 1 400px' }}><ScheduleTab/></Section>
                <Section style={{ flex: '1 1 200px' }}><MessageTab/></Section>
            </RightSidebarContainer>
            {/*<QuickBar/>*/}
        </div>
    );
};

export default RightSideBar;
