import React, { useState } from "react";
import { CalendarWrapper } from "../../styled_components/main/CalendarWrapper.jsx";
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
        events={events}
        height="auto"
        selectable={true}
        select={handleDateSelect}
        eventClick={handleEventClick}
        editable={true}
        eventDrop={handleEventDrop}
        eventResize={handleEventResize}
      />
    </CalendarWrapper>
  );
}
