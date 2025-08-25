import {BrowserRouter} from "react-router-dom";
import Main from "./components/Main.jsx";
import LeftSideBar from "./components/LeftSideBar.jsx";
import RightSideBar from "./components/RightSideBar.jsx";
import styled from "styled-components";
import {useAuth} from "./AuthContext.jsx";
import LoginPage from "./components/login/LoginPage.jsx";

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

export default function App() {
    const {user, loading} = useAuth();

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <BrowserRouter>
            {user ? (
                <AppContainer>
                    <LeftSideBar/>
                    <MainContentContainer>
                        <Main/>
                    </MainContentContainer>
                    <RightSideBar/>
                </AppContainer>
            ) : (
                <LoginPage/>
            )}
        </BrowserRouter>
    );
}
