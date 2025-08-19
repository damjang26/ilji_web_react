import { BrowserRouter, Routes, Route } from "react-router-dom";
import UsersList from "./components/UsersList";
import FullCalendarExample from "./components/FullCalendar";

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={
                    <>
                        {/*<UsersList />*/}
                        <FullCalendarExample />
                    </>
                } />
            </Routes>
        </BrowserRouter>
    );
}