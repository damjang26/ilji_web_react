import FullCalendarExample from "./main/calendar/FullCalendar.jsx";
import {Route, Routes} from "react-router-dom";
import styled from "styled-components";
import Post from "./main/post/Post.jsx";
import { MyPageProvider } from "../contexts/MyPageContext"; // MyPageProvider를 가져옵니다.
import MyPageWrapper from "./main/mypage/MyPageWrapper.jsx"; // 새로 만든 Wrapper를 가져옵니다.
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
                {/* MyPageProvider가 MyPageWrapper를 감싸도록 수정합니다. */}
                <Route path="/mypage" element={
                    <MyPageProvider>
                        <MyPageWrapper/>
                    </MyPageProvider>
                }/>
                <Route path="/post/*" element={<Post/>}/>
            </Routes>
        </MainContent>
    );
}

export default Main;