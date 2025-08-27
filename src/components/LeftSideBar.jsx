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


const LeftSideBar = () => {
    const [isNotiOpen, setNotiOpen] = useState(false);
    const notiSidebarRef = useRef(null);
    const toggleButtonRef = useRef(null);

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
        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    }, [isNotiOpen]);

    return (
        <>
            <SidebarContainer>
                <MenuItemsContainer>
                    <MenuItemWrapper><Profile/></MenuItemWrapper>
                    <MenuItemWrapper>
                        <TabMenu toggleButtonRef={toggleButtonRef} onToggle={() => setNotiOpen(!isNotiOpen)}/>
                    </MenuItemWrapper>
                    {/*<ConfigProvider theme={{hashed: false}}> /!** ConfigProvider 추가 **!/*/}
                    <MenuItemWrapper><CalendarMenu/></MenuItemWrapper>
                    {/*</ConfigProvider>*/}
                </MenuItemsContainer>
            </SidebarContainer>

            {ReactDOM.createPortal(
                <>
                    <Overlay open={isNotiOpen} onClick={() => setNotiOpen(false)}/>
                    <NotiSidebarWrapper ref={notiSidebarRef} open={isNotiOpen} onClick={(e) => e.stopPropagation()}>
                        <h2>Notifications</h2>
                        <p>여기에 내용 넣기</p>
                    </NotiSidebarWrapper>
                </>,
                document.body
            )}
        </>
    );
};

export default LeftSideBar;