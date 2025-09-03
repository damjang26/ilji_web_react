import {Link} from "react-router-dom";
import React from "react";
import {
    MenuLink,
    TabMenuContainer,
    ToggleButton
} from "../../styled_components/left_side_bar/TabMenuStyled.jsx";
import {FaBell, FaCalendarAlt, FaListAlt} from "react-icons/fa";


const TabMenu = ({toggleButtonRef, onToggle}) => {
    return (
        <TabMenuContainer>
            <MenuLink to="/"><FaCalendarAlt/> Calendar</MenuLink>
            <MenuLink to="/post"><FaListAlt/> Post</MenuLink>
            <ToggleButton ref={toggleButtonRef} onClick={onToggle}>
                <FaBell/> Notifications
            </ToggleButton>
            
        </TabMenuContainer>
    );
};

export default TabMenu;