import React, { useState, useRef, useEffect, useMemo } from "react";
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

export default function FullCalendarExample() {
  const {
    events,
    loading, // 로딩 상태 추가
    openSidebarForDate,
    openSidebarForNew,
    openSidebarForDetail,
    updateEvent,
  } = useSchedule();
  const { tags } = useTags();

  const navigate = useNavigate();
  const location = useLocation();

  const [journal, setJournal] = useState(new Set(["2025-08-15", "2025-08-22"]));

  // 일기 팝오버 상태 관리
  const { hasJournal } = useJournal();
  const [diaryPopover, setDiaryPopover] = useState({
    visible: false,
    date: null,
    top: 0,
    left: 0,
  });
  const popoverHideTimer = useRef(null);

  // ✅ events나 tags가 변경될 때만 실행되는 최적화된 로직
  const coloredEvents = useMemo(() => {
    if (tags.length === 0) return events; // 태그 정보가 아직 로드되지 않았으면 원래 이벤트를 반환

    const tagColorMap = new Map(tags.map((tag) => [tag.id, tag.color]));

    return events.map((event) => {
      const tagId = event.extendedProps?.tagId;
      // tagId가 없거나 매칭되는 색상이 없을 경우 기본 색상 (#cccccc)을 사용합니다.
      const color = tagColorMap.get(tagId) || "#cccccc";

      return { ...event, backgroundColor: color, borderColor: color };
    });
  }, [events, tags]);

  useEffect(() => {}, [diaryPopover]);

  const handleDateSelect = (selectInfo) => {
    const { startStr, endStr } = selectInfo;
    const start_parts = startStr.split("-").map(Number);
    const startUTC = new Date(
      Date.UTC(start_parts[0], start_parts[1] - 1, start_parts[2])
    );
    const end_parts = endStr.split("-").map(Number);
    const endUTC = new Date(
      Date.UTC(end_parts[0], end_parts[1] - 1, end_parts[2])
    );
    const oneDayInMs = 24 * 60 * 60 * 1000;
    const diffInDays = (endUTC.getTime() - startUTC.getTime()) / oneDayInMs;

    if (diffInDays > 1) {
      openSidebarForNew(selectInfo);
    } else {
      openSidebarForDate(selectInfo);
    }
    selectInfo.view.calendar.unselect();
  };

  const handleEventClick = (clickInfo) => {
    openSidebarForDetail(clickInfo.event);
  };

  const handleEventDrop = (dropInfo) => {
    const { event, oldEvent } = dropInfo;

    // '하루 종일'이 아닌 시간 지정 일정의 경우, 월(Month) 뷰에서 드래그 시 시간이 초기화되는 것을 방지합니다.
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

      // 보정된 시간으로 업데이트를 요청합니다.
      updateEvent({ ...event.toPlainObject(), start: newStart, end: newEnd });
    } else {
      // '하루 종일' 일정은 기본 동작을 그대로 사용합니다.
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
      });
      dayNumberEl.addEventListener("mouseleave", () => {
        startHideTimer();
      });
    }
  };

  if (loading) {
    return <div>일정을 불러오는 중입니다...</div>;
  }

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
        >
          {hasJournal(diaryPopover.date) ? (
            <>
              <DiaryPopoverButton
                onClick={() => {
                  navigate(`/journal/view/${diaryPopover.date}`, {
                    state: {
                      backgroundLocation: location,
                    },
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
        dayCellDidMount={handleDayCellMount}
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
        slotMinHeight={10}
      />
    </CalendarWrapper>
  );
}
