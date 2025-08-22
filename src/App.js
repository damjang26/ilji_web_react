import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainLayout from "./components/main/MainLayout";

function App() {
  return (
    <Router>
      <Routes>
        {/* 앱의 모든 주요 경로는 이제 MainLayout을 통해 렌더링됩니다. */}
        <Route path="/*" element={<MainLayout />} />
      </Routes>
    </Router>
  );
}

export default App;
