import {Link} from "react-router-dom";
import styled from "styled-components";
import React from "react";
import {ToggleButton} from "../../styled_components/left_side_bar/TabMenuStyled.jsx";

const TabMenuContainer = styled.div`
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    justify-content: center; /* 자식 요소들을 수직 중앙에 배치 */
    align-items: center; /* 자식 요소들을 수평 중앙에 배치 */
    gap: 15px; /* 요소들 사이의 간격 */
`;

const TabMenu = ({toggleButtonRef, onToggle}) => {
    return (
        <TabMenuContainer>
            <hr/>
            <div>Tab Menu</div>
            <Link to="/">Calendar</Link>
            <Link to="/post">Post</Link>
            <ToggleButton ref={toggleButtonRef} onClick={onToggle}>
                Notifications
            </ToggleButton>
        </TabMenuContainer>
    );
};

export default TabMenu;