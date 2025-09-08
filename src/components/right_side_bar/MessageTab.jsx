const MessageTab = ({ onShowChatRoom }) => {
    // 부모로부터 받은 onShowChatRoom 함수를 사용합니다.

    return <div>massage tab
        <button onClick={onShowChatRoom}>채팅목록</button>
    </div>

}

export default MessageTab;