import React from "react";
import {
    MessageOutlined,
    HeartOutlined,
    UserAddOutlined,
    UserSwitchOutlined,
    CalendarOutlined,
    BookOutlined,
    CheckOutlined,
    DeleteOutlined,
    ClockCircleOutlined,
    BellOutlined,
} from "@ant-design/icons";
import {
    NotiPanel,
    NotiHeader,
    NotiTitle,
    NotiButton,
    NotiList,
    NotiEmpty,
    EmptyIcon,
    EmptyText,
    NotiItem,
    ItemMain,
    ItemIcon,
    UnreadDot,
    ItemContent,
    ItemTitle,
    ItemBody,
    ItemTime,
    ItemTail,
    IconButton,
    ButtonContainer,
} from "../../styled_components/left_side_bar/NotificationsPanelStyled.jsx";

const iconByType = (type) => {
    switch (type) {
        case "FOLLOW_REQUEST":
            return <UserAddOutlined />;
        case "FOLLOW_ACCEPTED":
            return <UserSwitchOutlined />;
        case "COMMENT_CREATED":
            return <MessageOutlined />;
        case "LIKE_CREATED":
            return <HeartOutlined />;
        case "FRIEND_POST_CREATED":
            return <BookOutlined />;
        case "SCHEDULE_DAILY_SUMMARY":
            return <CalendarOutlined />;
        case "DIARY_REMINDER":
            return <BellOutlined />;
        case "FOLLOW_JOURNAL_CREATED": // Add this case
            return <BookOutlined />;
        default:
            return <BellOutlined />;
    }
};

const formatTime = (isoString) => {
    const now = new Date();
    const notiDate = new Date(isoString);
    const diffMs = now - notiDate;
    const diffSec = Math.round(diffMs / 1000);
    const diffMin = Math.round(diffSec / 60);
    const diffHour = Math.round(diffMin / 60);

    if (diffSec < 60) return `${diffSec}s ago`;
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHour < 24) return `${diffHour}h ago`;

    return notiDate.toLocaleDateString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    });
};

export default function NotificationsPanel({
   items = [],
   onMarkAllRead,
   onDeleteAll,
   onItemClick, // ✅ 전체 아이템 클릭 핸들러
   onItemRead,
   onItemDelete,
}) {
    const hasItems = items && items.length > 0;

    return (
        <NotiPanel>
            <NotiHeader>
                <NotiTitle>Notifications</NotiTitle>
            </NotiHeader>

            <ButtonContainer>
                <NotiButton onClick={onMarkAllRead}>Mark all as read</NotiButton>
                <NotiButton onClick={onDeleteAll}>Delete all</NotiButton>
            </ButtonContainer>

            {!hasItems ? (
                <NotiEmpty>
                    <EmptyIcon />
                    <EmptyText>No new notifications.</EmptyText>
                </NotiEmpty>
            ) : (
                <NotiList role="list">
                    {items.map((it) => {
                        const unread = it.status === "NEW";
                        return (
                            <NotiItem key={it.id} $unread={unread} role="listitem">
                                <ItemMain
                                    onClick={() => onItemClick && onItemClick(it)}
                                >
                                    <ItemIcon>
                                        {iconByType(it.type)}
                                        {unread && <UnreadDot aria-label="New notification" />}
                                    </ItemIcon>

                                    <ItemContent>
                                        <ItemTitle>{it.title}</ItemTitle>
                                        {it.body && <ItemBody>{it.body}</ItemBody>}
                                        <ItemTime>
                                            <ClockCircleOutlined />
                                            <span>{formatTime(it.createdAt)}</span>
                                        </ItemTime>
                                    </ItemContent>
                                </ItemMain>

                                <ItemTail>
                                    {unread && (
                                        <IconButton
                                            type="button"
                                            aria-label="Mark as read"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                onItemRead && onItemRead(it.id);
                                            }}
                                        >
                                            <CheckOutlined />
                                        </IconButton>
                                    )}
                                    <IconButton
                                        type="button"
                                        aria-label="Delete"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            onItemDelete && onItemDelete(it.id);
                                        }}
                                    >
                                        <DeleteOutlined />
                                    </IconButton>
                                </ItemTail>
                            </NotiItem>
                        );
                    })}
                </NotiList>
            )}
        </NotiPanel>
    );
}
