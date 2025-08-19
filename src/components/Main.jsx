import FullCalendarExample from "./main/FullCalendar.jsx";
import {Route, Routes} from "react-router-dom";

const Main = () => {
    return <Routes>
        <Route path="/" element={
            <>
                <FullCalendarExample/>
            </>
        }/>
    </Routes>
}

export default Main;