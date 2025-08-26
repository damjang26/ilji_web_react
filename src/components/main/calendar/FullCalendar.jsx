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
    const {events, openSidebarForDate, openSidebarForNew, openSidebarForDetail, updateEvent} =
        useSchedule(); // openSidebarForNew 추가

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
        const { startStr, endStr } = selectInfo;

        // UTC 기준으로 날짜를 계산하여 시간대(Timezone) 문제를 회피합니다.
        const start_parts = startStr.split('-').map(Number);
        const startUTC = new Date(Date.UTC(start_parts[0], start_parts[1] - 1, start_parts[2]));

        const end_parts = endStr.split('-').map(Number);
        const endUTC = new Date(Date.UTC(end_parts[0], end_parts[1] - 1, end_parts[2]));

        // 두 날짜의 차이를 일(day) 단위로 계산합니다.
        const oneDayInMs = 24 * 60 * 60 * 1000;
        const diffInDays = (endUTC.getTime() - startUTC.getTime()) / oneDayInMs;

        // ✅ [디버깅] 계산된 날짜 차이를 콘솔에 출력합니다.
        console.log(`[디버깅] 날짜 차이: ${diffInDays}일 (시작: ${startStr}, 종료: ${endStr})`);

        if (diffInDays > 1) {
            // 차이가 하루를 초과하면, 여러 날을 드래그한 것입니다.
            openSidebarForNew(selectInfo);
        } else {
            // 차이가 정확히 하루이면, 하루만 클릭한 것입니다.
            openSidebarForDate(selectInfo);
        }

        selectInfo.view.calendar.unselect(); // 날짜 선택 효과 해제
    };

    const handleEventClick = (clickInfo) => {
        // 기존 일정을 클릭하면 상세 정보/수정용 사이드바를 엽니다.
        openSidebarForDetail(clickInfo.event);
    };

    // Handle event drop (drag and drop)
    const handleEventDrop = (dropInfo) => {
        const { event, oldEvent } = dropInfo;

        // '하루 종일'이 아닌 시간 지정 일정의 경우, 월(Month) 뷰에서 드래그 시 시간이 초기화되는 것을 방지합니다.
        if (!event.allDay) {
            // 드롭된 새 날짜 정보 (시간은 00:00으로 초기화되었을 수 있음)
            const newDate = event.start;
            // 시간 정보가 보존된 원래 이벤트의 날짜 정보
            const originalDate = oldEvent.start;

            // 새 날짜의 '일'과 원래 날짜의 '시간'을 조합하여 새로운 시작 시간을 생성합니다.
            const newStart = new Date(
                newDate.getFullYear(),
                newDate.getMonth(),
                newDate.getDate(),
                originalDate.getHours(),
                originalDate.getMinutes(),
                originalDate.getSeconds()
            );

            let newEnd = null;
            // 원래 종료 시간이 있었다면, 원래의 지속시간을 보존하여 새 종료 시간을 계산합니다.
            if (oldEvent.end) {
                const duration = oldEvent.end.getTime() - originalDate.getTime();
                newEnd = new Date(newStart.getTime() + duration);
            }

            // 보정된 시간으로 업데이트를 요청합니다.
            updateEvent({ ...event.toPlainObject(), start: newStart, end: newEnd });
        } else {
            // '하루 종일' 일정은 기본 동작을 그대로 사용합니다.
            updateEvent({ ...event.toPlainObject(), start: event.start, end: event.end });
        }
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
                    $visible={diaryPopover.visible}
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
