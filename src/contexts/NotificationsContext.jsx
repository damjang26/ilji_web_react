import React, { createContext, useCallback, useContext, useEffect, useState, useRef } from "react";
import { useAuth } from "../AuthContext.jsx";
import { apiNoti } from "../api.js"; // 알림 전용 axios 인스턴스
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const NotificationsCtx = createContext({
    notifications: [],
    unreadCount: 0,
    loading: true,
    markAllRead: async () => {},
    deleteAll: async () => {},
    markRead: async (id) => {},
    deleteOne: async (id) => {},
});

// API 응답 -> 프론트엔드 아이템 형태로 매핑하는 헬퍼 함수
const mapItem = (n) => ({
    id: n.id,
    type: n.type,
    title: n.title, // Changed from n.messageTitle
    body: n.body,   // Changed from n.messageBody
    linkUrl: n.linkUrl,
    status: n.status,
    createdAt: n.createdAt,
});

export function NotificationsProvider({ children }) {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const stompClientRef = useRef(null);

    // 1. 초기 데이터 로딩 (REST API)
    const loadInitialData = useCallback(async () => {
        if (!user?.id) return;
        setLoading(true);
        try {
            const [listRes, countRes] = await Promise.all([
                apiNoti.get("/notifications?status=ALL&size=50"),
                apiNoti.get("/notifications/unread-count")
            ]);

            const list = listRes.data?.items || [];
            list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

            setNotifications(list.map(mapItem));
            setUnreadCount(countRes.data?.unread || 0);
        } catch (error) {
            console.error("Failed to load notifications:", error);
        } finally {
            setLoading(false);
        }
    }, [user?.id]);

    useEffect(() => {
        loadInitialData();
    }, [loadInitialData]);

    // 2. 웹소켓 연결 (실시간 새 알림 수신)
    useEffect(() => {
        if (!user?.id) return;

        const client = new Client({
            webSocketFactory: () => new SockJS('/ws'),
            reconnectDelay: 5000,
            onConnect: () => {
                client.subscribe(`/topic/notifications/${user.id}`, (message) => {
                    const newNoti = JSON.parse(message.body);
                    const newItem = mapItem(newNoti);
                    // 목록의 맨 위에 새 알림 추가
                    setNotifications(prev => [newItem, ...prev]);
                    // 읽지 않은 카운트 증가
                    setUnreadCount(prev => prev + 1);
                });
            },
            onStompError: (frame) => {
                console.error('Broker reported error: ' + frame.headers['message']);
                console.error('Additional details: ' + frame.body);
            },
        });

        client.activate();
        stompClientRef.current = client;

        return () => {
            client.deactivate();
        };
    }, [user?.id]);
    
    // 3. 상태 동기화를 위한 주기적 unreadCount 폴링 (안전장치)
    useEffect(() => {
        const interval = setInterval(async () => {
            if (!user?.id) return;
            try {
                const res = await apiNoti.get("/notifications/unread-count");
                setUnreadCount(res.data?.unread || 0);
            } catch (error) {
                console.error("Failed to poll unread count:", error);
            }
        }, 60000); // 60초마다 실행

        return () => clearInterval(interval);
    }, [user?.id]);


    // 4. 사용자 액션 핸들러 (읽음/삭제 처리)
    const markAllRead = useCallback(async () => {
        await apiNoti.post("/notifications/mark-all-read");
        setNotifications(prev => prev.map(n => ({ ...n, status: "READ" })));
        setUnreadCount(0);
    }, []);

    const deleteAll = useCallback(async () => {
        await apiNoti.delete("/notifications");
        setNotifications([]);
        setUnreadCount(0);
    }, []);

    // [2025-09-15 Gemini] Refactored to prevent stale state issues.
    // To Rollback: Replace this useCallback with the previous one that had a [notifications] dependency.
    const markRead = useCallback(async (id) => {
        // [DEBUG] Mark item as read
        console.log(`[DEBUG] Notifications: Attempting to mark item ${id} as read.`);

        setNotifications(prevNotifications => {
            // [DEBUG] Log state before update
            console.log(`[DEBUG] Notifications: State before marking ${id} as read`, prevNotifications);
            const itemToUpdate = prevNotifications.find(n => n.id === id);
            if (itemToUpdate && itemToUpdate.status === 'NEW') {
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
            const newNotifications = prevNotifications.map(n => n.id === id ? { ...n, status: "READ" } : n);
            // [DEBUG] Log state after update
            console.log(`[DEBUG] Notifications: State after marking ${id} as read`, newNotifications);
            return newNotifications;
        });
        await apiNoti.post(`/notifications/${id}/read`);
    }, []);

    const deleteOne = useCallback(async (id) => {
        const itemToDelete = notifications.find(n => n.id === id);
        if (itemToDelete && itemToDelete.status === 'NEW') {
            setUnreadCount(prev => Math.max(0, prev - 1));
        }
        setNotifications(prev => prev.filter(n => n.id !== id));
        await apiNoti.delete(`/notifications/${id}`);
    }, [notifications]);

    const value = {
        notifications,
        unreadCount,
        loading,
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