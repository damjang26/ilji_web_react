import React, {useState, useRef} from "react";
import ReactDOM from "react-dom";
import {
    CalendarWrapper,
    DiaryPopoverContainer,
    DiaryPopoverButton,
} from "../../../styled_components/main/calendar/CalendarWrapper.jsx";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import timeGridPlugin from "@fullcalendar/timegrid";
import {useSchedule} from "../../../contexts/ScheduleContext.jsx";
import {
    FaPencilAlt,
    FaBookOpen,
    FaTrash,
    FaShareAlt,
} from "react-icons/fa";
import {useNavigate, useLocation} from "react-router-dom";

export default function FullCalendarExample() {
    // ✅ Context에서 데이터와 함수를 직접 가져옴
    const {events, openSidebarForDate, openSidebarForDetail, updateEvent} =
        useSchedule();

    // 네비게이터
    const navigate = useNavigate();
    const location = useLocation();

    // 일기 데이터 예시 (나중에는 API로 가져와야 합니다)
    // 날짜 문자열(YYYY-MM-DD)을 키로 사용하는 Set을 사용합니다.
    const [diaries, setDiaries] = useState(
        new Set(["2025-08-15", "2025-08-22"])
    );

    // 일기 팝오버 상태 관리
    const [diaryPopover, setDiaryPopover] = useState({
        visible: false,
        date: null,
        top: 0,
        left: 0,
    });
    const popoverHideTimer = useRef(null);

    const handleDateSelect = (selectInfo) => {
        // ✅ '새 일정 추가' 대신 '날짜 목록 보기' 신호를 보냅니다.
        openSidebarForDate(selectInfo);
        selectInfo.view.calendar.unselect(); // 날짜 선택 효과 해제
    };

    const handleEventClick = (clickInfo) => {
        // 기존 일정을 클릭하면 수정 모드로 사이드바를 엽니다.
        // (삭제 로직은 사이드바 내부에서 처리하는 것이 더 좋습니다)
        openSidebarForDetail(clickInfo.event);
    };

    // Handle event drop (drag and drop)
    const handleEventDrop = (info) => {
        const {event} = info;
        // ✅ Context의 업데이트 함수를 호출
        updateEvent({
            ...event.toPlainObject(),
            start: event.start,
            end: event.end,
        });
    };

    // Handle event resize
    const handleEventResize = (info) => {
        const {event} = info;
        // ✅ Context의 업데이트 함수를 호출
        updateEvent({
            ...event.toPlainObject(),
            start: event.start,
            end: event.end,
        });
    };

    // 팝오버를 부드럽게 숨기기 위한 타이머 설정
    const startHideTimer = () => {
        popoverHideTimer.current = setTimeout(() => {
            setDiaryPopover((p) => ({...p, visible: false}));
        }, 200); // 0.2초 후에 사라짐
    };

    // 팝오버 숨기기 타이머 취소
    const clearHideTimer = () => {
        clearTimeout(popoverHideTimer.current);
    };

    // 날짜 셀이 렌더링될 때마다 실행되는 함수
    const handleDayCellMount = (arg) => {
        const dayNumberEl = arg.el.querySelector(".fc-daygrid-day-number");
        if (dayNumberEl) {
            // 마우스를 올렸을 때 (일기 작성 모달창 나오게 하는 녀석)
            dayNumberEl.addEventListener("mouseenter", (e) => {
                clearHideTimer(); // 숨기기 타이머 취소
                const rect = e.target.getBoundingClientRect();
                setDiaryPopover({
                    visible: true,  // "이제 팝오버를 보여줘!"
                    date: arg.dateStr,  // "이 팝오버는 아까 선물 상자에서 받은 그 날짜 거야!"
                    top: rect.bottom + 5, // 위치는 숫자 바로 아래
                    left: rect.left + rect.width / 2, // 숫자의 가로 중앙
                });
            });

            // 마우스가 떠났을 때
            dayNumberEl.addEventListener("mouseleave", () => {
                startHideTimer(); // 숨기기 타이머 시작
            });
        }
    };


    return (
        <CalendarWrapper>
            {/* Portal을 사용해 팝오버를 body 최상단에 렌더링하여 z-index 문제를 해결합니다. */}
            {ReactDOM.createPortal(
                <DiaryPopoverContainer
                    style={{top: diaryPopover.top, left: diaryPopover.left, transform: 'translateX(-50%)'}}
                    visible={diaryPopover.visible}
                    onMouseEnter={clearHideTimer} // 팝오버 위에 마우스가 올라가면 숨기기 취소
                    onMouseLeave={startHideTimer} // 팝오버에서 마우스가 떠나면 숨기기 시작
                >
                    {diaries.has(diaryPopover.date) ? (
                        <>
                            <DiaryPopoverButton>
                                <FaBookOpen/> 일기 보기
                            </DiaryPopoverButton>
                            <DiaryPopoverButton>
                                <FaTrash/> 일기 삭제
                            </DiaryPopoverButton>
                            <DiaryPopoverButton>
                                <FaShareAlt/> 일기 공유
                            </DiaryPopoverButton>
                        </>
                    ) : (
                        <DiaryPopoverButton
                            onClick={() =>
                                // '/journal/write'로 이동하면서, 현재 location을 state에 담아 전달합니다.
                                // 이것이 모달 라우팅의 핵심입니다.
                                navigate("/journal/write", {
                                    state: {
                                        backgroundLocation: location,
                                        selectedDate: diaryPopover.date, // 선택한 날짜 정보 추가
                                    },
                                })
                            }>
                            <FaPencilAlt/> 일기 작성
                        </DiaryPopoverButton>
                    )}
                </DiaryPopoverContainer>,
                document.body
            )}
            <FullCalendar
                plugins={[dayGridPlugin, interactionPlugin, timeGridPlugin]}
                initialView="dayGridMonth"
                headerToolbar={{
                    left: "today",
                    center: "prev title next",
                    right: "dayGridMonth,timeGridWeek,timeGridDay",
                }}
                views={{
                    dayGridMonth: {
                        // 월(Month) 뷰의 제목을 주(Week) 뷰처럼 날짜 범위로 표시합니다.
                        titleFormat: {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                        },
                    },
                }}
                events={events}
                height="100%" // 캘린더 자체의 높이는 부모를 꽉 채우도록 유지
                selectable={true}
                select={handleDateSelect}
                eventClick={handleEventClick}
                editable={true}
                eventDrop={handleEventDrop}
                eventResize={handleEventResize}
                dayCellDidMount={handleDayCellMount}
                eventDisplay="block" // month에서 시간 지정되어있는 일정의 스타일 없앴음 나중에 개발하면서 조정할 예정
                eventTimeFormat={{
                    // 시간 표시 형식
                    hour: "numeric",
                    minute: "2-digit",
                    meridiem: "short", // 'AM' / 'PM'
                    hour12: true,
                }}
                slotDuration="00:10:00" // 10분 단위
                slotLabelInterval="01:00:00" // 좌측 라벨 1시간 간격
                slotLabelFormat={{
                    hour: "numeric",
                    meridiem: "short",
                }}
                slotMinHeight={10} // 10분 단위 슬롯의 최소 높이를 px단위로 지정하여 전체 길이를 압축합니다.
            />
        </CalendarWrapper>
    );
}
