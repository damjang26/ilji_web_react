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
    const formatEventForCalendar = (event) => {
        // ✅ [핵심 수정] 백엔드가 isAllDay 플래그를 false로 잘못 보내더라도,
        // 시간 형식을 보고 '하루 종일' 여부를 다시 판단합니다.
        const isAllDayEvent = event.isAllDay ||
            (event.startTime?.endsWith('T00:00:00') && event.endTime?.endsWith('T23:59:59'));

        const commonProps = {
            id: event.id,
            title: event.title,
            // ✅ 위에서 판단한 정확한 값을 사용합니다.
            allDay: isAllDayEvent,
            extendedProps: {
                description: event.description,
                location: event.location,
                tags: event.tags,
                calendarId: event.calendarId,
                rrule: event.rrule,
            },
        };

        // ✅ 위에서 판단한 정확한 값을 기준으로 분기합니다.
        if (isAllDayEvent) {
            // FullCalendar에서 하루 종일 일정의 종료일은 '포함되지 않는(exclusive)' 날짜입니다.
            // 백엔드는 '포함하는(inclusive)' 날짜(예: 8월 2일 23:59)를 저장하므로, 날짜를 하루 더해줍니다.
            // new Date() 생성자의 시간대 오류를 피하기 위해 UTC 기준으로 날짜를 계산합니다.
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

    /**
     * 날짜/시간 데이터를 백엔드가 요구하는 'YYYY-MM-DDTHH:mm:ss' 형식의 문자열로 변환합니다.
     * 이 함수는 Timezone 변환 문제를 해결하는 핵심입니다.
     * @param {Date|string} dateTime - Date 객체 또는 날짜/시간 문자열
     * @param {boolean} isAllDay - 하루 종일 일정 여부
     * @param {boolean} isEnd - 종료 시간인지 여부 (하루 종일 일정의 시간을 23:59:59로 설정하기 위함)
     * @returns {string|null} 포맷된 날짜/시간 문자열
     */
    const formatDateTimeForBackend = (dateTime, isAllDay = false, isEnd = false) => {
        if (!dateTime) return null;

        // Case 1: Input is a Date object (from drag/drop or resize)
        // We manually build the string from local components to avoid UTC conversion.
        if (dateTime instanceof Date) {
            if (isNaN(dateTime.getTime())) return null;

            let dateToFormat = dateTime;
            // ✅ [핵심 수정] '하루 종일' 일정을 드래그/리사이즈한 경우,
            // FullCalendar의 '포함되지 않는(exclusive)' 종료일을 백엔드가 요구하는
            // '포함하는(inclusive)' 종료일로 변환합니다. (하루 빼기)
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

        // Case 2: Input is already a string (from form submission)
        if (typeof dateTime === 'string') {
            const datePart = dateTime.split('T')[0];
            if (isAllDay) {
                return isEnd ? `${datePart}T23:59:59` : `${datePart}T00:00:00`;
            }
            if (dateTime.length === 16) return `${dateTime}:00`; // Append seconds if missing
            return dateTime;
        }
        return null; // Fallback for unexpected types
    };

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
                // 백엔드가 토큰에서 사용자 정보를 얻으므로 URL에 ID를 포함할 필요가 없습니다.
                const response = await api.get(`/api/schedules`);
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
            calendarId: eventData.extendedProps.calendarId || 1,
            title: eventData.title,
            location: eventData.extendedProps.location,
            tags: eventData.extendedProps.tags,
            description: eventData.extendedProps.description,
            // ✅ 새로운 헬퍼 함수를 사용하여 시간을 안전하게 포맷합니다.
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
            // ✅ 새로운 헬퍼 함수를 사용하여 시간을 안전하게 포맷합니다.
            startTime: formatDateTimeForBackend(eventData.start, eventData.allDay, false),
            // 드래그앤드롭 시 end가 null일 수 있으므로 start로 대체합니다.
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