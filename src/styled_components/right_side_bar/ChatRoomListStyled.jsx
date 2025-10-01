import styled from 'styled-components';
import { Button } from 'antd';

export const ChatRoomListContainer = styled.div`
    display: flex;
    flex-direction: column;
    height: 100%;
    font-family: 'GowoonDodum', sans-serif;
    position: relative; // For the FAB
`;

export const Header = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 20px;
    border-bottom: 1px solid #e9ecef;
`;

const commonButtonStyle = `
    background: none;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 8px;
    border-radius: 50%;
    color: #8394a6;
    transition: all 0.2s ease-in-out;

    &:hover {
        background-color: #efefef;
        color: #7b5fff;
    }

    svg {
        font-size: 16px;
    }
`;

export const BackButton = styled.button`
    ${commonButtonStyle}
`;

export const AddButton = styled(Button)`
    position: absolute;
    bottom: 20px;
    right: 20px;
    border-radius: 50%;
    width: 50px;
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 10;
`;

export const UserInfo = styled.div`
    padding: 15px 20px;
    font-size: 12px;
    color: #8394a6;
    background-color: #f8f9fa;
`;

export const RoomList = styled.ul`
    list-style: none;
    padding: 0;
    margin: 0;
    flex-grow: 1;
    overflow-y: auto;
`;

export const MenuButton = styled.div`
    ${commonButtonStyle}
    padding: 4px;
    margin-left: 10px;
    z-index: 5; // Ensure it's clickable
    visibility: hidden; // Initially hidden
    opacity: 0;
    transition: opacity 0.2s ease-in-out, visibility 0.2s ease-in-out;
`;

export const RoomItem = styled.li`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 20px;
    height: 60px;
    font-size: 14px;
    color: #343a40;
    border-bottom: 1px solid #e9ecef;
    transition: background-color 0.2s ease-in-out;

    &:hover {
        background-color: #f1f3f5;

        // Show menu button on hover
        ${MenuButton} {
            visibility: visible;
            opacity: 1;
        }
    }
`;

export const RoomName = styled.div`
    flex-grow: 1;
    cursor: pointer;
    height: 100%;
    display: flex;
    align-items: center;
`;

export const ParticipantAvatarsContainer = styled.div`
    display: flex;
    align-items: center;
    margin-right: 5px; /* 메뉴 버튼과의 간격 */
`;

export const AvatarImage = styled.img`
    width: 24px;
    height: 24px;
    border-radius: 50%;
    border: 2px solid #fff; /* 겹칠 때 테두리 효과 */
    object-fit: cover;

    &:not(:first-child) {
        margin-left: -8px; /* 겹치는 효과 */
    }
`;

export const StyledHr = styled.hr`
    width: 90%;
    border: none;
    border-top: 1px solid #e9ecef;
    margin: 10px auto;
`;
