import { createContext, useContext, useState, useMemo, useCallback, useEffect } from "react";
import { api } from "../api"; // axios 대신 우리가 만든 api 인스턴스를 가져옵니다.
import { useAuth } from "../AuthContext.jsx";

const ScheduleContext = createContext(null);

export const useSchedule = () => {
    const context = useContext(ScheduleContext);
    if (!context) {
        throw new Error("useSchedule must be used within a ScheduleProvider");
    }
    return context;
};

export function ScheduleProvider({ children }) {
    const { user } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [selectedInfo, setSelectedInfo] = useState(null);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const formatEventForCalendar = (event) => {
        const isAllDayEvent = event.isAllDay ||
            (event.startTime?.endsWith('T00:00:00') && event.endTime?.endsWith('T23:59:59'));

        const commonProps = {
            id: event.id,
            title: event.title,
            allDay: isAllDayEvent,
            extendedProps: {
                description: event.description,
                location: event.location,
                tagId: event.tagId, // tagId를 extendedProps에 추가
                calendarId: event.calendarId,
                rrule: event.rrule,
            },
        };

        if (isAllDayEvent) {
            const endDateStr = event.endTime.split('T')[0];
            const parts = endDateStr.split('-').map(Number);
            const exclusiveEndDate = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
            exclusiveEndDate.setUTCDate(exclusiveEndDate.getUTCDate() + 1);

            return {
                ...commonProps,
                start: event.startTime.split('T')[0],
                end: exclusiveEndDate.toISOString().split('T')[0],
            };
        }

        return { ...commonProps, start: event.startTime, end: event.endTime };
    };

    const formatDateTimeForBackend = (dateTime, isAllDay = false, isEnd = false) => {
        if (!dateTime) return null;
        if (dateTime instanceof Date) {
            if (isNaN(dateTime.getTime())) return null;
            let dateToFormat = dateTime;
            if (isAllDay && isEnd) {
                const inclusiveEndDate = new Date(dateToFormat.getTime());
                inclusiveEndDate.setDate(inclusiveEndDate.getDate() - 1);
                dateToFormat = inclusiveEndDate;
            }
            const pad = (num) => String(num).padStart(2, '0');
            const year = dateToFormat.getFullYear();
            const month = pad(dateToFormat.getMonth() + 1);
            const day = pad(dateToFormat.getDate());
            if (isAllDay) {
                const time = isEnd ? '23:59:59' : '00:00:00';
                return `${year}-${month}-${day}T${time}`;
            }
            const hours = pad(dateToFormat.getHours());
            const minutes = pad(dateToFormat.getMinutes());
            const seconds = pad(dateToFormat.getSeconds());
            return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
        }
        if (typeof dateTime === 'string') {
            const datePart = dateTime.split('T')[0];
            if (isAllDay) {
                return isEnd ? `${datePart}T23:59:59` : `${datePart}T00:00:00`;
            }
            if (dateTime.length === 16) return `${dateTime}:00`;
            return dateTime;
        }
        return null;
    };

    // ✅ 태그 ID를 인자로 받아 스케줄을 로드하는 핵심 함수
    const fetchSchedulesByTags = useCallback(async (tagIds = []) => {
        if (!user) {
            setEvents([]);
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            let url = '/api/schedules';
            // tagIds 배열이 비어있지 않으면 쿼리 파라미터를 추가합니다.
            if (tagIds && tagIds.length > 0) {
                const params = new URLSearchParams();
                params.append('tagIds', tagIds.join(',')); // tagIds : 4,7
                url += `?${params.toString()}`;
            }
            console.log(tagIds)
            const response = await api.get(url);
            const formattedEvents = response.data.map(formatEventForCalendar);
            console.log(formattedEvents)
            setEvents(formattedEvents);
            setError(null);
        } catch (err) {
            console.error("일정 로딩 실패:", err);
            setError(err);
        } finally {
            setLoading(false);
        }
    }, [user]); // user가 바뀔 때마다 이 함수를 재생성합니다.

    // 사용자 정보가 변경될 때, 필터링 없이 전체 일정을 로드합니다.
    useEffect(() => {
        fetchSchedulesByTags();
    }, [fetchSchedulesByTags]);


    const addEvent = useCallback(async (eventData) => {
        if (!user) return;
        const requestData = {
            calendarId: eventData.extendedProps.calendarId || 1,
            title: eventData.title,
            location: eventData.extendedProps.location,
            tagId: eventData.extendedProps.tagId, // tagId 추가
            description: eventData.extendedProps.description,
            startTime: formatDateTimeForBackend(eventData.start, eventData.allDay, false),
            endTime: formatDateTimeForBackend(eventData.end, eventData.allDay, true),
            isAllDay: eventData.allDay,
            rrule: eventData.extendedProps.rrule,
        };
        try {
            const response = await api.post("/api/schedules", requestData);
            const newEvent = formatEventForCalendar(response.data);
            setEvents(prev => [...prev, newEvent]);
        } catch (err) {
            console.error("일정 생성 실패:", err);
        }
    }, [user]);

    const updateEvent = useCallback(async (eventData) => {
        const requestData = {
            calendarId: eventData.extendedProps.calendarId,
            title: eventData.title,
            location: eventData.extendedProps.location,
            tagId: eventData.extendedProps.tagId, // tagId 추가
            description: eventData.extendedProps.description,
            startTime: formatDateTimeForBackend(eventData.start, eventData.allDay, false),
            endTime: formatDateTimeForBackend(eventData.end || eventData.start, eventData.allDay, true),
            isAllDay: eventData.allDay,
            rrule: eventData.extendedProps.rrule,
        };
        try {
            const response = await api.put(`/api/schedules/${eventData.id}`, requestData);
            const updatedEvent = formatEventForCalendar(response.data);
            setEvents(prev => prev.map(e => e.id === updatedEvent.id ? updatedEvent : e));
        } catch (err) {
            console.error("일정 업데이트 실패:", err);
        }
    }, []);

    const deleteEvent = useCallback(async (eventId) => {
        try {
            await api.delete(`/api/schedules/${eventId}`);
            setEvents(prev => prev.filter(e => e.id !== eventId));
        } catch (err) {
            console.error("일정 삭제 실패:", err);
        }
    }, []);

    const openSidebarForDate = useCallback((dateInfo) => {
        setSelectedInfo({ type: "list_for_date", data: dateInfo });
        setIsSidebarOpen(true);
    }, []);

    const openSidebarForNew = useCallback((dateInfo) => {
        setSelectedInfo({ type: "new", data: dateInfo });
        setIsSidebarOpen(true);
    }, []);

    const openSidebarForDetail = useCallback((event) => {
        setSelectedInfo({ type: "detail", data: event });
        setIsSidebarOpen(true);
    }, []);

    const closeSidebar = useCallback(() => {
        setIsSidebarOpen(false);
        setSelectedInfo(null);
    }, []);

    const value = useMemo(() => ({
        isSidebarOpen,
        loading,
        error,
        selectedInfo,
        openSidebarForDate,
        openSidebarForNew,
        openSidebarForDetail,
        closeSidebar,
        events,
        addEvent,
        updateEvent,
        deleteEvent,
        fetchSchedulesByTags, // ✅ 외부로 노출
    }), [isSidebarOpen, loading, error, selectedInfo, events, addEvent, updateEvent, deleteEvent, openSidebarForDate, openSidebarForNew, openSidebarForDetail, closeSidebar, fetchSchedulesByTags]);

    return (
        <ScheduleContext.Provider value={value}>
            {children}
        </ScheduleContext.Provider>
    );
}
