import FullCalendarExample from "./main/calendar/FullCalendar.jsx";
import {Route, Routes} from "react-router-dom";
import styled from "styled-components";
import Post from "./main/post/Post.jsx"; 
import MyPageSet from "./main/mypage/MyPageSet.jsx"; // [추가]
import MyPageWrapper from "./main/mypage/MyPage.jsx"; // [수정] MyPageWrapper를 import합니다.


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

                {/* [수정] /mypage 와 /mypage/:userId 경로를 모두 처리합니다. */}
                <Route path="/mypage/:userId?" element={<MyPageWrapper />} />

                {/* [추가] 정보 수정 페이지 경로를 추가합니다. */}
                <Route path="/mypageset" element={<MyPageSet />} />

                <Route path="/post/*" element={<Post/>}/>
            </Routes>
        </MainContent>
    );
}

export default Main;