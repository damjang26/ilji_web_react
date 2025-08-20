import { BrowserRouter } from "react-router-dom";
import Main from "./components/Main.jsx";
import LeftSideBar from "./components/LeftSideBar.jsx";

export default function App() {
    return (
        <BrowserRouter>
            <LeftSideBar/>
            <Main />
        </BrowserRouter>
    );
}