import { BrowserRouter } from "react-router-dom";
import Main from "./components/Main.jsx";
import LeftSideBar from "./components/LeftSideBar.jsx";
import RightSideBar from "./components/RightSideBar.jsx";
import styled from "styled-components";
import { useAuth } from "./AuthContext.jsx";
import LoginPage from "./components/login/LoginPage.jsx";

const AppContainer = styled.div`
  display: flex;
  flex-direction: row;
`;


export default function App() {
    const { user, loading } = useAuth();

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <BrowserRouter>
            {user ? (
                <AppContainer>
                    <LeftSideBar />
                    <Main />
                    <RightSideBar/>
                </AppContainer>
            ) : (
                <LoginPage />
            )}
        </BrowserRouter>
    );
}