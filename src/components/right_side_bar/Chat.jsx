import React, {useState, useEffect, useRef} from 'react';
import io from 'socket.io-client';
import {api} from '../../api.js';
import {useAuth} from "../../AuthContext.jsx";
// leaveChatRoom is no longer needed here
import {
    ChatContainer,
    Message,
    MessageBubble,
    MessageForm,
    MessageInput,
    MessagesContainer,
    SendButton,
    Sender,
    SystemMessage
} from "../../styled_components/right_side_bar/ChatStyled.jsx";
import { FaPaperPlane } from "react-icons/fa";

const Chat = ({roomId}) => {
    const [username, setUsername] = useState('');
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const socketRef = useRef(null);
    const messagesEndRef = useRef(null);
    const {user} = useAuth();

    useEffect(() => {
        setUsername(user.name);

        api.get(`/api/chat/messages/${roomId}`)
            .then(res => setMessages(res.data))
            .catch(err => console.error("기존 메시지 로드 실패:", err));

        socketRef.current = io('http://localhost:9092', {withCredentials: false});

        socketRef.current.on('connect', () => {
            socketRef.current.emit('joinRoom', roomId);
        });

        socketRef.current.on('chatMessage', (msg) => {
            setMessages((prev) => [...prev, msg]);
        });

        return () => {
            socketRef.current.disconnect();
        };
    }, [roomId, user.name]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({behavior: "smooth"});
    }, [messages]);

    const handleMessageSubmit = (e) => {
        e.preventDefault();
        if (message.trim() && username.trim()) {
            const chatMessage = {
                roomId,
                sender: username,
                receiver: user.name, // 이 부분은 백엔드에서 해석해서 사용될 수 있습니다.
                message,
                messageType: 'NORMAL'
            };
            socketRef.current.emit('chatMessage', chatMessage);
            setMessage('');
        }
    };

    return (
        <ChatContainer>
            <MessagesContainer>
                {messages.map((msg, i) => {
                    if (msg.messageType === 'SYSTEM') {
                        return <SystemMessage key={i}>{msg.message}</SystemMessage>;
                    }
                    const isMine = msg.sender === username;
                    return (
                        <Message key={i} $isMine={isMine}>
                            {!isMine && <Sender>{msg.sender}</Sender>}
                            <MessageBubble $isMine={isMine}>{msg.message}</MessageBubble>
                        </Message>
                    );
                })}
                <div ref={messagesEndRef}/>
            </MessagesContainer>
            <MessageForm onSubmit={handleMessageSubmit}>
                <MessageInput
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="메시지를 입력하세요"
                />
                <SendButton type="submit"><FaPaperPlane/></SendButton>
            </MessageForm>
        </ChatContainer>
    );
};

export default Chat;
