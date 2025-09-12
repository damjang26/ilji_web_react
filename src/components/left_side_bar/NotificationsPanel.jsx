// NotificationsPanel.jsx
import React from "react";
import {
    BellOutlined,
    MessageOutlined,
    HeartOutlined,
    UserAddOutlined,
    UserSwitchOutlined,
    CalendarOutlined,
    BookOutlined,
    CheckOutlined,
    DeleteOutlined,
    ClockCircleOutlined,
} from "@ant-design/icons";

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

/**
 * props:
 * - items: [{ id, type, title, body, linkUrl, status('UNREAD'|'READ'), createdAt(ISO) }]
 * - onMarkAllRead, onDeleteAll, onItemRead(id), onItemDelete(id)
 */
export default function NotificationsPanel({
                                               items = [],
                                               onMarkAllRead,
                                               onDeleteAll,
                                               onItemRead,
                                               onItemDelete,
                                           }) {
    const hasItems = items && items.length > 0;

    return (
        <div className="noti-panel">
            {/* Header */}
            <div className="noti-panel__header">
                <h2 className="noti-panel__title">알림</h2>
                <div className="noti-panel__header-actions">
                    <button
                        className="noti-btn noti-btn--markall"
                        type="button"
                        onClick={onMarkAllRead}
                    >
                        전체읽음
                    </button>
                    <button
                        className="noti-btn noti-btn--deleteall"
                        type="button"
                        onClick={onDeleteAll}
                    >
                        전체삭제
                    </button>
                </div>
            </div>

            {/* List / Empty */}
            {!hasItems ? (
                <div className="noti-panel__empty">
                    <BellOutlined className="noti-empty__icon" />
                    <p className="noti-empty__text">알림이 없습니다.</p>
                </div>
            ) : (
                <div className="noti-panel__list" role="list">
                    {items.map((it) => {
                        const unread = it.status === "UNREAD";
                        return (
                            <div
                                key={it.id}
                                className={`noti-item ${unread ? "is-unread" : ""}`}
                                role="listitem"
                            >
                                <a
                                    className="noti-item__main"
                                    href={it.linkUrl || "#"}
                                    // 링크 이동만, 추가 로직은 필요 시 onClick으로
                                >
                                    <div className="noti-item__icon">
                                        {iconByType(it.type)}
                                        {unread && (
                                            <span
                                                className="noti-item__dot"
                                                aria-label="새 알림"
                                            />
                                        )}
                                    </div>

                                    <div className="noti-item__content">
                                        <div className="noti-item__title">{it.title}</div>
                                        {it.body ? (
                                            <div className="noti-item__body">{it.body}</div>
                                        ) : null}

                                        <div className="noti-item__time">
                                            <ClockCircleOutlined className="noti-time__icon" />
                                            {/* 날짜 표시는 스타일/스크립트에서 포맷팅 하세요 */}
                                            <span className="noti-time__label" data-iso={it.createdAt}>
                        {/* 예: '3시간 전' 또는 '2025.09.12 09:30' */}
                      </span>
                                        </div>
                                    </div>
                                </a>

                                <div className="noti-item__tail">
                                    <button
                                        className="icon-btn icon-btn--read"
                                        type="button"
                                        aria-label="읽음 처리"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            onItemRead && onItemRead(it.id);
                                        }}
                                    >
                                        <CheckOutlined />
                                    </button>
                                    <button
                                        className="icon-btn icon-btn--delete"
                                        type="button"
                                        aria-label="삭제"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            onItemDelete && onItemDelete(it.id);
                                        }}
                                    >
                                        <DeleteOutlined />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
