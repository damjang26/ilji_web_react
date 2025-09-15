import React, {useState} from "react";
import {BrowserRouter, useLocation, Routes, Route} from "react-router-dom";
import {Spin} from 'antd';

import LeftSideBar from "./components/LeftSideBar.jsx";
import RightSideBar from "./components/RightSideBar.jsx";
import styled from "styled-components";
import {useAuth} from "./AuthContext.jsx";
import LoginPage from "./components/login/LoginPage.jsx";
import Main from "./components/Main.jsx";
import JournalWriteModal from "./components/main/journal/JournalWriteModal.jsx";
import {JournalProvider} from "./contexts/JournalContext.jsx";
import JournalViewModal from "./components/main/journal/JournalViewModal.jsx";
import { ScheduleProvider } from "./contexts/ScheduleContext.jsx";
import { MyPageProvider } from "./contexts/MyPageContext.jsx";
import { TagProvider } from "./contexts/TagContext.jsx";
import SetNicknamePage from "./components/nickname_set/SetNickNamePage.jsx";

const AppWrapper = styled.div`
    display: flex;
    width: 100%;
    height: 100vh;
    overflow: hidden; /* 전체 페이지의 스크롤바를 방지 */
`;

const FullPageSpinner = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100vw;
    height: 100vh;
`;

const ContentWrapper = styled.div`
    flex-grow: 1; /* 남는 공간을 모두 차지 */
    display: flex;
    flex-direction: column;
    overflow-y: auto; /* 내용이 많아지면 이 영역만 스크롤되도록 설정 */
    position: relative; /* 모달을 위한 position 기준점 */
`;

const AppContent = () => {
    const {user, loading} = useAuth();
    const location = useLocation();

    // navigate로 전달받은 state에 backgroundLocation이 있는지 확인합니다.
    // 이것이 모달을 띄울지, 일반 페이지를 띄울지 결정하는 키입니다.
    const background = location.state && location.state.backgroundLocation;

    if (loading) {
        return (
            <FullPageSpinner>
                <Spin size="large"/>
            </FullPageSpinner>
        );
    }

    return user ? (
        <AppWrapper>
            <LeftSideBar/>
            <ContentWrapper>
                {/* 1. 배경이 될 메인 라우트를 항상 렌더링합니다. */}
                <Routes location={background || location}>
                    {/* 닉네임이 없는 사용자를 위한 별도 라우트 */}
                    <Route path="/set-nickname" element={<SetNicknamePage />} />
                    {/* 닉네임이 있는 사용자를 위한 메인 라우트 */}
                    <Route path="/*" element={<Main />} />
                </Routes>

                {/* 2. background state가 있을 경우에만 모달 라우트를 추가로 렌더링합니다. */}
                {background && (
                    <Routes>
                        <Route path="/journal/write" element={<JournalWriteModal/>}/>
                        <Route path="/journals/:journalId" element={<JournalViewModal/>}/>
                    </Routes>
                )}
            </ContentWrapper>
            <RightSideBar/>
        </AppWrapper>
    ) : (
        <LoginPage/>
    );
};

export default function App() {
    return (
        <>
            <BrowserRouter>
                <JournalProvider>
                    <MyPageProvider>
                        <ScheduleProvider>
                            <TagProvider>
                                <AppContent/>
                            </TagProvider>
                        </ScheduleProvider>
                    </MyPageProvider>
                </JournalProvider>
            </BrowserRouter>
            <div id="modal-root"></div>
        </>
    );
}
