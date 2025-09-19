import {Link} from "react-router-dom";
import React from "react";
import {
    MenuLink,
    TabMenuContainer,
} from "../../styled_components/left_side_bar/TabMenuStyled.jsx";
import {FaCalendarAlt, FaListAlt} from "react-icons/fa";


const TabMenu = () => {
    return (
        <TabMenuContainer>
            <MenuLink to="/"><FaCalendarAlt/> Calendar</MenuLink>
            <MenuLink to="/posts"><FaListAlt/> Post</MenuLink>
        </TabMenuContainer>
    );
};

export default TabMenu;