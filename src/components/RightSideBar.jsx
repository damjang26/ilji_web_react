import styled from "styled-components";
import MessageTab from "./RightSideBar/MessageTab.jsx";
import ScheduleTab from "./RightSideBar/ScheduleTab.jsx";
import QuickBar from "./RightSideBar/QuickBar.jsx";

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
    return <div>
          <RightSidebarContainer>
              <div>right side bar</div>
              <MessageTab/>
              <ScheduleTab/>
          </RightSidebarContainer>
           <QuickBar/>
         </div>
}

export default RightSideBar;