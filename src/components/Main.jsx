import FullCalendarExample from "./main/FullCalendar.jsx";
import {Route, Routes} from "react-router-dom";
import styled from "styled-components";

const MainContent = styled.main`
  flex-grow: 1; /* 사이드바를 제외한 나머지 공간을 모두 차지합니다. */
  height: 100vh; /* 화면 전체 높이를 사용합니다. */
  overflow-y: auto; /* 내용이 길어지면 세로 스크롤이 생깁니다. */
  box-sizing: border-box; /* padding과 border가 너비/높이에 포함되도록 합니다. */

  padding: 40px 30px; /* 상하 40px, 좌우 30px의 내부 여백을 추가합니다. */
`;

const Main = () => {
    return (
        <MainContent>
            <Routes>
                <Route path="/" element={<FullCalendarExample />} />
            </Routes>
        </MainContent>
    );
}

export default Main;