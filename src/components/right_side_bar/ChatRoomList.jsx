import {useEffect, useState} from "react";
import {api, leaveChatRoom} from "../../api.js";
import {useAuth} from "../../AuthContext.jsx";
import CreateChatRoomModal from "./CreateChatRoomModal.jsx";
import {Dropdown, Menu, message} from "antd";
import {
    AddButton,
    BackButton,
    ChatRoomListContainer,
    Header,
    MenuButton,
    RoomItem,
    RoomList,
    RoomName,
    UserInfo,
    ParticipantAvatarsContainer, // 추가
    AvatarImage, // 추가
} from "../../styled_components/right_side_bar/ChatRoomListStyled.jsx";
import {BsThreeDotsVertical} from "react-icons/bs";
import {FiPlus} from "react-icons/fi";

const ChatRoomList = ({onBack, chatRoom}) => {
    const {user} = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [roomList, setRoomList] = useState([]);

    const fetchRoomList = async () => {
        try {
            const res = await api.get("/api/chat/list");
            setRoomList(Array.isArray(res.data) ? res.data : []);
        } catch (error) {
            console.error("Failed to load the chat room list.", error);
            setRoomList([]);
        }
    }

    useEffect(() => {
        fetchRoomList();
    }, []);

    const handleChatRoomCreated = (newRoom) => {
        fetchRoomList();
        chatRoom(newRoom.roomId);
    };

    const handleLeaveRoom = async (roomId) => {
        if (window.confirm("Are you sure you want to leave the chat room? You will be removed from the chat room list.")) {
            try {
                await leaveChatRoom(roomId);
                message.success("Left the chat room.");
                fetchRoomList(); // Refresh the list
            } catch (error) {
                console.error("Failed to leave chat room:", error);
                message.error("Failed to leave the chat room.");
            }
        }
    };

    const getRoomDisplayName = (room, currentUser) => {
        if (room.roomName) return room.roomName;
        if (room.participants) {
            const otherParticipants = room.participants.filter(p => p.user && p.user.id !== currentUser.id);
            if (otherParticipants.length === 0) return "conversation with myself";
            if (otherParticipants.length === 1) return `chat with ${otherParticipants[0].user.name}`;
            return otherParticipants.map(p => p.user.name).join(', ');
        }
        return 'Chat room';
    }

    const getMenu = (roomId) => ({
        items: [
            {
                key: 'leave',
                label: 'leave',
                danger: true,
                onClick: () => handleLeaveRoom(roomId),
            },
        ],
    });

    return (
        <ChatRoomListContainer>
            <UserInfo>{user.name}'s chat list</UserInfo>
            <RoomList>
                {roomList.map((room) => {
                    const otherParticipants = room.participants?.filter(p => p.user && p.user.id !== user.id) || [];
                    return (
                        <RoomItem key={room.roomId}>
                            <RoomName onClick={() => chatRoom(room.roomId)}>
                                {getRoomDisplayName(room, user)}
                            </RoomName>
                            <div style={{display: 'flex', alignItems: 'center'}}>
                                <ParticipantAvatarsContainer>
                                    {otherParticipants.slice(0, 3).map(p => (
                                        <AvatarImage key={p.user.id} src={p.user.profile_image_url} alt={p.user.name}/>
                                    ))}
                                </ParticipantAvatarsContainer>
                                <Dropdown menu={getMenu(room.roomId)} trigger={['click']} placement="bottomRight">
                                    <MenuButton onClick={e => e.stopPropagation()}>
                                        <BsThreeDotsVertical/>
                                    </MenuButton>
                                </Dropdown>
                            </div>
                        </RoomItem>
                    );
                })}
            </RoomList>

            <AddButton onClick={() => setIsModalOpen(true)}><FiPlus/></AddButton>

            <CreateChatRoomModal
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onChatRoomCreated={handleChatRoomCreated}
            />
        </ChatRoomListContainer>
    )
}

export default ChatRoomList;
