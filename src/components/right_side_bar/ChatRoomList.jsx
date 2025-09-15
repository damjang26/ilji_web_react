import {useEffect, useState} from "react";
import axios from "axios";
import {api} from "../../api.js";
import {useAuth} from "../../AuthContext.jsx";

const ChatRoomList = ({ onBack, chatRoom }) => {
     const {user} = useAuth();


const [roomList, setRoomList] = useState([]);

useEffect(() => {
    // console.log("chat room loaded")
    const fetchRoomList =  async () => {
        try {
            const res = await api.get("/api/chat/list");
            // 2. API로 받아온 데이터를 roomList 상태에 저장합니다.
            setRoomList(res.data);
        } catch (error) {
            console.error("채팅방 목록을 불러오는 데 실패했습니다.", error);
        }
    }
    fetchRoomList();
    // 1. 의존성 배열을 비워서 컴포넌트가 처음 마운트될 때 한 번만 실행되도록 합니다.
}, []);

return (
    <div>
        <button onClick={onBack}>뒤로가기</button>
        <hr/>
        ({user.email}'s) room list
        {roomList.map((room) => (
            <li key={room.roomId} onClick={()=> chatRoom(room.roomId)}>
                {room.roomId} - {user.email == room.user1Id ? room.user2Id : room.user1Id}님과의 채팅방
            </li>
        ))}

        <hr/>
    </div>
)

}

export default ChatRoomList;