import React, {useState, useRef, useEffect} from "react";
import ReactDOM from "react-dom";
import Profile from "./left_side_bar/Profile.jsx";
import CalendarMenu from "./left_side_bar/CalendarMenu.jsx";
import TabMenu from "./left_side_bar/TabMenu.jsx";
import {
    MenuItemsContainer,
    MenuItemWrapper,
    SidebarContainer,
    NotiSidebarWrapper,
    Overlay,
} from "../styled_components/LeftSideBarStyled.jsx";
import NotificationsPanel from "./left_side_bar/NotificationsPanel.jsx"; // 경로는 프로젝트 구조에 맞춰 조정
import { useNotifications } from "../contexts/NotificationsContext.jsx"; // 경로 조정


const LeftSideBar = () => {
    const [isNotiOpen, setNotiOpen] = useState(false);
    const notiSidebarRef = useRef(null);
    const toggleButtonRef = useRef(null);

    // ✅ Context에서 알림 데이터/액션 가져오기
    const {
        notifications,
        unreadCount, // 읽지 않은 개수
        markAllRead,
        deleteAll,
        markRead,
        deleteOne,
        loading,
    } = useNotifications();

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (
                isNotiOpen &&
                notiSidebarRef.current &&
                !notiSidebarRef.current.contains(e.target) &&
                toggleButtonRef.current &&
                !toggleButtonRef.current.contains(e.target)
            ) {
                setNotiOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isNotiOpen]);

    return (
        <>
            {/* ✅ [수정] mousedown 이벤트의 전파를 막아, 다른 팝업(일정 팝업 등)이 닫히는 현상을 방지합니다. */}
            <SidebarContainer onMouseDown={(e) => e.stopPropagation()}>
                <MenuItemsContainer>
                    <MenuItemWrapper><Profile/></MenuItemWrapper>
                    <MenuItemWrapper>
                        <TabMenu 
                            unreadCount={unreadCount} // 뱃지에 표시할 개수 전달
                            toggleButtonRef={toggleButtonRef} 
                            onToggle={() => setNotiOpen(!isNotiOpen)}
                        />
                    </MenuItemWrapper>
                    <MenuItemWrapper><CalendarMenu/></MenuItemWrapper>
                </MenuItemsContainer>
            </SidebarContainer>

            {ReactDOM.createPortal(
                <>
                    <Overlay open={isNotiOpen} onClick={() => setNotiOpen(false)}/>
                    <NotiSidebarWrapper
                        ref={notiSidebarRef}
                        open={isNotiOpen}
                        onMouseDown={(e) => e.stopPropagation()}
                    >
                        {/* 로딩 표시가 필요하면 간단하게 처리 */}
                        {loading ? (
                            <div style={{ padding: "16px", textAlign: "center" }}>Loading...</div>
                        ) : (
                            <NotificationsPanel
                                items={notifications}                 // 최신순 정렬은 Context에서 보장
                                onMarkAllRead={markAllRead}
                                onDeleteAll={deleteAll}
                                onItemRead={markRead}
                                onItemDelete={deleteOne}
                            />
                        )}
                    </NotiSidebarWrapper>
                </>,
                document.body
            )}
        </>
    );
};

export default LeftSideBar;