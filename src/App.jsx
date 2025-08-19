import { BrowserRouter, Routes, Route } from "react-router-dom";
import UsersList from "./components/UsersList";

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<UsersList />} />
            </Routes>
        </BrowserRouter>
    );
}
