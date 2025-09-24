import React, {useState, useEffect} from "react";
import {BrowserRouter, useLocation, Routes, Route, useNavigate} from "react-router-dom";
import {Spin} from "antd";
import styled from "styled-components";

// --- Providers ---
import {useAuth} from "./AuthContext.jsx";
import {JournalProvider} from "./contexts/JournalContext.jsx";
import {MyPageProvider} from "./contexts/MyPageContext.jsx";
import {ScheduleProvider, useSchedule} from "./contexts/ScheduleContext.jsx";
import {TagProvider} from "./contexts/TagContext.jsx";
import {NotificationsProvider} from "./contexts/NotificationsContext.jsx";

// --- Page & Layout Components ---
import LeftSideBar from "./components/LeftSideBar.jsx";
import Main from "./components/Main.jsx";
import LoginPage from "./components/login/LoginPage.jsx";
import SetNicknamePage from "./components/nickname_set/SetNickNamePage.jsx";

// --- Modal Components ---
import JournalWriteModal from "./components/main/journal/JournalWriteModal.jsx";
import JournalViewModal from "./components/main/journal/JournalViewModal.jsx";
import ScheduleModal from "./components/common/ScheduleModal.jsx";

// --- New Floating UI System Components ---
import FloatingActionButtons from "./components/common/FloatingActionButtons.jsx";
import FloatingPanel from "./components/common/FloatingPanel.jsx";
import SchedulePanelContent from "./components/main/calendar/SchedulePanelContent.jsx";
import ScheduleTab from "./components/right_side_bar/ScheduleTab.jsx";
import ChatRoomList from "./components/right_side_bar/ChatRoomList.jsx";
import Chat from "./components/right_side_bar/Chat.jsx";
import JournalDatePicker from "./components/right_side_bar/JournalDatePicker.jsx"; // ✅ [추가]

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

const getSchedulePanelTitle = (type) => {
    switch (type) {
        case 'new':
            return '새 일정 추가';
        case 'edit':
            return '일정 수정';
        case 'detail':
            return '일정 상세 정보';
        // case 'list_for_date':
        //     return '선택한 날짜의 일정';
        case 'rrule_form':
            return '반복 설정';
        default:
            return '일정';
    }
}

const AppContent = () => {
    const {user, loading} = useAuth();
    const location = useLocation();
    const navigate = useNavigate(); // ✅ [추가] navigate 함수를 가져옵니다.

    const [activePanel, setActivePanel] = useState(null);
    const [floatingChatRoomId, setFloatingChatRoomId] = useState(null);
    const {selectedInfo, clearScheduleSelection} = useSchedule();

    // ✅ selectedInfo에 값이 생기면 (상세/수정/추가 패널이 열리면)
    //    기존에 열려있던 목록 패널(activePanel)은 닫아줍니다.
    useEffect(() => {
        if (selectedInfo) {
            setActivePanel(null);
        }
    }, [selectedInfo]);

    const handlePanelButtonClick = (panel) => {
        console.log("handlePanelButtonClick called with:", panel);
        setActivePanel(prev => {
            const newState = prev === panel ? null : panel;
            console.log("activePanel changing from", prev, "to", newState);
            return newState;
        });
    };

    const handleChatRoomSelect = (roomId) => {
        setFloatingChatRoomId(roomId);
        setActivePanel(null); // 메시지 목록 패널은 닫음
    };

    // ✅ [추가] 날짜 선택 패널에서 날짜 선택 시 실행될 함수
    const handleDateSelectForJournal = (date) => {
        // 패널을 닫고, 일기 작성 모달로 이동
        setActivePanel(null);
        navigate("/journal/write", {
            state: {
                backgroundLocation: location,
                selectedDate: date,
            },
        });
    };


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
                <Routes location={background || location}>
                    <Route path="/set-nickname" element={<SetNicknamePage/>}/>
                    <Route path="/*" element={<Main/>}/>
                </Routes>

                {background && (
                    <Routes>
                        <Route path="/journal/write" element={<JournalWriteModal/>}/>
                        <Route path="/journals/:journalId" element={<JournalViewModal/>}/>
                    </Routes>
                )}
            </ContentWrapper>

            {/* === 새로운 플로팅 UI === */}
            <FloatingActionButtons onButtonClick={handlePanelButtonClick}/>

            {activePanel === 'schedule' && (
                <FloatingPanel title="schedule list" onClose={() => setActivePanel(null)}>
                    <ScheduleTab/>
                </FloatingPanel>
            )}

            {activePanel === 'messages' && (
                <FloatingPanel title="message" onClose={() => setActivePanel(null)}>
                    <ChatRoomList chatRoom={handleChatRoomSelect} onBack={() => setActivePanel(null)}/>
                </FloatingPanel>
            )}

            {/* ✅ [추가] '일기 작성' 패널 */}
            {activePanel === 'writeJournal' && (
                <FloatingPanel title="Write i-log" onClose={() => setActivePanel(null)}>
                    <JournalDatePicker onDateSelect={handleDateSelectForJournal}/>
                </FloatingPanel>
            )}

            {/* 캘린더 빈 공간 눌렀을 때 패널 나오게 하는 코드였는데 병주가 다른걸로 한다고 했으니까 일단 주석 처리해두겠음 */}
            {selectedInfo && selectedInfo.type !== 'list_for_date' && (
                <FloatingPanel
                    title={getSchedulePanelTitle(selectedInfo.type)}
                    onClose={clearScheduleSelection}
                >
                    <SchedulePanelContent/>
                </FloatingPanel>
            )}

            {floatingChatRoomId && (
                <FloatingPanel
                    title="채팅"
                    onClose={() => {
                        setFloatingChatRoomId(null);
                        setActivePanel('messages');
                    }}
                >
                    <Chat
                        roomId={floatingChatRoomId}
                    />
                </FloatingPanel>
            )}
            {/* ============================ */}

            {/* 일정 관리를 위한 동적 위치 모달 */}
            <ScheduleModal />

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
                                <NotificationsProvider>
                                    <AppContent/>
                                </NotificationsProvider>
                            </TagProvider>
                        </ScheduleProvider>
                    </MyPageProvider>
                </JournalProvider>
            </BrowserRouter>
            <div id="modal-root"></div>
        </>
    );
}
