import React from "react";
import { CalendarWrapper } from "../../../styled_components/main/calendar/CalendarWrapper.jsx";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import timeGridPlugin from "@fullcalendar/timegrid";
import { useSchedule } from "../../../contexts/ScheduleContext.jsx";
/*
 (FullCalendar와 관련 플러그인 설치)
 npm install @fullcalendar/react @fullcalendar/daygrid @fullcalendar/interaction @fullcalendar/timegrid
*/

export default function FullCalendarExample() {
    // ✅ Context에서 데이터와 함수를 직접 가져옴
    const { events, openSidebarForDate, openSidebarForDetail, updateEvent } =
        useSchedule();

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
        const { event } = info;
        // ✅ Context의 업데이트 함수를 호출
        updateEvent({
            ...event.toPlainObject(),
            start: event.start,
            end: event.end,
        });
    };

    // Handle event resize
    const handleEventResize = (info) => {
        const { event } = info;
        // ✅ Context의 업데이트 함수를 호출
        updateEvent({
            ...event.toPlainObject(),
            start: event.start,
            end: event.end,
        });
    };

    return (
        <CalendarWrapper>
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
