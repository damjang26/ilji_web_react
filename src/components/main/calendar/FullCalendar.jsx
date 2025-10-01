import React, {useState, useRef, useMemo, useEffect} from "react";
import ReactDOM from "react-dom";
import {
    CalendarWrapper,
    DiaryPopoverContainer,
    DiaryPopoverButton,
    SpinnerWrapper,
    Spinner,
} from "../../../styled_components/main/calendar/CalendarWrapper.jsx";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import rrulePlugin from "@fullcalendar/rrule"; // ✅ rrule 플러그인 import
import timeGridPlugin from "@fullcalendar/timegrid";
import {useSchedule} from "../../../contexts/ScheduleContext.jsx";
import {useTags} from "../../../contexts/TagContext.jsx";
import {useJournal} from "../../../contexts/JournalContext.jsx";
import {useAuth} from "../../../AuthContext.jsx";
import {FaBookOpen, FaTrash, FaShareAlt} from "react-icons/fa"; // 팝오버 아이콘
import {
    LuBookPlus,
    LuBookCheck,
    LuBookLock,
    LuBookUser,
} from "react-icons/lu"; // 날짜 옆 상태 아이콘
import {shareJournal} from "../../../utils/shareUtils.js"; // ✅ [추가] 공유 부품 임포트
import {useNavigate, useLocation} from "react-router-dom";

import {RiQuillPenAiFill} from "react-icons/ri";

export default function FullCalendarExample() {
    const {
        events,
        loading,
        openSchedulePanelForNew, // 사이드바 대신 패널을 여는 새 함수
        openSchedulePanelForDate, // 사이드바 대신 패널을 여는 새 함수
        openScheduleModal, // 모달을 여는 새 함수
        showEventDetails, // ✅ [신규] 상세보기를 위한 통합 함수
        updateEvent,
        updateRecurringEventInstance, // ✅ [신규] 반복 일정 인스턴스 업데이트 함수
        popupState,
        openPopup,
        closePopup,
    } = useSchedule();
    const {tags} = useTags();

    const navigate = useNavigate();
    const location = useLocation();

    const {
        hasJournal,
        getJournal,
        deleteJournal,
        getJournalById,
        setVisibleDateRange,
        loading: journalLoading,
    } = useJournal();
    const [diaryPopover, setDiaryPopover] = useState({
        visible: false,
        date: null,
        top: 0,
        left: 0,
    });
    const popoverHideTimer = useRef(null);
    const actionHandledRef = useRef(false); // New ref

    useEffect(() => {
        if (!location.state?.action) return;

        const {action, ...restState} = location.state;

        // 루프를 유발하는 action을 제거한 깨끗한 backgroundLocation을 생성합니다.
        const cleanBackgroundLocation = {
            ...location,
            state: restState,
        };

        // 현재 히스토리의 state를 깨끗한 버전으로 교체합니다.
        navigate(location.pathname, {state: restState, replace: true});

        const handleAction = async () => {
            if (action === 'openJournalModal') {
                const dateFromState = restState?.date;
                navigate("/i-log/write", {
                    state: {
                        backgroundLocation: cleanBackgroundLocation, // 깨끗한 location 전달
                        selectedDate: dateFromState ? new Date(dateFromState) : new Date(),
                    },
                });
            } else if (action === 'openJournalViewModal') {
                const {journalId, openCommentSection} = restState; // openCommentSection 추가
                if (journalId) {
                    try {
                        const journalData = await getJournalById(journalId);
                        if (journalData) {
                            navigate(`/journals/${journalId}`, {
                                state: {
                                    backgroundLocation: cleanBackgroundLocation,
                                    journalData: {
                                        ...journalData,
                                        openCommentSection: openCommentSection, // openCommentSection 전달
                                    },
                                },
                            });
                        }
                    } catch (error) {
                        console.error("Error fetching journal by ID:", error);
                        alert("Failed to load journal information.");
                    }
                }
            }
        };

        handleAction();

    }, [location, navigate, getJournalById]);

    // ✅ [수정] 타임존 문제 방지를 위해 Date 객체를 'YYYY-MM-DD'로 직접 변환합니다.
    const formatDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    };

    const handleDeleteJournal = async () => {
        // 1. 팝오버의 날짜를 이용해 삭제할 일기 객체를 가져옵니다. (id를 알아내기 위함)
        const journalToDelete = getJournal(diaryPopover.date);
        if (!journalToDelete) {
            alert("Could not find the journal to delete.");
            return;
        }

        // 2. 사용자에게 정말 삭제할 것인지 확인받습니다.
        if (window.confirm("Are you sure you want to delete this journal?")) {
            try {
                // 3. Context의 deleteJournal 함수를 호출합니다. (id와 날짜를 넘겨줍니다)
                await deleteJournal(journalToDelete.id, diaryPopover.date);
                alert("Journal deleted successfully.");
                // 4. 성공적으로 삭제되면 팝오버를 닫습니다.
                setDiaryPopover((p) => ({...p, visible: false}));
            } catch (error) {
                console.error("일기 삭제 실패:", error);
                alert("Failed to delete the journal.");
            }
        }
    };

    const {user} = useAuth();

    const coloredEvents = useMemo(() => {
        if (tags.length === 0) return events.map(event => ({
            ...event,
            editable: user && user.id === event.extendedProps.calendarId
        }));

        const tagColorMap = new Map(tags.map((tag) => [tag.id, tag.color]));
        const DEFAULT_COLOR = "#808080"; // 기본 색상 (회색)

        return events.map((event) => {
            const tagId = event.extendedProps?.tagId;

            // 태그가 존재하지 않는 경우(tagId가 null 또는 undefined) 기본 색상 적용
            const color = tagId ? tagColorMap.get(tagId) || DEFAULT_COLOR : DEFAULT_COLOR;

            const isOwner = user && user.id === event.extendedProps.calendarId;
            return {
                ...event,
                backgroundColor: color,
                borderColor: color,
                editable: isOwner,
                startEditable: isOwner,
                durationEditable: isOwner,
            };
        });
    }, [events, tags, user]);

    // 초기 로딩 시에만 전체 로딩 화면을 표시합니다.
    // (로딩 중이면서, 아직 이벤트가 하나도 없을 때)
    const isInitialLoading = (loading) && events.length === 0;
    if (isInitialLoading) {
        return (
            <SpinnerWrapper>
                <Spinner/>
            </SpinnerWrapper>
        );
    }
    /**
     * ✅ 날짜 칸을 클릭/선택했을 때의 동작을 정의합니다.
     * @param {object} selectInfo - FullCalendar가 제공하는 선택 정보 객체
     */
    const handleDateSelect = (selectInfo) => {
        // 새로 추가된 모달 열기 함수를 호출합니다.
        openScheduleModal(selectInfo);
        // 날짜 선택 후 파란색 배경을 즉시 제거합니다.
        selectInfo.view.calendar.unselect();
    };

    /**
     * ✅ 이미 등록된 '이벤트'를 클릭했을 때의 동작을 정의합니다.
     * @param {object} clickInfo - FullCalendar가 제공하는 이벤트 클릭 정보 객체
     */
    const handleEventClick = (clickInfo) => {
        clickInfo.jsEvent.stopPropagation();
        // 모달을 열기 위해 selectInfo와 유사한 객체를 만들어 전달합니다.
        const selectInfo = {
            startStr: clickInfo.event.startStr,
            endStr: clickInfo.event.endStr || clickInfo.event.startStr, // endStr이 없을 경우 startStr 사용
            jsEvent: clickInfo.jsEvent,
            view: clickInfo.view,
        }
        openScheduleModal(selectInfo, clickInfo.event);
    };

    /**
     * ✅ 캘린더의 뷰(월/주/일)가 변경되거나, 월을 이동할 때 호출됩니다.
     *    이때 열려있는 팝업을 닫아 사용자 혼란을 방지합니다.
     */
    const handleDatesSet = (dateInfo) => {
        if (popupState.isOpen) {
            closePopup();
        }

        // ✅ [신규] 캘린더에 보이는 날짜 범위를 JournalContext에 설정합니다.
        // 이로 인해 Context에서 해당 범위의 일기 데이터만 가져오는 API 요청이 트리거됩니다.
        const start = formatDate(dateInfo.view.activeStart);
        const end = formatDate(dateInfo.view.activeEnd);
        setVisibleDateRange({start, end});
    };

    const handleEventDrop = (dropInfo) => {
        const { event, oldEvent } = dropInfo;

        // 반복 이벤트 인스턴스인지 확인
        // event.groupId는 반복 이벤트의 모든 인스턴스가 공유하는 ID입니다.
        // event.recurring은 해당 이벤트가 반복 이벤트의 인스턴스임을 나타냅니다.
        if (event.groupId && event.recurring) {
            // 반복 이벤트의 특정 인스턴스가 이동된 경우
            updateRecurringEventInstance(oldEvent, event);
        } else {
            // 일반 이벤트 또는 반복 이벤트의 마스터 이벤트가 이동된 경우
            // (FullCalendar는 마스터 이벤트를 직접 드롭할 수 없으므로, 이 경로는 주로 일반 이벤트에 해당)
            if (!event.allDay) {
                const newDate = event.start;
                const originalDate = oldEvent.start;
                const newStart = new Date(
                    newDate.getFullYear(),
                    newDate.getMonth(),
                    newDate.getDate(),
                    originalDate.getHours(),
                    originalDate.getMinutes(),
                    originalDate.getSeconds()
                );
                let newEnd = null;
                if (oldEvent.end) {
                    const duration = oldEvent.end.getTime() - originalDate.getTime();
                    newEnd = new Date(newStart.getTime() + duration);
                }
                updateEvent({
                    ...event.toPlainObject(),
                    start: newStart,
                    end: newEnd,
                });
            } else {
                updateEvent({
                    ...event.toPlainObject(),
                    start: event.start,
                    end: event.end,
                });
            }
        }
    };

    const handleEventResize = (info) => {
        const { event, oldEvent } = info;

        // 반복 이벤트 인스턴스인지 확인
        if (event.groupId && event.recurring) {
            // 반복 이벤트의 특정 인스턴스가 리사이즈된 경우
            updateRecurringEventInstance(oldEvent, event);
        } else {
            // 일반 이벤트 또는 반복 이벤트의 마스터 이벤트가 리사이즈된 경우
            updateEvent({
                ...event.toPlainObject(),
                start: event.start,
                end: event.end,
            });
        }
    };

    const startHideTimer = () => {
        popoverHideTimer.current = setTimeout(() => {
            setDiaryPopover((p) => ({...p, visible: false}));
        }, 200);
    };

    const clearHideTimer = () => {
        clearTimeout(popoverHideTimer.current);
    };

    /**
     * ✅ [신규] 각 날짜 셀의 내용을 렌더링하는 함수 (dayCellContent)
     * - 일기 상태에 따라 아이콘을 동적으로 표시합니다.
     * - React 방식으로 마우스 호버 이벤트를 처리하여 일기 팝오버를 띄웁니다.
     */
    const renderDayCellContent = (dayCellInfo) => {
        // ✅ [수정] 월(dayGridMonth) 뷰에서만 커스텀 렌더링을 적용합니다.
        if (dayCellInfo.view.type !== "dayGridMonth") {
            // 다른 뷰(week, day)에서는 FullCalendar 기본 렌더링을 사용
            return null;
        }

        const dateStr = formatDate(dayCellInfo.date); // ✅ [수정] 타임존 안전한 함수 사용
        const journal = getJournal(dateStr);
        const isToday = dayCellInfo.isToday;
        const dayNumber = dayCellInfo.dayNumberText.replace("일", "");

        // --- 조건부 아이콘 렌더링 로직 ---
        // ✅ [수정] isPrivate 대신 visibility 값에 따라 아이콘을 분기합니다.
        // 로직을 단순화하여 일기 유무를 먼저 확인하고, 그 다음 visibility 값에 따라 아이콘을 결정합니다.
        let icon = null;
        if (journal) {
            // 일기가 있을 경우: visibility 값에 따라 아이콘 분기
            if (journal.visibility === "PRIVATE") { // 2: 나만 보기
                icon = <LuBookLock className="journal-icon lock"/>;
            } else if (journal.visibility === "FRIENDS_ONLY") { // 1: 친구 공개
                icon = <LuBookUser className="journal-icon user"/>;
            } else { // 0: 전체 공개 및 기타
                icon = <LuBookCheck className="journal-icon check"/>;
            }
        } else if (isToday) {
            // 일기가 없고 오늘 날짜인 경우: 작성 아이콘 표시
            icon = <LuBookPlus className="journal-icon plus"/>;
        }

        // --- 팝오버 이벤트 핸들러 ---
        const handleMouseEnter = (e) => {
            // ✅ [추가] 오늘 날짜와 비교하여 미래의 날짜인지 확인합니다.
            const today = new Date();
            // 시간, 분, 초를 0으로 설정하여 날짜만 비교하도록 합니다.
            today.setHours(0, 0, 0, 0);

            // 마우스가 올라간 날짜가 오늘보다 미래라면, 팝업을 띄우지 않고 함수를 종료합니다.
            if (dayCellInfo.date > today) {
                return;
            }

            // 과거 또는 오늘 날짜일 경우에만 팝업을 띄웁니다.
            clearHideTimer();
            const rect = e.currentTarget.getBoundingClientRect();
            setDiaryPopover({
                visible: true,
                date: dateStr,
                top: rect.bottom + 5,
                left: rect.left + rect.width / 2,
            });
        };

        const handleMouseLeave = () => {
            startHideTimer();
        };

        // 아이콘과 날짜 번호를 div로 감싸서 호버 이벤트를 한 번에 처리합니다.
        return (
            <div
                className="day-cell-content-wrapper"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                {isToday ? (
                    <span className="today-number-circle">{dayNumber}</span>
                ) : (
                    <span className="other-day-number">{dayNumber}</span>
                )}
                {icon}
            </div>
        );
    };

    return (
        <CalendarWrapper>
            {/* 필터링 등 다시 로딩 시 스피너 표시 */}
            {(loading || journalLoading) && !isInitialLoading && (
                <SpinnerWrapper>
                    <Spinner/>
                </SpinnerWrapper>
            )}

            {ReactDOM.createPortal(
                <DiaryPopoverContainer
                    style={{
                        top: diaryPopover.top,
                        left: diaryPopover.left,
                        transform: "translateX(-50%)",
                    }}
                    $visible={diaryPopover.visible}
                    onMouseEnter={clearHideTimer}
                    onMouseLeave={startHideTimer}
                    // ✅ [수정] mousedown 이벤트의 전파를 막아, 메인 팝업이 닫히는 현상을 방지합니다.
                    onMouseDown={(e) => e.stopPropagation()}
                >
                    {hasJournal(diaryPopover.date) ? (
                        <>
                            <DiaryPopoverButton
                                onClick={() => {
                                    // ✅ [수정] getJournal로 일기 데이터를 가져와 state에 담아 전달합니다.
                                    const journal = getJournal(diaryPopover.date);
                                    if (journal) {
                                        navigate(`/myi-log/${journal.id}`, {
                                            state: {
                                                backgroundLocation: location,
                                                journalData: journal,
                                            },
                                        });
                                    }
                                }}
                            >
                                <FaBookOpen/> Open i-log
                            </DiaryPopoverButton>
                            <DiaryPopoverButton onClick={handleDeleteJournal}>
                                <FaTrash/> Delete i-log
                            </DiaryPopoverButton>
                            {/* ✅ [수정] 공유 버튼에 onClick 핸들러를 추가합니다. */}
                            <DiaryPopoverButton onClick={() => {
                                const journal = getJournal(diaryPopover.date);
                                if (journal) {
                                    shareJournal(journal);
                                    setDiaryPopover(p => ({...p, visible: false})); // 공유 후 팝오버 닫기
                                }
                            }}>
                                <FaShareAlt/> Share i-log
                            </DiaryPopoverButton>
                        </>
                    ) : (
                        <DiaryPopoverButton
                            onClick={() => {
                                navigate("/i-log/write", {
                                    state: {
                                        backgroundLocation: location,
                                        selectedDate: diaryPopover.date,
                                    },
                                });
                            }}
                        >
                            <RiQuillPenAiFill style={{fontSize: "17px", verticalAlign: "bottom"}}/> Write i-log
                        </DiaryPopoverButton>
                    )}
                </DiaryPopoverContainer>,
                document.body
            )}


            <FullCalendar
                plugins={[dayGridPlugin, interactionPlugin, timeGridPlugin, rrulePlugin]}
                initialView="dayGridMonth"
                headerToolbar={{
                    left: "today",
                    center: "prev title next",
                    right: "dayGridMonth,timeGridWeek,timeGridDay",
                }}
                views={{
                    dayGridMonth: {
                        titleFormat: {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                        },
                    },
                }}
                events={coloredEvents}
                height="100%"
                selectable={true}
                select={handleDateSelect}
                eventClick={handleEventClick}
                editable={true}
                eventDrop={handleEventDrop}
                eventResize={handleEventResize}
                dayCellContent={renderDayCellContent} // ✅ [수정] dayCellDidMount를 dayCellContent로 교체
                datesSet={handleDatesSet}
                eventDisplay="block"
                eventTimeFormat={{
                    hour: "numeric",
                    minute: "2-digit",
                    meridiem: "short",
                    hour12: true,
                }}
                slotLabelInterval="01:00:00"
                slotLabelFormat={{
                    hour: "numeric",
                    meridiem: "short",
                }}
                slotMinHeight={10}
            />
        </CalendarWrapper>
    );
}