import React, { useState, useRef, useMemo } from "react";
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
import { useSchedule } from "../../../contexts/ScheduleContext.jsx";
import { useTags } from "../../../contexts/TagContext.jsx";
import { useJournal } from "../../../contexts/JournalContext.jsx";
import { FaPencilAlt, FaBookOpen, FaTrash, FaShareAlt } from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";
import SchedulePopUp from "./popup/SchedulePopUp.jsx";

export default function FullCalendarExample() {
  const {
    events,
    openSidebarForNew,
    openSidebarForDate, // 사이드바에 특정 날짜의 리스트를 보여주기 위한 함수
    showEventDetails, // ✅ [신규] 상세보기를 위한 통합 함수
    updateEvent,
    popupState,
    openPopup,
    closePopup,
  } = useSchedule();
  const { tags } = useTags();

    const navigate = useNavigate();
    const location = useLocation();

  // 일기 팝오버 상태 관리
  const { hasJournal } = useJournal();
  const [diaryPopover, setDiaryPopover] = useState({
    visible: false,
    date: null,
    top: 0,
    left: 0,
  });
  const popoverHideTimer = useRef(null);

  const coloredEvents = useMemo(() => {
    if (tags.length === 0) return events;

    const tagColorMap = new Map(tags.map((tag) => [tag.id, tag.color]));

    return events.map((event) => {
      const tagId = event.extendedProps?.tagId;
      const color = tagColorMap.get(tagId) || "#cccccc";
      return { ...event, backgroundColor: color, borderColor: color };
    });
    const popoverHideTimer = useRef(null);

  /**
   * ✅ 날짜 칸을 클릭/선택했을 때의 동작을 정의합니다.
   * @param {object} selectInfo - FullCalendar가 제공하는 선택 정보 객체
   */
  const handleDateSelect = (selectInfo) => {
    const { startStr, endStr, jsEvent, view } = selectInfo;

    // 여러 날을 드래그했는지 확인 (종료일은 exclusive이므로 +1일 되어 들어옴)
    const start = new Date(startStr);
    const end = new Date(endStr);
    const diffInMs = end.getTime() - start.getTime();
    const diffInDays = diffInMs / (1000 * 3600 * 24);

    if (diffInDays > 1) {
      // 여러 날을 선택한 경우: 사이드바에서 새 일정 생성
      openSidebarForNew(selectInfo);
    } else {
      // 하루만 선택(클릭)한 경우: 팝업 열기.
      // ✅ [수정] 기준점을 '날짜 셀'이 아닌 '마우스 클릭 좌표'로 변경합니다.
      const rect = {
        top: jsEvent.clientY,
        bottom: jsEvent.clientY,
        left: jsEvent.clientX,
        right: jsEvent.clientX,
      };

      openPopup({
        date: startStr,
        // 팝업이 위치를 계산할 수 있도록 마우스 클릭 좌표를 전달합니다.
        targetRect: rect,
      });

      // ✅ 동시에, 사이드바를 열고 해당 날짜의 일정 목록을 보여줍니다.
      openSidebarForDate({ startStr });
    }

    // 날짜 선택 후 파란색 배경을 즉시 제거합니다.
    view.calendar.unselect();
  };

  /**
   * ✅ 이미 등록된 '이벤트'를 클릭했을 때의 동작을 정의합니다.
   * @param {object} clickInfo - FullCalendar가 제공하는 이벤트 클릭 정보 객체
   */
  const handleEventClick = (clickInfo) => {
    // ✅ [수정] 클릭 이벤트가 부모 요소(CalendarWrapper)로 전파되는 것을 막습니다.
    // 이렇게 하지 않으면, 팝업을 여는 동시에 팝업을 닫는 onClick 핸들러가 실행되어
    // 팝업이 열리자마자 닫히는 문제가 발생합니다.
    clickInfo.jsEvent.stopPropagation();
    // ✅ [수정] 분산되어 있던 UI 로직을 `showEventDetails` 함수 하나로 통합하여 호출합니다.
    // 이제 컴포넌트는 '무엇을' 할지만 결정하고, '어떻게' 할지는 Context가 책임집니다.
    showEventDetails(clickInfo.event, clickInfo);
  };

  /**
   * ✅ 캘린더의 뷰(월/주/일)가 변경되거나, 월을 이동할 때 호출됩니다.
   *    이때 열려있는 팝업을 닫아 사용자 혼란을 방지합니다.
   */
  const handleDatesSet = () => {
    if (popupState.isOpen) {
      closePopup();
    }
  };

  const handleEventDrop = (dropInfo) => {
    const { event, oldEvent } = dropInfo;

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
      updateEvent({ ...event.toPlainObject(), start: newStart, end: newEnd });
    } else {
      updateEvent({
        ...event.toPlainObject(),
        start: event.start,
        end: event.end,
      });
    }
  };

  const handleEventResize = (info) => {
    const { event } = info;
    updateEvent({
      ...event.toPlainObject(),
      start: event.start,
      end: event.end,
    });
  };

  const startHideTimer = () => {
    popoverHideTimer.current = setTimeout(() => {
      setDiaryPopover((p) => ({ ...p, visible: false }));
    }, 200);
  };

  const clearHideTimer = () => {
    clearTimeout(popoverHideTimer.current);
  };

  const handleDayCellMount = (arg) => {
    const dayNumberEl = arg.el.querySelector(".fc-daygrid-day-number");
    if (dayNumberEl) {
      dayNumberEl.addEventListener("mouseenter", (e) => {
        clearHideTimer();
        const rect = e.target.getBoundingClientRect();
        const date = arg.date;
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const dateString = `${year}-${month}-${day}`;
        setDiaryPopover({
          visible: true,
          date: dateString,
          top: rect.bottom + 5,
          left: rect.left + rect.width / 2,
        });
    }, [events, tags]);

  return (
      <CalendarWrapper>
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
                          navigate(`/journal/view/${diaryPopover.date}`, {
                            state: { backgroundLocation: location },
                          });
                        }}
                    >
                      <FaBookOpen /> 일기 보기
                    </DiaryPopoverButton>
                    <DiaryPopoverButton>
                      <FaTrash /> 일기 삭제
                    </DiaryPopoverButton>
                    <DiaryPopoverButton>
                      <FaShareAlt /> 일기 공유
                    </DiaryPopoverButton>
                  </>
              ) : (
                  <DiaryPopoverButton
                      onClick={() => {
                        navigate("/journal/write", {
                          state: {
                            backgroundLocation: location,
                            selectedDate: diaryPopover.date,
                          },
                        });
                      }}
                  >
                    <FaPencilAlt /> 일기 작성
                  </DiaryPopoverButton>
              )}
            </DiaryPopoverContainer>,
            document.body
        )}

        {ReactDOM.createPortal(<SchedulePopUp />, document.body)}

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
                titleFormat: { year: "numeric", month: "short" },
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
            dayCellDidMount={handleDayCellMount}
            datesSet={handleDatesSet}
            eventDisplay="block"
            eventTimeFormat={{
              hour: "numeric",
              minute: "2-digit",
              meridiem: "short",
              hour12: true,
            }}
            slotDuration="00:10:00"
            slotLabelInterval="01:00:00"
            slotLabelFormat={{
              hour: "numeric",
              meridiem: "short",
            }}
        />
      </CalendarWrapper>
  );
}
