import React, { useState } from "react";
import {CalendarWrapper } from "../../../styled_components/CalendarWrapper.jsx";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import timeGridPlugin from "@fullcalendar/timegrid";
/*
 (FullCalendar와 관련 플러그인 설치)
 npm install @fullcalendar/react @fullcalendar/daygrid @fullcalendar/interaction @fullcalendar/timegrid
*/
let eventGuid = 0;
const createEventId = () => {
  return String(eventGuid++);
};

export default function FullCalendarExample() {
  const [events, setEvents] = useState([
    { title: "Conference", date: "2025-07-07", id: createEventId() },
    {
      title: "Meeting",
      start: "2025-07-07T10:00:00",
      end: "2025-07-07T11:00:00",
      id: createEventId(),
    }, // Overlapping event
  ]); // 캘린더에 저장할 일정 정보들 얘인거 같음!!!

  const handleDateSelect = (selectInfo) => {
    let title = prompt("Please enter a new title for your event");
    let calendarApi = selectInfo.view.calendar;

    calendarApi.unselect(); // clear date selection

    if (title) {
      const newEvent = {
        id: createEventId(),
        title,
        start: selectInfo.startStr,
        end: selectInfo.endStr,
        allDay: selectInfo.allDay,
      };
      setEvents((prevEvents) => [...prevEvents, newEvent]);
    }
  };

  const handleEventClick = (clickInfo) => {
    if (
      confirm(
        `Do you want to edit or delete the event '${clickInfo.event.title}'? Click OK to delete, Cancel to edit.`
      )
    ) {
      // Delete logic
      setEvents((prevEvents) =>
        prevEvents.filter((event) => event.id !== clickInfo.event.id)
      );
    } else {
      // Edit logic
      let newTitle = prompt(
        `Edit title for '${clickInfo.event.title}':`,
        clickInfo.event.title
      );
      if (newTitle !== null) {
        // Check if user didn't cancel prompt
        setEvents((prevEvents) =>
          prevEvents.map((event) =>
            event.id === clickInfo.event.id
              ? { ...event, title: newTitle }
              : event
          )
        );
      }
    }
  };

  // Handle event drop (drag and drop)
  const handleEventDrop = (info) => {
    const { event } = info;
    setEvents((prevEvents) =>
      prevEvents.map((e) =>
        e.id === event.id ? { ...e, start: event.start, end: event.end } : e
      )
    );
  };

  // Handle event resize
  const handleEventResize = (info) => {
    const { event } = info;
    setEvents((prevEvents) =>
      prevEvents.map((e) =>
        e.id === event.id ? { ...e, start: event.start, end: event.end } : e
      )
    );
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
            titleFormat: { year: "numeric", month: "short", day: "numeric" },
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
        eventDisplay="block"  // month에서 시간 지정되어있는 일정의 스타일 없앴음 나중에 개발하면서 조정할 예정
        eventTimeFormat={{ // 시간 표시 형식
          hour: 'numeric',
          minute: '2-digit',
          meridiem: 'short', // 'AM' / 'PM'
          hour12: true
        }}
        slotDuration="00:10:00"  // 10분 단위
        slotLabelInterval="01:00:00"   // 좌측 라벨 1시간 간격
        slotLabelFormat={{
          hour: 'numeric',
          meridiem: 'short'
        }}
        slotMinHeight={10} // 10분 단위 슬롯의 최소 높이를 px단위로 지정하여 전체 길이를 압축합니다.
      />
    </CalendarWrapper>
  );
}
