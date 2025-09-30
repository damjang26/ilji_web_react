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
import styled from "styled-components";
import {api} from "../api"; // axios 대신 우리가 만든 api 인스턴스를 가져옵니다.
import ConfirmModal from "../components/common/ConfirmModal.jsx";
import {useAuth} from "../AuthContext.jsx";
import {NO_TAG_ID} from "./TagContext.jsx";

import {parseRruleString} from "../utils/rrule-parser.js";

const ModalWrapper = styled.div`
    /*
      z-index를 명시적으로 관리하여 모달이 다른 UI 요소(팝업 등) 위에
      안정적으로 표시되도록 합니다.
    */
    position: relative;
    z-index: 1200; /* 팝업(1100) 및 다른 antd 컴포넌트(기본 1000)보다 높게 설정 */
`;

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
const transformInitialDataToFormState = (initialData, user) => {
    if (!initialData) return null;

    const isAllDay = initialData.allDay;
    const start = new Date(initialData.startStr);
    const end = new Date(initialData.endStr);

    const toYYYYMMDD = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const toHHMM = (d) => d.toTimeString().substring(0, 5);

    let endDateForInput = end;
    // allDay:true 이면서 여러 날을 드래그한 경우, FullCalendar의 종료일은 exclusive이므로 하루를 빼줍니다.
    if (isAllDay && initialData.startStr.split('T')[0] !== initialData.endStr.split('T')[0]) {
        endDateForInput = new Date(end.getTime() - (1000 * 3600 * 24));
    }

    return {
        title: "",
        location: "",
        tagId: null,
        description: "",
        allDay: isAllDay,
        startDate: toYYYYMMDD(start),
        startTime: isAllDay ? "09:00" : toHHMM(start),
        endDate: toYYYYMMDD(endDateForInput),
        endTime: isAllDay ? "10:00" : toHHMM(end),
        calendarId: user ? user.id : 1, // ✅ 반복 규칙 필드 초기화
    };
};

/**
 * 기존 이벤트 객체를 폼 상태로 변환합니다.
 */
const transformEventToFormState = (event) => {
    console.log("--- transformEventToFormState START ---");
    console.log("1. Raw event object received:", event);

    if (!event) return null;

    const plainEvent = typeof event.toPlainObject === 'function' ? event.toPlainObject() : event;
    console.log("2. plainEvent (after toPlainObject):", plainEvent);

    // 1. FIX RRULE DELETION BUG: Robustly parse rrule
    let rruleValue = "";
    try {
        const rruleSet = event._def?.recurringDef?.typeData?.rruleSet;
        const mainRruleObject = rruleSet?._rrule?.[0];
        if (mainRruleObject && typeof mainRruleObject.toString === 'function') {
            rruleValue = mainRruleObject.toString();
        } else if (typeof plainEvent.rrule === 'string') {
            rruleValue = plainEvent.rrule;
        }
    } catch {
        rruleValue = typeof plainEvent.rrule === 'string' ? plainEvent.rrule : '';
    }
    if (rruleValue.startsWith('RRULE:')) {
        rruleValue = rruleValue.replace(/^RRULE:/, '');
    }
    console.log("2.1. Parsed rruleValue:", rruleValue);

    // 2. FIX TIMED & ALL-DAY BUGS: Correctly determine end date
    const start = new Date(event.start);
    let end;
    if (event._instance?.range?.end) {
        end = new Date(event._instance.range.end);
    } else {
        end = event.end ? new Date(event.end) : new Date(start);
    }
    console.log("3. Parsed Date objects:", { start, end });

    let formEndDate = end;
    if (rruleValue && plainEvent.allDay) {
        formEndDate = new Date(start);
    } else if (plainEvent.allDay && event.end) {
        if (start.toISOString().split('T')[0] !== end.toISOString().split('T')[0]) {
            formEndDate = new Date(end.getTime() - (1000 * 3600 * 24));
        }
    }

    // 3. FIX TIME SHIFT BUG: Use getHours/getMinutes for timezone-safe time string
    const pad = (num) => String(num).padStart(2, "0");
    const toYYYYMMDD = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    const toHHMM = (d) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;

    const result = {
        id: plainEvent.id,
        title: plainEvent.title,
        location: plainEvent.extendedProps?.location || "",
        tagId: plainEvent.extendedProps?.tagId || null,
        description: plainEvent.extendedProps?.description || "",
        allDay: plainEvent.allDay,
        startDate: toYYYYMMDD(start),
        startTime: plainEvent.allDay ? "09:00" : toHHMM(start),
        endDate: toYYYYMMDD(formEndDate),
        endTime: plainEvent.allDay ? "10:00" : toHHMM(end),
        calendarId: plainEvent.extendedProps?.calendarId || 1,
        rrule: rruleValue,
    };

    console.log("4. Final returned object for form:", result);
    console.log("--- transformEventToFormState END ---");

    return result;
};
export function ScheduleProvider({children}) {
    const {user} = useAuth(); // AuthContext에서 사용자 정보 가져오기

    // --- UI 상태 관리 ---
    const [selectedInfo, setSelectedInfo] = useState(null); // 사이드바에 표시될 데이터

    // 2. 팝업 상태
    const [popupState, setPopupState] = useState({isOpen: false, data: null});

    // 3. 스케줄 상세/생성/수정을 위한 모달 상태
    const [scheduleModalData, setScheduleModalData] = useState({
        isOpen: false,
        position: null,
        dateInfo: null,
        title: '',
        view: 'list', // 'list' 또는 'form'
        initialEvent: null, // 모달이 열릴 때 표시할 초기 이벤트
    });

    // --- 데이터 상태 관리 ---
    const [formData, setFormData] = useState(null); // ✅ 폼 데이터 중앙 관리 상태
    const [events, setEvents] = useState([]);
    const [cachedEvents, setCachedEvents] = useState([]); // 옵티미스틱 업데이트를 위한 캐시
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // ✅ [신규] 삭제 확인 모달 상태를 Context로 이동하여 전역으로 관리합니다.
    const [deleteModalState, setDeleteModalState] = useState({
        isOpen: false,
        eventId: null,
    });

    // 백엔드 데이터를 FullCalendar 형식으로 변환하는 헬퍼 함수
    const formatEventForCalendar = (event) => {
        const isAllDayEvent =
            event.isAllDay ||
            (event.startTime?.endsWith("00:00:00") &&
                event.endTime?.endsWith("23:59:59"));

        const commonProps = {
            id: event.id,
            title: event.title,
            allDay: isAllDayEvent,
            extendedProps: {
                description: event.description,
                location: event.location,
                tagId: event.tagId || NO_TAG_ID,
                calendarId: event.calendarId,
            },
        };

        // Case 1: Recurring event (rrule is present and valid)
        if (event.rrule && event.rrule.includes('FREQ')) {
            const rruleObject = parseRruleString(event.rrule);

            rruleObject.dtstart = isAllDayEvent ? event.startTime.split('T')[0] : event.startTime;

            if (!isAllDayEvent) {
                const start = new Date(event.startTime);
                const end = new Date(event.endTime);
                const durationMs = end.getTime() - start.getTime();
                const duration = {
                    hours: Math.floor(durationMs / 3600000),
                    minutes: Math.floor((durationMs % 3600000) / 60000)
                };
                return {
                    ...commonProps,
                    start: rruleObject.dtstart, // Add start property
                    rrule: rruleObject,
                    duration,
                };
            }

            return {
                ...commonProps,
                start: rruleObject.dtstart, // Add start property
                rrule: rruleObject,
            };
        }

        // Case 2: Non-recurring all-day event
        if (isAllDayEvent) {
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

        // Case 3: Non-recurring timed event
        return {
            ...commonProps,
            start: event.startTime,
            end: event.endTime
        };
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
        async (tagIds = [], options = {}) => {
            const { showLoading = true } = options;
            // console.log(`[DEBUG] fetchSchedulesByTags 호출됨. tagIds: ${tagIds}, showLoading: ${showLoading}`);

            if (!user) {
                setEvents([]);
                if (showLoading) setLoading(false);
                return;
            }

            if (showLoading) setLoading(true);

            try {
                if (tagIds && tagIds.length > 0) {
                    const params = new URLSearchParams();
                    const apiTagIds = tagIds.map(id => id === NO_TAG_ID ? 'null' : id);
                    params.append("tagIds", apiTagIds.join(","));
                    const url = `/api/schedules?${params.toString()}`;
                    const response = await api.get(url);
                    const formattedEvents = response.data.map(formatEventForCalendar);

                    // Sort events by start time, then by title
                    formattedEvents.sort((a, b) => {
                        const startA = new Date(a.start).getTime();
                        const startB = new Date(b.start).getTime();
                        if (startA !== startB) {
                            return startA - startB;
                        }
                        return a.title.localeCompare(b.title);
                    });

                    setEvents(formattedEvents);
                    setCachedEvents(formattedEvents); // 캐시 업데이트
                    setError(null);
                } else {
                    setEvents([]);
                    setError(null);
                }
            } catch (err) {
                console.error("일정 로딩 실패:", err);
                setError(err);
            } finally {
                if (showLoading) setLoading(false);
            }
        },
        [user]
    ); // user가 바뀔 때마다 이 함수를 재생성합니다.

    useEffect(() => {
        if (!user) {
            setEvents([]);
            setCachedEvents([]);
            setLoading(false);
        }
    }, [user]);

    const addEvent = useCallback(
        async (eventData) => {
            if (!user) return; // 사용자가 없으면 함수 실행 중단

            // 롤백을 대비하여 원래 이벤트 목록을 저장합니다.
            const originalEvents = events;

            // UI를 즉시 업데이트하기 위해 임시 이벤트를 생성합니다.
            // 서버로부터 실제 ID를 받기 전까지 사용할 임시 ID를 부여합니다.
            const tempNewEvent = {
                ...eventData,
                id: `temp-${Date.now()}`,
            };
            setEvents((prev) => [...prev, tempNewEvent]);

            // 프론트엔드 폼 데이터를 백엔드 DTO 형식으로 변환
            const requestData = {
                calendarId: eventData.extendedProps.calendarId || 1,
                title: eventData.title,
                location: eventData.extendedProps.location,
                tagId: eventData.extendedProps.tagId === NO_TAG_ID ? null : eventData.extendedProps.tagId, // tags -> tagId로 수정
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
                // ✅ [버그 수정] rrule은 최상위 속성이므로 eventData.rrule에서 가져옵니다.
                rrule: eventData.rrule || null, // Explicitly send null for empty strings
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
        },
        [user, events]
    ); // ✅ user와 events를 의존성 배열에 추가

    const updateEvent = useCallback(
        async (eventData) => {
            const eventToUpdate = events.find(e => String(e.id) === String(eventData.id));
            if (eventToUpdate && eventToUpdate.extendedProps.calendarId !== user.id) {
                message.error('자신이 생성한 일정만 수정할 수 있습니다.');
                return;
            }

            try {
                const requestData = {
                    calendarId: eventData.extendedProps.calendarId,
                    title: eventData.title,
                    location: eventData.extendedProps.location,
                    tagId: eventData.extendedProps.tagId === NO_TAG_ID ? null : eventData.extendedProps.tagId,
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
                    rrule: eventData.rrule || null, // Explicitly send null for empty strings
                };
                const response = await api.put(`/api/schedules/${eventData.id}`, requestData);
                const updatedEvent = formatEventForCalendar(response.data);
                setEvents(prev => prev.map(e => (String(e.id) === String(updatedEvent.id) ? updatedEvent : e)));
            } catch (err) {
                console.error("일정 업데이트 실패:", err);
            }
        },
        [events, user]
    );

    const deleteEvent = useCallback(async (eventId) => {
        const eventToDelete = events.find(e => String(e.id) === String(eventId));
        if (eventToDelete && eventToDelete.extendedProps.calendarId !== user.id) {
            message.error('자신이 생성한 일정만 삭제할 수 있습니다.');
            return;
        }

        try {
            setEvents((prev) => prev.filter((e) => String(e.id) !== String(eventId)));
            await api.delete(`/api/schedules/${eventId}`);
        } catch (err) {
            console.error("일정 삭제 실패:", err);
        }
    }, [events, user]);
    // --- UI 제어 함수 ---

    const openSchedulePanelForDate = useCallback((dateInfo) => {
        setSelectedInfo({type: "list_for_date", data: dateInfo});
        setFormData(null); // ✅ 폼 데이터 비우기
    }, []);

    const openSchedulePanelForNew = useCallback((dateInfo) => {
        setSelectedInfo({type: "new", data: dateInfo});
        setFormData(transformInitialDataToFormState(dateInfo, user)); // ✅ 새 일정 폼 데이터 설정
    }, [user]);

    const openSchedulePanelForDetail = useCallback((event) => {
        // FullCalendar의 EventApi 객체일 경우에만 toPlainObject()를 사용하고,
        // 이미 일반 JavaScript 객체일 경우 그대로 사용합니다.
        const plainEvent = typeof event.toPlainObject === 'function' ? event.toPlainObject() : event;
        setSelectedInfo({type: "detail", data: plainEvent});
        setFormData(null); // ✅ 폼 데이터 비우기
    }, []);

    const openSchedulePanelForEdit = useCallback((event) => {
        setSelectedInfo({type: "edit", data: event});
        setFormData(transformEventToFormState(event)); // ✅ 수정 폼 데이터 설정
    }, []);

    const openSchedulePanelForRRule = useCallback(() => {
        // 현재 폼 데이터를 유지하면서, 뷰 타입만 변경합니다.
        setSelectedInfo(prev => ({ ...prev, type: 'rrule_form' }));
    }, []);

    const clearScheduleSelection = useCallback(() => {
        setSelectedInfo(null);
        setFormData(null);
    }, []);

    // 팝업 관련 함수들
    const openPopup = useCallback((data) => {
        setPopupState({isOpen: true, data});
    }, []);

    const closePopup = useCallback(() => {
        setPopupState({isOpen: false, data: null});
    }, []);

    // 스케줄 모달 관련 함수들
    const openScheduleModal = useCallback((selectInfo, event = null) => {
        const { startStr, endStr, jsEvent, allDay } = selectInfo;
        const start = new Date(startStr);
        const end = new Date(endStr);
        const diffInMs = end.getTime() - start.getTime();
        const diffInDays = diffInMs / (1000 * 3600 * 24);

        let title;
        let view;

        if (event) { // Case 1: 이벤트 클릭
            title = '일정 상세 정보';
            view = 'list';
        } else if (allDay === false) { // Case 2: 주/일별 뷰에서 시간 선택
            title = '새 일정';
            view = 'form';
        } else if (diffInDays > 1) { // Case 3: 월별 뷰에서 여러 날 드래그
            title = `새 일정`;
            view = 'form';
        } else { // Case 4: 월별 뷰에서 하루 클릭
            title = `${start.getMonth() + 1}월 ${start.getDate()}일`;
            view = 'list';
        }

        // view에 따라 공통 상태 설정
        if (view === 'list') {
            setSelectedInfo({ type: "list_for_date", data: { startStr } });
            setFormData(null);
        } else if (view === 'form') {
            setFormData(transformInitialDataToFormState(selectInfo, user));
            setSelectedInfo(null);
        }

        setScheduleModalData({
            isOpen: true,
            position: { x: jsEvent.clientX, y: jsEvent.clientY },
            dateInfo: { startStr, endStr },
            title: title,
            view: view,
            initialEvent: event, // 전달받은 이벤트를 상태에 저장
        });

    }, [user]);

    const closeScheduleModal = useCallback(() => {
        setScheduleModalData({
            isOpen: false,
            position: null,
            dateInfo: null,
            title: '',
            view: 'list', // 닫을 때 초기화
            initialEvent: null, // 이벤트 상태도 초기화
        });
        // 모달이 닫힐 때, 사이드바 선택 상태도 초기화합니다.
        clearScheduleSelection();
    }, [clearScheduleSelection]);

    const switchToModalFormView = useCallback((data) => {
        setScheduleModalData(prev => ({ ...prev, view: 'form' }));
        // data에 id가 있으면 (이벤트 객체이면) 수정으로, 없으면 새 일정으로 판단
        if (data && data.id) {
            setFormData(transformEventToFormState(data));
        } else {
            const info = data || scheduleModalData.dateInfo;
            setFormData(transformInitialDataToFormState(info, user));
        }
    }, [user, scheduleModalData.dateInfo]);

    const switchToModalListView = useCallback(() => {
        setScheduleModalData(prev => ({ ...prev, view: 'list' }));
        setFormData(null);
    }, []);

    const switchToModalRRuleView = useCallback(() => {
        setScheduleModalData(prev => ({ ...prev, view: 'rrule_form' }));
    }, []);

    /**
     * ✅ [신규] 사이드바에서 '뒤로 가기' 동작을 처리하는 통합 함수
     */
    const goBackInSchedulePanel = useCallback(() => {
        // 만약 모달이 열려있다면, 모달의 내부 뷰를 전환합니다.
        if (scheduleModalData.isOpen) {
            // RRule 폼에서는 일반 폼으로, 그 외(폼, 상세)에서는 리스트 뷰로 돌아갑니다.
            if (scheduleModalData.view === 'rrule_form') {
                setScheduleModalData(prev => ({ ...prev, view: 'form' }));
            } else {
                switchToModalListView();
            }
            return;
        }

        if (!selectedInfo) {
            clearScheduleSelection();
            return;
        }
        const {type, data} = selectedInfo;
        switch (type) {
            // ✅ [신규] 반복 규칙 화면에서 뒤로 갈 때, 폼 데이터에 id 유무를 보고
            // 수정 폼 또는 새 일정 폼으로 돌아갑니다.
            case "rrule_form":
                if (formData?.id) {
                    setSelectedInfo(prev => ({ ...prev, type: 'edit' }));
                } else {
                    setSelectedInfo(prev => ({ ...prev, type: 'new' }));
                }
                break;
            case "edit":
                openSchedulePanelForDetail(data);
                break;
            case "new":
                openSchedulePanelForDate({startStr: data.startStr});
                break;
            case "detail":
                let dateStr = null;
                // ✅ [수정] '뒤로가기' 시 날짜를 안전하게 추출합니다.
                // data.start는 캘린더에서 직접 클릭하면 Date 객체,
                // 팝업이나 목록에서 클릭하면 문자열일 수 있으므로 두 경우 모두 처리합니다.
                if (data && data.start) {
                    if (data.start instanceof Date && !isNaN(data.start)) {
                        // Case 1: Date 객체인 경우 - UTC 변환을 피하기 위해 로컬 날짜 구성요소를 사용합니다.
                        const d = new Date(data.start);
                        const year = d.getFullYear();
                        const month = String(d.getMonth() + 1).padStart(2, "0");
                        const day = String(d.getDate()).padStart(2, "0");
                        dateStr = `${year}-${month}-${day}`;
                    } else if (typeof data.start === "string") {
                        // Case 2: 문자열인 경우 (YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss)
                        dateStr = data.start.split("T")[0];
                    }
                }

                if (dateStr) {
                    openSchedulePanelForDate({startStr: dateStr});
                } else {
                    clearScheduleSelection();
                }
                break;
            default:
                clearScheduleSelection();
        }
    }, [selectedInfo, formData, scheduleModalData.isOpen, scheduleModalData.view, switchToModalListView, openSchedulePanelForDetail, openSchedulePanelForDate, clearScheduleSelection]);

    /**
     * ✅ [신규] 이벤트 상세보기를 위한 통합 함수
     */
    const showEventDetails = useCallback(
        (event, clickInfo) => {
            openSchedulePanelForDetail(event);
            const rect = clickInfo.el.getBoundingClientRect();
            openPopup({
                event: event,
                targetRect: rect,
            });
        },
        [openSchedulePanelForDetail, openPopup]
    );

    // --- 삭제 관련 함수 ---
    const requestDeleteConfirmation = useCallback((eventId) => {
        // closePopup(); // 팝업을 닫지 않고, 모달을 그 위에 띄웁니다.
        setDeleteModalState({isOpen: true, eventId}); // 2. 삭제 확인 모달을 엽니다.
    }, []);

    const cancelDeleteConfirmation = useCallback(() => {
        setDeleteModalState({isOpen: false, eventId: null});
    }, []);

    const confirmDelete = useCallback(async () => {
        if (deleteModalState.eventId) {
            await deleteEvent(deleteModalState.eventId);

            // 삭제 후, 메인 모달이 열려있었다면 닫아줍니다.
            if (scheduleModalData.isOpen) {
                closeScheduleModal();
            } 
            // 그렇지 않고 사이드바가 열려있었다면 목록으로 되돌립니다.
            else if (selectedInfo?.type === "detail" || selectedInfo?.type === "edit") {
                goBackInSchedulePanel();
            }
        }
        // 삭제 확인 모달을 닫고 상태를 초기화합니다.
        setDeleteModalState({isOpen: false, eventId: null});
    }, [deleteModalState.eventId, deleteEvent, selectedInfo, scheduleModalData.isOpen, closeScheduleModal, goBackInSchedulePanel]);

    const restoreCachedEvents = useCallback(() => {
        setEvents(cachedEvents);
    }, [cachedEvents]);

    const value = useMemo(
        () => ({
            // 데이터
            events,
            loading,
            error,
            formData, //  공유
            setFormData, //  공유
            // 패널 상태 및 함수
            selectedInfo,
            openSchedulePanelForDate,
            openSchedulePanelForNew,
            openSchedulePanelForDetail,
            openSchedulePanelForEdit,
            openSchedulePanelForRRule,
            clearScheduleSelection,
            // 팝업 상태 및 함수
            popupState,
            openPopup,
            closePopup,

            // 스케줄 모달 상태 및 함수
            scheduleModalData,
            openScheduleModal,
            closeScheduleModal,
            switchToModalFormView, // 모달 뷰 전환 함수
            switchToModalListView, // 모달 뷰 전환 함수
            switchToModalRRuleView, // 모달 뷰 전환 함수
            showEventDetails,
            goBackInSchedulePanel,
            // CRUD 함수 (deleteEvent는 confirmDelete 내부에서 사용됩니다)
            addEvent,
            updateEvent,
            requestDeleteConfirmation, // 외부에서는 이 함수를 통해 삭제를 요청합니다.
            fetchSchedulesByTags, //  태그 필터링 함수
            restoreCachedEvents, // 옵티미스틱 업데이트를 위한 함수
        }),
        [
            events,
            loading,
            error,
            formData,
            selectedInfo,
            popupState,
            addEvent,
            updateEvent,
            requestDeleteConfirmation, // deleteEvent -> requestDeleteConfirmation
            openSchedulePanelForDate,
            openSchedulePanelForNew,
            openSchedulePanelForDetail,
            openSchedulePanelForEdit,
            openSchedulePanelForRRule,
            clearScheduleSelection,
            openPopup,
            closePopup,
            showEventDetails,
            goBackInSchedulePanel,
            confirmDelete,
            cancelDeleteConfirmation,
            fetchSchedulesByTags,
            restoreCachedEvents,
        ]
    );

    return (
        <ScheduleContext.Provider value={value}>
            {children}
            {/* ✅ [수정] ConfirmModal을 z-index를 관리하는 Wrapper로 감싸 안정성을 높입니다. */}
            <ModalWrapper>
                <ConfirmModal
                    isOpen={deleteModalState.isOpen}
                    onClose={cancelDeleteConfirmation}
                    onConfirm={confirmDelete}
                    title="일정 삭제"
                >
                    정말로 이 일정을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
                </ConfirmModal>
            </ModalWrapper>
        </ScheduleContext.Provider>
    );
}
