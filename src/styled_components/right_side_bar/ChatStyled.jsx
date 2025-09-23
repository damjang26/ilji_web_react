import styled from 'styled-components';

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
    font-size: 16px;
    transition: all 0.2s ease-in-out;

    &:hover {
        background-color: #efefef;
        color: #7b5fff;
    }
`;

export const HeaderIconButton = styled.button`
    ${commonButtonStyle}
    font-size: 18px; /* Slightly larger for header icons */
    padding: 6px; /* Adjust padding for icon size */
    svg {
        font-size: 18px;
    }
`;

export const ChatContainer = styled.div`
    display: flex;
    flex-direction: column;
    height: 100%;
    font-family: 'Inter', sans-serif;
`;

export const Header = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 20px;
    border-bottom: 1px solid #e9ecef;
    flex-shrink: 0;
`;

export const HeaderTitle = styled.strong`
    font-size: 18px;
    font-weight: 600;
    color: #8394a6;
`;

export const LeaveButton = styled.button`
    ${commonButtonStyle}
    font-size 14px; // smaller text for button
    color: #fa5252; // red for leaving

    &:hover {
        color: #c0392b;
    }
`;

export const MessagesContainer = styled.div`
    flex-grow: 1;
    overflow-y: auto;
    padding: 20px;
    background-color: #f8f9fa;
`;

export const Message = styled.div`
    display: flex;
    flex-direction: column;
    margin-bottom: 15px;
    align-items: ${props => (props.$isMine ? 'flex-end' : 'flex-start')};
`;

export const Sender = styled.div`
    font-size: 12px;
    color: #868e96;
    margin-bottom: 5px;
    margin-left: ${props => (props.$isMine ? '0' : '5px')};
    margin-right: ${props => (props.$isMine ? '5px' : '0')};
`;

export const MessageBubble = styled.div`
    padding: 10px 15px;
    border-radius: 20px;
    max-width: 70%;
    color: ${props => (props.$isMine ? '#fff' : '#212529')};
    background-color: ${props => (props.$isMine ? '#7b5fff' : '#e9ecef')};
    word-wrap: break-word;
`;

export const SystemMessage = styled.div`
    text-align: center;
    color: #868e96;
    font-style: italic;
    font-size: 12px;
    margin: 10px 0;
`;

export const MessageForm = styled.form`
    display: flex;
    padding: 15px;
    border-top: 1px solid #e9ecef;
    background-color: #fff;
`;

export const MessageInput = styled.input`
    flex-grow: 1;
    border: 1px solid #dee2e6;
    border-radius: 20px;
    padding: 10px 15px;
    font-size: 14px;
    outline: none;
    transition: border-color 0.2s ease-in-out;

    &:focus {
        border-color: #7b5fff;
    }
`;

export const SendButton = styled.button`
    ${commonButtonStyle}
    margin-left: 10px;
    background-color: #7b5fff;
    color: #fff;

    &:hover {
        background-color: #6a4fe9;
        color: #fff;
    }
`;