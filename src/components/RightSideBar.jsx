import styled from "styled-components";
import MessageTab from "./right_side_bar/MessageTab.jsx";
import ScheduleTab from "./right_side_bar/ScheduleTab.jsx";
import QuickBar from "./right_side_bar/QuickBar.jsx";
import SocialLogin from "./account/GoogleLogin.jsx";

const RightSidebarContainer = styled.aside`
  width: 280px;
  flex-shrink: 0;
  height: 100vh;
  background-color: #f8f9fa;
  padding: 20px;
  border-left: 1px solid #e9ecef;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
`;

const RightSideBar = () => {
  return (
    <div>
      <RightSidebarContainer>
        <div>right side bar</div>
        <SocialLogin />
        <MessageTab />
        <ScheduleTab />
      </RightSidebarContainer>
      <QuickBar />
    </div>
  );
};

export default RightSideBar;
