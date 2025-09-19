import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useAuth } from "../AuthContext.jsx";
import { apiNoti } from "../api.js"; // 알림 전용 axios 인스턴스
import { io } from 'socket.io-client';

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
const mapItem = (n) => {
    // 데이터가 비정상적인 경우를 대비한 방어 코드
    if (!n || typeof n !== 'object') {
        return {
            id: Math.random().toString(),
            type: 'ERROR',
            title: 'Invalid notification data received',
            body: '',
            linkUrl: '#',
            status: 'NEW',
            createdAt: new Date().toISOString(),
        };
    }

    return {
        id: n.id, // 백엔드 필드명 `id` 사용
        type: n.type,
        title: n.title || n.message_title || '내용 없는 알림', // `title`과 `message_title` 필드를 모두 지원하여 안정성 확보
        body: n.body || n.message_body || '', // `body`와 `message_body` 필드를 모두 지원
        linkUrl: n.linkUrl, // 백엔드에서 제공하는 `linkUrl` 사용
        status: n.status, // 백엔드 필드명 `status` 사용
        createdAt: n.createdAt,
        entityId: n.entityId, // 라우팅에 필요한 entityId 추가
        entityType: n.entityType, // 타입 구분을 위한 entityType 추가
        // 나머지 메타 데이터도 전달
        ...(n.meta || {}),
    };
};

export function NotificationsProvider({ children }) {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);

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
            setUnreadCount(countRes.data?.count || 0);
        } catch (error) {
            console.error("Failed to load notifications:", error);
        } finally {
            setLoading(false);
        }
    }, [user?.id]);

    useEffect(() => {
        loadInitialData();
    }, [loadInitialData]);

    // 2. 웹소켓 연결 (실시간 새 알림 수신) - Socket.IO
    useEffect(() => {
        if (!user?.id) return;

        // 실제 서버 URL 및 포트로 대체하세요.
        const SOCKET_SERVER_URL = 'http://localhost:9092';
        const socket = io(SOCKET_SERVER_URL);

        socket.on('connect', () => {
            console.log('Socket.IO 서버에 연결되었습니다.');
            // 알림을 위한 사용자별 룸 참여
            socket.emit('join', { userId: user.id });
        });

        socket.on('disconnect', () => {
            console.log('Socket.IO 서버에서 연결이 끊어졌습니다.');
        });

        // 알림 이벤트 수신 대기
        socket.on('notification', (notificationData) => {
            console.log('새 알림 수신:', notificationData);
            const newItem = mapItem(notificationData);
            // 목록의 맨 위에 새 알림 추가
            setNotifications(prev => [newItem, ...prev]);
            // 읽지 않은 카운트 증가
            setUnreadCount(prev => prev + 1);
        });

        socket.on('error', (error) => {
            console.error('Socket.IO 오류:', error);
        });

        return () => {
            console.log('Socket.IO 연결을 해제합니다.');
            socket.disconnect();
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
        try {
            console.log("Attempting to mark all notifications as read...");
            await apiNoti.post("/notifications/mark-all-read");
            console.log("Mark all as read API call successful.");
            setNotifications(prev => prev.map(n => ({ ...n, status: "READ" })));
            setUnreadCount(0);
        } catch (error) {
            console.error("Failed to mark all notifications as read:", error);
            alert("모든 알림을 읽음으로 표시하는 데 실패했습니다.");
        }
    }, []);

    const deleteAll = useCallback(async () => {
        await apiNoti.delete("/notifications");
        setNotifications([]);
        setUnreadCount(0);
    }, []);

    const markRead = useCallback(async (id) => {
        setNotifications(prevNotifications => {
            const itemToUpdate = prevNotifications.find(n => n.id === id);
            if (itemToUpdate && itemToUpdate.status === 'NEW') {
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
            return prevNotifications.map(n => n.id === id ? { ...n, status: "READ" } : n);
        });
        await apiNoti.post(`/notifications/${id}/read`);
    }, []);

    const deleteOne = useCallback(async (id) => {
        setNotifications(prevNotifications => {
            const itemToDelete = prevNotifications.find(n => n.id === id);
            if (itemToDelete && itemToDelete.status === 'NEW') {
                setUnreadCount(prevUnread => Math.max(0, prevUnread - 1));
            }
            return prevNotifications.filter(n => n.id !== id);
        });
        await apiNoti.delete(`/notifications/${id}`);
    }, []);

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