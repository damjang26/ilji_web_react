import { BrowserRouter } from "react-router-dom";
import Main from "./components/Main.jsx";
import LeftSideBar from "./components/LeftSideBar.jsx";
import RightSideBar from "./components/RightSideBar.jsx";
import styled from "styled-components";

const AppContainer = styled.div`
  display: flex;
  flex-direction: row;
`;


export default function App() {
    return (
        <BrowserRouter>
            <AppContainer>
                <LeftSideBar />
                <Main />
                <RightSideBar/>
            </AppContainer>
        </BrowserRouter>
    );
}
