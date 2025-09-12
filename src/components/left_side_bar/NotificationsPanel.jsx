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
    HeaderActions,
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

    if (diffSec < 60) return `${diffSec}초 전`;
    if (diffMin < 60) return `${diffMin}분 전`;
    if (diffHour < 24) return `${diffHour}시간 전`;

    return notiDate.toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    });
};

export default function NotificationsPanel({
   items = [],
   onMarkAllRead,
   onDeleteAll,
   onItemRead,
   onItemDelete,
}) {
    const hasItems = items && items.length > 0;

    return (
        <NotiPanel>
            <NotiHeader>
                <NotiTitle>알림</NotiTitle>
                <HeaderActions>
                    <NotiButton onClick={onMarkAllRead}>전체읽음</NotiButton>
                    <NotiButton onClick={onDeleteAll}>전체삭제</NotiButton>
                </HeaderActions>
            </NotiHeader>

            {!hasItems ? (
                <NotiEmpty>
                    <EmptyIcon />
                    <EmptyText>알림이 없습니다.</EmptyText>
                </NotiEmpty>
            ) : (
                <NotiList role="list">
                    {items.map((it) => {
                        const unread = it.status === "UNREAD";
                        return (
                            <NotiItem key={it.id} unread={unread} role="listitem">
                                <ItemMain href={it.linkUrl || "#"}>
                                    <ItemIcon>
                                        {iconByType(it.type)}
                                        {unread && <UnreadDot aria-label="새 알림" />}
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
                                            aria-label="읽음 처리"
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
                                        aria-label="삭제"
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
