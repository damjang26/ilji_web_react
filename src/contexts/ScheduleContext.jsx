import { createContext, useContext, useState, useMemo, useCallback } from "react";

let eventGuid = 0;
const createEventId = () => {
    return String(eventGuid++);
};

const ScheduleContext = createContext(null);

export const useSchedule = () => {
    const context = useContext(ScheduleContext);
    if (!context) {
        throw new Error("useSchedule must be used within a ScheduleProvider");
    }
    return context;
};

export function ScheduleProvider({ children }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    // 새 일정을 위한 날짜 정보 또는 수정할 기존 이벤트 정보
    const [selectedInfo, setSelectedInfo] = useState(null);

    // ✅ 데이터 상태와 관리 로직을 Context로 이동
    const [events, setEvents] = useState([
        // 'no' 프로퍼티를 제거하고 'id'를 유일한 식별자로 사용합니다.
        { title: "Conference", date: "2025-07-07", id: createEventId() },
        {
            title: "Meeting",
            start: "2025-07-07T10:00:00",
            end: "2025-07-07T11:00:00",
            id: createEventId()
        },
    ]);

    // TODO: 여기에 실제 DB와 연동하는 API 호출 로직을 추가해야 합니다.
    // ✅ 함수들이 불필요하게 재생성되지 않도록 useCallback으로 감싸줍니다.
    const addEvent = useCallback((newEvent) => {
        // FullCalendar가 인식할 수 있도록 고유 ID를 부여합니다.
        const eventWithId = { ...newEvent, id: createEventId() };
        setEvents(prev => [...prev, eventWithId]);
    }, []);

    // id를 기준으로 이벤트를 업데이트합니다. updatedEvent 객체는 반드시 id를 포함해야 합니다.
    const updateEvent = useCallback((updatedEvent) => {
        setEvents(prev => prev.map(e => e.id === updatedEvent.id ? updatedEvent : e));
    }, []);

    // id를 기준으로 이벤트를 삭제합니다.
    const deleteEvent = useCallback(
        (eventId) => {
            setEvents((prev) => prev.filter((e) => e.id !== eventId));
        },
        []
    );

    // ✅ 날짜를 클릭했을 때 목록을 보여주기 위한 새로운 함수
    const openSidebarForDate = useCallback(
        (dateInfo) => {
            setSelectedInfo({ type: "list_for_date", data: dateInfo });
            setIsSidebarOpen(true);
        },
        []
    );

    const openSidebarForDetail = useCallback(
        (event) => {
            setSelectedInfo({ type: "detail", data: event });
            setIsSidebarOpen(true);
        },
        []
    );

    const closeSidebar = useCallback(
        () => {
            setIsSidebarOpen(false);
            setSelectedInfo(null);
        },
        []
    );

    const value = useMemo(() => ({
        isSidebarOpen,
        selectedInfo,
        openSidebarForDate, // openSidebarForNew 대신 이 함수를 사용
        openSidebarForDetail,
        closeSidebar,
        // ✅ 데이터와 함수를 외부로 노출
        events,
        addEvent,
        updateEvent,
        deleteEvent,
    // ✅ events가 변경될 때마다 value를 새로 만들도록 의존성 배열에 추가합니다.
    }), [isSidebarOpen, selectedInfo, events, addEvent, updateEvent, deleteEvent, openSidebarForDate, openSidebarForDetail, closeSidebar]);

    return (
        <ScheduleContext.Provider value={value}>
            {children}
        </ScheduleContext.Provider>
    );
}