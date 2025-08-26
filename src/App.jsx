import {BrowserRouter, useLocation, Routes, Route} from "react-router-dom";

import LeftSideBar from "./components/LeftSideBar.jsx";
import RightSideBar from "./components/RightSideBar.jsx";
import styled from "styled-components";
import {useAuth} from "./AuthContext.jsx";
import LoginPage from "./components/login/LoginPage.jsx";
import Main from "./components/Main.jsx";
import JournalWriteModal from "./components/main/journal/JournalWriteModal.jsx";

const AppContainer = styled.div`
    display: flex;
    position: relative; /* 자식 요소들의 position 기준이 될 수 있도록 설정 */
`;

const MainContentContainer = styled.div`
    flex-grow: 1; /* 남는 공간을 모두 차지 */
    /* 고정된 사이드바들 밑으로 컨텐츠가 깔리지 않도록 양쪽에 여백을 줍니다. */
    margin-left: 230px; /* LeftSideBar 너비만큼 */
    margin-right: 230px; /* RightSideBar 너비만큼 */
    display: flex;
    flex-direction: column;
    min-height: 100vh;
`;

const AppContent = () => {
    const {user, loading} = useAuth();
    const location = useLocation();

    // navigate로 전달받은 state에 backgroundLocation이 있는지 확인합니다.
    // 이것이 모달을 띄울지, 일반 페이지를 띄울지 결정하는 키입니다.
    const background = location.state && location.state.backgroundLocation;

    if (loading) {
        return <div>Loading...</div>;
    }

    return user ? (
        <AppContainer>
            <LeftSideBar/>
            <MainContentContainer>
                {/* 1. 배경이 될 메인 라우트를 항상 렌더링합니다. */}
                <Routes location={background || location}>
                    <Route path="/*" element={<Main/>}/>
                </Routes>

                {/* 2. background state가 있을 경우에만 모달 라우트를 추가로 렌더링합니다. */}
                {background && (
                    <Routes>
                        <Route path="/journal/write" element={<JournalWriteModal/>}/>
                    </Routes>
                )}
            </MainContentContainer>
            <RightSideBar/>
        </AppContainer>
    ) : (
        <LoginPage/>
    );
};

export default function App() {
    return (
        <BrowserRouter>
            <AppContent/>
        </BrowserRouter>
    );
}
