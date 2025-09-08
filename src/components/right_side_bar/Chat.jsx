import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import axios from "axios";
import {useAuth} from "../../AuthContext.jsx";

const Chat = ({ roomId, onBack }) => {
    const [username, setUsername] = useState('');
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const socketRef = useRef(null);
    const messagesEndRef = useRef(null);
    const { user } = useAuth();

    useEffect(() => {
        setUsername(user.name);
        console.log(roomId)

        // 소켓 연결
        socketRef.current = io('http://localhost:9095', { withCredentials: false });

        socketRef.current.on('connect', () => {
            console.log('Socket connected:', socketRef.current.id);
            socketRef.current.emit('joinRoom', roomId); // ✅ 선택된 방에 join
        });

        socketRef.current.on('chatMessage', (msg) => {
            setMessages((prevMessages) => [...prevMessages, msg]);
        });

        return () => {
            socketRef.current.disconnect();
        };
    }, [roomId]);

    const handleMessageSubmit = (e) => {
        e.preventDefault();
        if (message.trim() && username.trim()) {
            const chatMessage = { roomId, sender: username, receiver : user.name, message };
            socketRef.current.emit('chatMessage', chatMessage);
            setMessage('');
        }
    };

    return (
        <div>
            <button onClick={onBack}>뒤로가기</button>
            <div style={{ height: '80vh', overflowY: 'auto' }}>
                {messages.map((msg, i) => (
                    <div key={i}>
                        <strong>{msg.sender}:</strong> {msg.message}
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleMessageSubmit}>
                <input value={message} onChange={(e) => setMessage(e.target.value)} />
                <button type="submit">전송</button>
            </form>
        </div>
    );
};

export default Chat