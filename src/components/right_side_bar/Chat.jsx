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
import { getAiTagSuggestion } from "../../api.js";
import ScheduleModal from "../common/ScheduleModal.jsx";
import {
    SuggestedTag,
    SuggestedTagButton
} from "../../styled_components/right_side_bar/ChatStyled.jsx";

const Chat = ({roomId}) => {
    const [username, setUsername] = useState('');
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [suggestedTag, setSuggestedTag] = useState(null); // AI 추천 태그
    const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
    const [initialScheduleData, setInitialScheduleData] = useState(null);
    const socketRef = useRef(null);
    const messagesEndRef = useRef(null);
    const {user} = useAuth();

    useEffect(() => {
        setUsername(user.name);

        api.get(`/api/chat/messages/${roomId}`)
            .then(res => setMessages(res.data))
            .catch(err => console.error("Failed to load existing message:", err));

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

    const handleMessageSubmit = async (e) => {
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

            // AI 태그 추천 요청
            console.log('Calling getAiTagSuggestion with message:', message);
            const tag = await getAiTagSuggestion(message);
            console.log('AI tag suggestion result:', tag);
            setSuggestedTag(tag);
            console.log('Updated suggestedTag state:', tag);

            setMessage('');
        }
    };

    const handleOpenScheduleModal = () => {
        setInitialScheduleData({ title: suggestedTag });
        setIsScheduleModalOpen(true);
    };

    const handleCloseScheduleModal = () => {
        setIsScheduleModalOpen(false);
        setInitialScheduleData(null);
        setSuggestedTag(null); // 모달 닫으면 추천 태그도 숨김
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
                    placeholder="Please enter your message."
                />
                <SendButton type="submit"><FaPaperPlane/></SendButton>
            </MessageForm>
            {suggestedTag && (
                <SuggestedTag>
                    <span>추천 태그:</span>
                    <SuggestedTagButton onClick={handleOpenScheduleModal}>
                        {suggestedTag}
                    </SuggestedTagButton>
                </SuggestedTag>
            )}
            {isScheduleModalOpen && (
                <ScheduleModal
                    isOpen={isScheduleModalOpen}
                    onClose={handleCloseScheduleModal}
                    initialData={initialScheduleData}
                />
            )}
        </ChatContainer>
    );
};

export default Chat;
