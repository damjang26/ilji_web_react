import styled from "styled-components";

export const NotificationsStyle = styled.div`
`;

export const SidebarWrapper = styled.div`
    position: fixed;
    top: 0;
    left: 200px;
    height: 100%;
    width: 200px;
    background-color: #fff;
    box-shadow: 2px 0 8px rgba(0, 0, 0, 0.2);
    transform: ${({open}) => (open ? "translateX(0)" : "translateX(-100%)")};
    transition: transform 0.3s ease-in-out;
    z-index: -1;
    padding: 20px;
`;

export const Overlay = styled.div`
    display: ${({open}) => (open ? "block" : "none")};
    position: fixed;
    inset: 0;
    z-index: 999;
`;

export const ToggleButton = styled.div`

`;