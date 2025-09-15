import {useEffect, useState} from "react";
import {api} from "../../api.js";
import {useAuth} from "../../AuthContext.jsx";
import CreateChatRoomModal from "./CreateChatRoomModal.jsx";
import {Button} from "antd";

const ChatRoomList = ({ onBack, chatRoom }) => {
    const {user} = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [roomList, setRoomList] = useState([]);

    const fetchRoomList = async () => {
        try {
            const res = await api.get("/api/chat/list");
            if (Array.isArray(res.data)) {
                setRoomList(res.data);
            } else {
                console.error("API did not return an array for chat list:", res.data);
                setRoomList([]); // Ensure roomList is an array to prevent crash
            }
        } catch (error) {
            console.error("채팅방 목록을 불러오는 데 실패했습니다.", error);
            setRoomList([]); // Also ensure roomList is an array on error
        }
    }

    useEffect(() => {
        fetchRoomList();
    }, []);

    const handleChatRoomCreated = (newRoom) => {
        fetchRoomList(); // Refresh the list
        chatRoom(newRoom.roomId); // Optionally, enter the new chat room immediately
    };

    const getRoomDisplayName = (room, currentUser) => {
        if (room.roomName) {
            return room.roomName;
        }

        if (room.participants && room.participants.length > 0) {
            const otherParticipants = room.participants.filter(p => p.user && p.user.id !== currentUser.id);

            if (otherParticipants.length === 0) {
                // This can happen in a chat with only oneself.
                return "나 자신과의 대화";
            }
            if (otherParticipants.length === 1) {
                return `${otherParticipants[0].user.name}님과의 채팅방`;
            }
            return otherParticipants.map(p => p.user.name).join(', ');
        }

        return '채팅방'; // Fallback for rooms with no name and no participant info
    }

    return (
        <div>
            <button onClick={onBack}>뒤로가기</button>
            <Button onClick={() => setIsModalOpen(true)}>+</Button>
            <hr/>
            ({user.email}'s) room list
            {roomList.map((room) => (
                <li key={room.roomId} onClick={()=> chatRoom(room.roomId)}>
                    {getRoomDisplayName(room, user)}
                </li>
            ))}

            <hr/>
            <CreateChatRoomModal
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onChatRoomCreated={handleChatRoomCreated}
            />
        </div>
    )

}

export default ChatRoomList;