import {Link} from "react-router-dom";
import styled from "styled-components";
import React, {useEffect, useRef, useState} from "react";
import {Overlay, SidebarWrapper, ToggleButton} from "../../styled_components/MainStyled.jsx";

const TabMenuContainer = styled.div`
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    justify-content: center; /* 자식 요소들을 수직 중앙에 배치 */
    align-items: center; /* 자식 요소들을 수평 중앙에 배치 */
    gap: 15px; /* 요소들 사이의 간격 */
`;

const TabMenu = () => {
    const [open, setOpen] = useState(false);
    const sidebarRef = useRef(null);

    // 외부 클릭 감지
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (open && sidebarRef.current && !sidebarRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [open]);

    return (
        <TabMenuContainer>
            <hr/>
            <div>TabMenu</div>
            <Link to="/">Calendar</Link>
            <Link to="/journal">Journal</Link>
            <ToggleButton onClick={() => setOpen(true)}>Notifications</ToggleButton>
            <Overlay open={open}/>
            <SidebarWrapper ref={sidebarRef} open={open}>
                <h2>사이드바</h2>
                <p>여기에 내용 넣기</p>
                <button onClick={() => setOpen(false)}>닫기</button>
            </SidebarWrapper>
        </TabMenuContainer>
    );
}

export default TabMenu;