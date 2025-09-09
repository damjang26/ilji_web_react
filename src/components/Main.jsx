import FullCalendarExample from "./main/calendar/FullCalendar.jsx";
import {Route, Routes} from "react-router-dom";
import styled from "styled-components";
import Post from "./main/post/Post.jsx";
import MyPage from "./main/mypage/MyPage.jsx"; // MyPage를 직접 import


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

                {/* 자기 자신의 마이페이지 */}
                <Route path="/mypage" element={<MyPage />} />

                {/* 친구 마이페이지 등 다른 사용자의 마이페이지 */}
                <Route path="/mypage/:userId" element={<MyPage />} />

                <Route path="/post/*" element={<Post/>}/>
            </Routes>
        </MainContent>
    );
}

export default Main;