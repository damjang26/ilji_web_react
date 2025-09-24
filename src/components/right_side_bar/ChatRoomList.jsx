import { useEffect, useState } from "react";
import { api, leaveChatRoom } from "../../api.js";
import { useAuth } from "../../AuthContext.jsx";
import CreateChatRoomModal from "./CreateChatRoomModal.jsx";
import { Dropdown, Menu, message } from "antd";
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
import { FaChevronLeft } from "react-icons/fa";
import { BsThreeDotsVertical } from "react-icons/bs";

const ChatRoomList = ({ onBack, chatRoom }) => {
    const { user } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [roomList, setRoomList] = useState([]);

    const fetchRoomList = async () => {
        try {
            const res = await api.get("/api/chat/list");
            setRoomList(Array.isArray(res.data) ? res.data : []);
        } catch (error) {
            console.error("채팅방 목록을 불러오는 데 실패했습니다.", error);
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
        if (window.confirm("정말 채팅방을 나가시겠습니까? 나가시면 채팅방 목록에서 삭제됩니다.")) {
            try {
                await leaveChatRoom(roomId);
                message.success("채팅방을 나갔습니다.");
                fetchRoomList(); // Refresh the list
            } catch (error) {
                console.error("채팅방 나가기 실패:", error);
                message.error("채팅방 나가기에 실패했습니다.");
            }
        }
    };

    const getRoomDisplayName = (room, currentUser) => {
        if (room.roomName) return room.roomName;
        if (room.participants) {
            const otherParticipants = room.participants.filter(p => p.user && p.user.id !== currentUser.id);
            if (otherParticipants.length === 0) return "나 자신과의 대화";
            if (otherParticipants.length === 1) return `${otherParticipants[0].user.name}님과의 채팅`;
            return otherParticipants.map(p => p.user.name).join(', ');
        }
        return '채팅방';
    }

    const getMenu = (roomId) => ({
        items: [
            {
                key: 'leave',
                label: '나가기',
                danger: true,
                onClick: () => handleLeaveRoom(roomId),
            },
        ],
    });

    return (
        <ChatRoomListContainer>
            <UserInfo>{user.name}님의 채팅 목록</UserInfo>
            <RoomList>
                {roomList.map((room) => {
                    const otherParticipants = room.participants?.filter(p => p.user && p.user.id !== user.id) || [];
                    return (
                        <RoomItem key={room.roomId}>
                            <RoomName onClick={() => chatRoom(room.roomId)}>
                                {getRoomDisplayName(room, user)}
                            </RoomName>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <ParticipantAvatarsContainer>
                                    {otherParticipants.slice(0, 3).map(p => (
                                        <AvatarImage key={p.user.id} src={p.user.profile_image_url} alt={p.user.name} />
                                    ))}
                                </ParticipantAvatarsContainer>
                                <Dropdown menu={getMenu(room.roomId)} trigger={['click']} placement="bottomRight">
                                    <MenuButton onClick={e => e.stopPropagation()}>
                                        <BsThreeDotsVertical />
                                    </MenuButton>
                                </Dropdown>
                            </div>
                        </RoomItem>
                    );
                })}
            </RoomList>

            <AddButton onClick={() => setIsModalOpen(true)}>+</AddButton>

            <CreateChatRoomModal
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onChatRoomCreated={handleChatRoomCreated}
            />
        </ChatRoomListContainer>
    )
}

export default ChatRoomList;
