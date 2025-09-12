// src/notifications/NotificationsContext.jsx
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

const NotificationsCtx = createContext(null);

export function NotificationsProvider({ children }) {
    const [notifications, setNotifications] = useState(null);
    const [loading, setLoading] = useState(true);

    // API 응답 → 패널 아이템 형태로 매핑
    const mapItem = (n) => ({
        id: n.id,
        type: n.type,                       // "FOLLOW_REQUEST" 등
        title: n.messageTitle,              // message_title
        body: n.messageBody,                // message_body
        linkUrl: n.linkUrl,                 // link_url
        status: n.status,                   // "UNREAD" | "READ"
        createdAt: n.createdAt,             // ISO
    });

    const loadList = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch("/notifications?size=50", { credentials: "include" });
            const data = await res.json(); // { content: [...] } 혹은 배열 — 백엔드 응답에 맞춰 조정
            const list = Array.isArray(data) ? data : (data.content || []);
            // 최신순 보장
            list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setNotifications(list.map(mapItem));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadList(); }, [loadList]);

    const markAllRead = useCallback(async () => {
        await fetch("/notifications/mark-all-read", { method: "POST", credentials: "include" });
        setNotifications((prev) => (prev || []).map((i) => ({ ...i, status: "READ" })));
    }, []);

    const deleteAll = useCallback(async () => {
        await fetch("/notifications", { method: "DELETE", credentials: "include" });
        setNotifications([]);
    }, []);

    const markRead = useCallback(async (id) => {
        await fetch(`/notifications/${id}/read`, { method: "POST", credentials: "include" });
        setNotifications((prev) => (prev || []).map((i) => (i.id === id ? { ...i, status: "READ" } : i)));
    }, []);

    const deleteOne = useCallback(async (id) => {
        await fetch(`/notifications/${id}`, { method: "DELETE", credentials: "include" });
        setNotifications((prev) => (prev || []).filter((i) => i.id !== id));
    }, []);

    const value = {
        notifications: notifications || [],
        loading,
        reload: loadList,
        markAllRead,
        deleteAll,
        markRead,
        deleteOne,
    };

    return <NotificationsCtx.Provider value={value}>{children}</NotificationsCtx.Provider>;
}

export function useNotifications() {
    const ctx = useContext(NotificationsCtx);
    if (!ctx) throw new Error("useNotifications must be used within NotificationsProvider");
    return ctx;
}
