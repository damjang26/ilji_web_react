import FullCalendarExample from "./main/calendar/FullCalendar.jsx";
import {Route, Routes} from "react-router-dom";
import styled from "styled-components";
import MyPage from "./main/mypage/MyPage.jsx";
import Post from "./main/post/Post.jsx";
import MyPageSet from "./main/mypage/MyPageSet.jsx";
import Journal from "./main/journal/Journal.jsx";


const MainContent = styled.main`
    flex-grow: 1; /* 사이드바를 제외한 나머지 공간을 모두 차지 */
    display: flex;
    flex-direction: column;
    height: 100vh;
    box-sizing: border-box;
    padding-top: 30px;
`;

const Main = () => {
    return (
        <MainContent>
            <Routes>
                <Route path="/" element={<FullCalendarExample/>}/>
                <Route path="/mypage" element={<MyPage/>}/>
                <Route path="/mypageset" element={<MyPageSet/>}/>
                <Route path="/post/*" element={<Post/>}/>
            </Routes>
        </MainContent>
    );
}

export default Main;