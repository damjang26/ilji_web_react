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
    const { user } = useAuth(); // AuthContext에서 사용자 정보 가져오기
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    // 새 일정을 위한 날짜 정보 또는 수정할 기존 이벤트 정보
    const [selectedInfo, setSelectedInfo] = useState(null);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 백엔드 데이터를 FullCalendar 형식으로 변환하는 헬퍼 함수
    const formatEventForCalendar = (event) => ({
        id: event.id,
        title: event.title,
        start: event.startTime,
        end: event.endTime,
        allDay: event.isAllDay,
        extendedProps: {
            description: event.description,
            location: event.location,
            tags: event.tags,
            calendarId: event.calendarId,
            rrule: event.rrule,
        },
    });

    // 사용자 정보(user)가 변경될 때마다 데이터 다시 로드
    useEffect(() => {
        const fetchSchedules = async () => {
            // 로그인한 사용자가 없으면, 스케줄 요청을 보내지 않고 기존 데이터를 비웁니다.
            if (!user) {
                setEvents([]);
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
                // 로그인한 사용자의 ID를 사용하여 스케줄을 요청합니다.
                const response = await api.get(`/api/schedules/user/${user.id}`);
                const formattedEvents = response.data.map(formatEventForCalendar);
                setEvents(formattedEvents);
                setError(null);
            } catch (err) {
                console.error("일정 로딩 실패:", err);
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchSchedules();
    }, [user]); // user 객체가 변경될 때마다 이 useEffect 훅을 다시 실행합니다.


    const addEvent = useCallback(async (eventData) => {
        if (!user) return; // 사용자가 없으면 함수 실행 중단

        // 프론트엔드 폼 데이터를 백엔드 DTO 형식으로 변환
        const requestData = {
            userId: user.id, // ✅ 실제 사용자 ID로 교체
            calendarId: eventData.extendedProps.calendarId || 1, // 기본 캘린더 ID
            title: eventData.title,
            location: eventData.extendedProps.location,
            tags: eventData.extendedProps.tags,
            description: eventData.extendedProps.description,
            // 폼에서 '하루 종일' 선택 시 'T'가 없는 날짜 문자열이 오므로,
            // 백엔드(LocalDateTime)가 파싱할 수 있도록 시간을 붙여줍니다.
            startTime: (typeof eventData.start === 'string' && !eventData.start.includes('T'))
                ? `${eventData.start}T00:00:00`
                : eventData.start,
            endTime: (typeof eventData.end === 'string' && !eventData.end.includes('T'))
                ? `${eventData.end}T23:59:59`
                : eventData.end,
            isAllDay: eventData.allDay,
            rrule: eventData.extendedProps.rrule,
        };
        try {
            const response = await api.post("/api/schedules", requestData);
            const newEvent = formatEventForCalendar(response.data);
            setEvents(prev => [...prev, newEvent]);
        } catch (err) {
            console.error("일정 생성 실패:", err);
            // TODO: 사용자에게 에러 알림
        }
    }, [user]); // ✅ user를 의존성 배열에 추가

    const updateEvent = useCallback(async (eventData) => {
        const requestData = {
            calendarId: eventData.extendedProps.calendarId,
            title: eventData.title,
            location: eventData.extendedProps.location,
            tags: eventData.extendedProps.tags,
            description: eventData.extendedProps.description,
            // 드래그앤드롭(Date 객체)과 폼 수정(문자열) 모두 처리합니다.
            // end가 null일 수 있는 드래그앤드롭을 대비해 eventData.start로 대체합니다.
            startTime: (typeof eventData.start === 'string' && !eventData.start.includes('T'))
                ? `${eventData.start}T00:00:00`
                : eventData.start,
            endTime: (typeof (eventData.end || eventData.start) === 'string' && !(eventData.end || eventData.start).includes('T'))
                ? `${(eventData.end || eventData.start)}T23:59:59`
                : (eventData.end || eventData.start),
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
        loading,
        error,
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
    }), [isSidebarOpen, loading, error, selectedInfo, events, addEvent, updateEvent, deleteEvent, openSidebarForDate, openSidebarForDetail, closeSidebar]);

    return (
        <ScheduleContext.Provider value={value}>
            {children}
        </ScheduleContext.Provider>
    );
}