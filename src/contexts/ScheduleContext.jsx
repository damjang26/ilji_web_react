/**
 * @file ScheduleContext.jsx
 * @desc 일정 데이터 및 일정 관리와 관련된 UI(사이드바, 팝업 등) 상태를 전역으로 관리합니다.
 *       일정 CRUD 함수들과 UI 컴포넌트를 제어하는 함수들을 제공합니다.
 */
import {
    createContext,
    useContext,
    useState,
    useMemo,
    useCallback,
    useEffect,
} from "react";
import {api} from "../api"; // axios 대신 우리가 만든 api 인스턴스를 가져옵니다.
import {useAuth} from "../AuthContext.jsx";

const ScheduleContext = createContext(null);

export const useSchedule = () => {
    const context = useContext(ScheduleContext);
    if (!context) {
        throw new Error("useSchedule must be used within a ScheduleProvider");
    }
    return context;
};

/**
 * 새 일정을 위한 초기 데이터를 폼 상태로 변환합니다.
 */
const transformInitialDataToFormState = (initialData) => {
    if (!initialData) return null;
    const startDateStr = (initialData.startStr || new Date().toISOString()).split(
        "T"
    )[0];
    let endDateStr = startDateStr;

    if (initialData.endStr) {
        const inclusiveEndDate = new Date(initialData.endStr);
        // 여러 날을 선택한 경우, FullCalendar의 종료일은 다음 날 0시이므로 하루를 빼줍니다.
        if (initialData.startStr !== initialData.endStr) {
            inclusiveEndDate.setDate(inclusiveEndDate.getDate() - 1);
        }
        endDateStr = inclusiveEndDate.toISOString().split("T")[0];
    }

    return {
        title: "",
        location: "",
        tagId: null,
        description: "",
        allDay: initialData.allDay !== undefined ? initialData.allDay : true,
        startDate: startDateStr,
        startTime: "09:00",
        endDate: endDateStr,
        endTime: "10:00",
        calendarId: 1,
    };
};

/**
 * 기존 이벤트 객체를 폼 상태로 변환합니다.
 */
const transformEventToFormState = (event) => {
    if (!event) return null;
    const start = new Date(event.start);
    let inclusiveEnd;
    if (event.allDay && event.end) {
        inclusiveEnd = new Date(event.end);
        inclusiveEnd.setDate(inclusiveEnd.getDate() - 1);
    } else {
        inclusiveEnd = event.end ? new Date(event.end) : new Date(start);
    }
    const toYYYYMMDD = (d) =>
        `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
            d.getDate()
        ).padStart(2, "0")}`;
    const toHHMM = (d) => d.toTimeString().substring(0, 5);

    return {
        id: event.id,
        title: event.title,
        location: event.extendedProps?.location || "",
        tagId: event.extendedProps?.tagId || null,
        description: event.extendedProps?.description || "",
        allDay: event.allDay,
        startDate: toYYYYMMDD(start),
        startTime: event.allDay ? "09:00" : toHHMM(start),
        endDate: toYYYYMMDD(inclusiveEnd),
        endTime: event.allDay ? "10:00" : toHHMM(inclusiveEnd),
        calendarId: event.extendedProps?.calendarId || 1,
    };
};

export function ScheduleProvider({children}) {
    const {user} = useAuth(); // AuthContext에서 사용자 정보 가져오기

    // --- UI 상태 관리 ---
    // 1. 사이드바 상태
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [selectedInfo, setSelectedInfo] = useState(null); // 사이드바에 표시될 데이터

    // 2. 팝업 상태
    const [popupState, setPopupState] = useState({isOpen: false, data: null});

    // --- 데이터 상태 관리 ---
    const [formData, setFormData] = useState(null); // ✅ 폼 데이터 중앙 관리 상태
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 백엔드 데이터를 FullCalendar 형식으로 변환하는 헬퍼 함수
    const formatEventForCalendar = (event) => {
        // ✅ [핵심 수정] 백엔드가 isAllDay 플래그를 false로 잘못 보내더라도,
        // 시간 형식을 보고 '하루 종일' 여부를 다시 판단합니다.
        const isAllDayEvent =
            event.isAllDay ||
            (event.startTime?.endsWith("T00:00:00") &&
                event.endTime?.endsWith("T23:59:59"));

        const commonProps = {
            id: event.id,
            title: event.title,
            // ✅ 위에서 판단한 정확한 값을 사용합니다.
            allDay: isAllDayEvent,
            extendedProps: {
                description: event.description,
                location: event.location,
                tagId: event.tagId, // `tags`가 아닌 `tagId`를 매핑합니다.
                calendarId: event.calendarId,
                rrule: event.rrule,
            },
        };

        // ✅ 위에서 판단한 정확한 값을 기준으로 분기합니다.
        if (isAllDayEvent) {
            // FullCalendar에서 하루 종일 일정의 종료일은 '포함되지 않는(exclusive)' 날짜입니다.
            // 백엔드는 '포함하는(inclusive)' 날짜(예: 8월 2일 23:59)를 저장하므로, 날짜를 하루 더해줍니다.
            // new Date() 생성자의 시간대 오류를 피하기 위해 UTC 기준으로 날짜를 계산합니다.
            const endDateStr = event.endTime.split("T")[0];
            const parts = endDateStr.split("-").map(Number);
            const exclusiveEndDate = new Date(
                Date.UTC(parts[0], parts[1] - 1, parts[2])
            );
            exclusiveEndDate.setUTCDate(exclusiveEndDate.getUTCDate() + 1);

            return {
                ...commonProps,
                start: event.startTime.split("T")[0],
                end: exclusiveEndDate.toISOString().split("T")[0],
            };
        }

        return {...commonProps, start: event.startTime, end: event.endTime};
    };

    /**
     * 날짜/시간 데이터를 백엔드가 요구하는 'YYYY-MM-DDTHH:mm:ss' 형식의 문자열로 변환합니다.
     * 이 함수는 Timezone 변환 문제를 해결하는 핵심입니다.
     * @param {Date|string} dateTime - Date 객체 또는 날짜/시간 문자열
     * @param {boolean} isAllDay - 하루 종일 일정 여부
     * @param {boolean} isEnd - 종료 시간인지 여부 (하루 종일 일정의 시간을 23:59:59로 설정하기 위함)
     * @returns {string|null} 포맷된 날짜/시간 문자열
     */
    const formatDateTimeForBackend = (
        dateTime,
        isAllDay = false,
        isEnd = false
    ) => {
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

            const pad = (num) => String(num).padStart(2, "0");
            const year = dateToFormat.getFullYear();
            const month = pad(dateToFormat.getMonth() + 1);
            const day = pad(dateToFormat.getDate());

            if (isAllDay) {
                const time = isEnd ? "23:59:59" : "00:00:00";
                return `${year}-${month}-${day}T${time}`;
            }

            const hours = pad(dateToFormat.getHours());
            const minutes = pad(dateToFormat.getMinutes());
            const seconds = pad(dateToFormat.getSeconds());
            return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
        }

        // Case 2: Input is already a string (from form submission)
        if (typeof dateTime === "string") {
            const datePart = dateTime.split("T")[0];
            if (isAllDay) {
                return isEnd ? `${datePart}T23:59:59` : `${datePart}T00:00:00`;
            }
            if (dateTime.length === 16) return `${dateTime}:00`; // Append seconds if missing
            return dateTime;
        }
        return null; // Fallback for unexpected types
    };

    // ✅ 태그 ID를 인자로 받아 스케줄을 로드하는 핵심 함수
    const fetchSchedulesByTags = useCallback(
        async (tagIds = []) => {
            if (!user) {
                setEvents([]);
                setLoading(false);
                return;
            }
            setLoading(true);
            try {
                let url = "/api/schedules";
                // tagIds 배열이 비어있지 않으면 쿼리 파라미터를 추가합니다.
                if (tagIds && tagIds.length > 0) {
                    const params = new URLSearchParams();
                    params.append("tagIds", tagIds.join(",")); // tagIds : 4,7
                    url += `?${params.toString()}`;
                }

                const response = await api.get(url);
                const formattedEvents = response.data.map(formatEventForCalendar);

                setEvents(formattedEvents);
                setError(null);
            } catch (err) {
                console.error("일정 로딩 실패:", err);
                setError(err);
            } finally {
                setLoading(false);
            }
        },
        [user]
    ); // user가 바뀔 때마다 이 함수를 재생성합니다.

    // 사용자 정보가 변경될 때, 필터링 없이 전체 일정을 로드합니다.
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

        // 롤백을 대비하여 원래 이벤트 목록을 저장합니다.
        const originalEvents = events;

        // UI를 즉시 업데이트하기 위해 임시 이벤트를 생성합니다.
        // 서버로부터 실제 ID를 받기 전까지 사용할 임시 ID를 부여합니다.
        const tempNewEvent = formatEventForCalendar({
            ...eventData,
            id: `temp-${Date.now()}`,
        });
        setEvents((prev) => [...prev, tempNewEvent]);


        // 프론트엔드 폼 데이터를 백엔드 DTO 형식으로 변환
        const requestData = {
            calendarId: eventData.extendedProps.calendarId || 1,
            title: eventData.title,
            location: eventData.extendedProps.location,
            tagId: eventData.extendedProps.tagId, // tags -> tagId로 수정
            description: eventData.extendedProps.description,
            startTime: formatDateTimeForBackend(
                eventData.start,
                eventData.allDay,
                false
            ),
            endTime: formatDateTimeForBackend(
                eventData.end,
                eventData.allDay,
                true
            ),
            isAllDay: eventData.allDay,
            rrule: eventData.extendedProps.rrule,
        };

        // 백그라운드에서 API 요청을 보냅니다.
        try {
            const response = await api.post("/api/schedules", requestData);
            const realNewEvent = formatEventForCalendar(response.data);

            // 성공 시, 임시 이벤트를 서버로부터 받은 실제 이벤트로 교체합니다.
            setEvents((prev) =>
                prev.map((e) => (e.id === tempNewEvent.id ? realNewEvent : e))
            );

        } catch (err) {
            // 실패 시, UI를 원래 상태로 되돌립니다 (롤백).
            console.error("일정 생성 실패 (롤백 실행):", err);
            setEvents(originalEvents);
            // TODO: 사용자에게 "생성에 실패했습니다"와 같은 알림을 보여주면 더 좋습니다.
        }
    }, [user, events]); // ✅ user와 events를 의존성 배열에 추가

    const updateEvent = useCallback(async (eventData) => {
        // 롤백을 대비하여 원래 이벤트 목록을 저장합니다.
        const originalEvents = events;

        // UI를 즉시 업데이트합니다.
        // eventData는 FullCalendar에서 넘어온 이벤트 객체이므로, 바로 사용하기 전에 포맷팅이 필요할 수 있습니다.
        // 여기서는 formatEventForCalendar가 호환된다고 가정합니다.
        const updatedEvent = formatEventForCalendar(eventData);
        setEvents((prev) =>
            prev.map((e) => (e.id === updatedEvent.id ? updatedEvent : e))
        );

        // 백그라운드에서 API 요청을 보냅니다.
        const requestData = {
            calendarId: eventData.extendedProps.calendarId,
            title: eventData.title,
            location: eventData.extendedProps.location,
            tagId: eventData.extendedProps.tagId, // tags -> tagId로 수정
            description: eventData.extendedProps.description,
            startTime: formatDateTimeForBackend(
                eventData.start,
                eventData.allDay,
                false
            ),
            endTime: formatDateTimeForBackend(
                eventData.end || eventData.start,
                eventData.allDay,
                true
            ),
            isAllDay: eventData.allDay,
            rrule: eventData.extendedProps.rrule,
        };

        try {
            await api.put(
                `/api/schedules/${eventData.id}`,
                requestData
            );
            // 성공 시에는 아무것도 할 필요가 없습니다.
        } catch (err) {
            // 실패 시, UI를 원래 상태로 되돌립니다 (롤백).
            console.error("일정 업데이트 실패 (롤백 실행):", err);
            setEvents(originalEvents);
            // TODO: 사용자에게 "업데이트에 실패했습니다"와 같은 알림을 보여주면 더 좋습니다.
        }
    }, [events]);

    const deleteEvent = useCallback(async (eventId) => {
        // 롤백을 대비하여 원래 이벤트 목록을 저장합니다.
        const originalEvents = events;

        // UI를 즉시 업데이트합니다.
        setEvents((prev) => prev.filter((e) => e.id !== eventId));

        // 백그라운드에서 API 요청을 보냅니다.
        try {
            await api.delete(`/api/schedules/${eventId}`);
            // 성공 시에는 아무것도 할 필요가 없습니다. UI는 이미 업데이트되었습니다.
        } catch (err) {
            // 실패 시, UI를 원래 상태로 되돌립니다 (롤백).
            console.error("일정 삭제 실패 (롤백 실행):", err);
            setEvents(originalEvents);
            // TODO: 사용자에게 "삭제에 실패했습니다"와 같은 알림을 보여주면 더 좋습니다.
        }
    }, [events]);

    // --- UI 제어 함수 ---

    // 사이드바 관련 함수들
    const openSidebarForDate = useCallback((dateInfo) => {

        setSelectedInfo({type: "list_for_date", data: dateInfo});
        setIsSidebarOpen(true);
        setFormData(null); // ✅ 폼 데이터 비우기
    }, []);

    const openSidebarForNew = useCallback((dateInfo) => {
        setSelectedInfo({type: "new", data: dateInfo});
        setIsSidebarOpen(true);
        setFormData(transformInitialDataToFormState(dateInfo)); // ✅ 새 일정 폼 데이터 설정
    }, []);

    const openSidebarForDetail = useCallback((event) => {
        setSelectedInfo({type: "detail", data: event});
        setIsSidebarOpen(true);
        setFormData(null); // ✅ 폼 데이터 비우기
    }, []);

    const openSidebarForEdit = useCallback((event) => {
        setSelectedInfo({type: "edit", data: event});
        setIsSidebarOpen(true);
        setFormData(transformEventToFormState(event)); // ✅ 수정 폼 데이터 설정
    }, []);

    const closeSidebar = useCallback(() => {
        setIsSidebarOpen(false);
        setSelectedInfo(null);
        setFormData(null); // ✅ 사이드바 닫을 때 폼 데이터 비우기
    }, []);

    const toggleSidebar = useCallback(() => {
        setIsSidebarOpen((prev) => !prev);
    }, []);

    // 팝업 관련 함수들
    const openPopup = useCallback((data) => {
        setPopupState({isOpen: true, data});
    }, []);

    const closePopup = useCallback(() => {
        setPopupState({isOpen: false, data: null});
    }, []);

    /**
     * ✅ [신규] 이벤트 상세보기를 위한 통합 함수
     * 사이드바와 팝업을 동시에 '상세보기' 모드로 엽니다.
     * 컴포넌트가 UI 상태를 직접 제어하는 대신, 이 함수를 통해 추상화된 동작을 요청합니다.
     */
    const showEventDetails = useCallback(
        (event, clickInfo) => {
            // 1. 사이드바를 상세 보기 모드로 엽니다.
            openSidebarForDetail(event);

            // 2. 팝업을 열고, 위치 정보를 전달합니다.
            const rect = clickInfo.el.getBoundingClientRect();
            openPopup({
                date: event.startStr.substring(0, 10),
                targetRect: rect,
            });
        },
        [openSidebarForDetail, openPopup]
    );

    /**
     * ✅ [신규] 사이드바에서 '뒤로 가기' 동작을 처리하는 통합 함수
     * 현재 사이드바의 상태(selectedInfo)에 따라 적절한 이전 화면으로 전환합니다.
     * (예: 수정 폼 -> 상세 보기, 상세 보기 -> 목록 보기)
     */
    const goBackInSidebar = useCallback(() => {
        if (!selectedInfo) {
            closeSidebar();
            return;
        }

        const {type, data} = selectedInfo;

        switch (type) {
            case "edit":
                // 수정 폼에서는 해당 이벤트의 상세 보기 화면으로 돌아갑니다.
                openSidebarForDetail(data);
                break;
            case "new":
                // 새 일정 폼에서는 해당 날짜의 목록 보기 화면으로 돌아갑니다.
                openSidebarForDate({startStr: data.startStr});
                break;
            case "detail":
                // 상세 보기에서는 해당 날짜의 목록 보기 화면으로 돌아갑니다.
                const dateStr =
                    data.startStr || (data.start && data.start.substring(0, 10));
                if (dateStr) {
                    openSidebarForDate({startStr: dateStr});
                } else {
                    closeSidebar();
                }
                break;
            default:
                // 그 외의 경우(목록 보기 등)에는 사이드바를 닫습니다.
                closeSidebar();
        }
    }, [selectedInfo, openSidebarForDetail, openSidebarForDate, closeSidebar]);

    const value = useMemo(
        () => ({
            // 데이터
            events,
            loading,
            error,
            formData, // ✅ 공유
            setFormData, // ✅ 공유
            // 사이드바 상태 및 함수
            isSidebarOpen,
            selectedInfo,
            openSidebarForDate,
            openSidebarForNew,
            openSidebarForDetail,
            openSidebarForEdit, // 추가
            closeSidebar,
            toggleSidebar,
            // 팝업 상태 및 함수
            popupState,
            openPopup,
            closePopup,
            showEventDetails, // ✅ 추가
            goBackInSidebar, // ✅ 추가
            // CRUD 함수
            fetchSchedulesByTags, // 추가
            addEvent,
            updateEvent,
            deleteEvent,
        }),
        [
            events,
            loading,
            error,
            formData,
            isSidebarOpen,
            selectedInfo,
            popupState,
            addEvent,
            updateEvent,
            deleteEvent,
            openSidebarForDate,
            openSidebarForNew,
            openSidebarForDetail,
            openSidebarForEdit,
            closeSidebar,
            toggleSidebar,
            openPopup,
            closePopup,
            showEventDetails,
            goBackInSidebar,
            fetchSchedulesByTags, // 추가
        ]
    );

    return (
        <ScheduleContext.Provider value={value}>
            {children}
        </ScheduleContext.Provider>
    );
}
