import { RRule } from "rrule";
import React, { useState, useMemo } from "react";
import { FaCalendarDay, FaCalendarWeek, FaInfinity } from "react-icons/fa";
import { Tooltip } from "antd";
import {
  DateTitle,
  EventItem,
  EventList,
  FilterButton,
  FilterButtons,
  ListHeader,
  ListWrapper,
  NoEventsMessage,
} from "../../../styled_components/right_side_bar/schedule_tab/ScheduleListStyled.jsx";
import {
  ActionButtons,
  Button,
} from "../../../styled_components/common/FormElementsStyled.jsx";
import { api } from "../../../api.js";

const FILTERS = {
  all: { icon: FaInfinity, label: "Full schedule" },
  month: { icon: FaCalendarWeek, label: "This month's schedule" },
  today: { icon: FaCalendarDay, label: "Today's schedule" },
};

// 1. 개별 일정 아이템을 별도의 메모이즈된 컴포넌트로 분리합니다.
const ScheduleEventItem = React.memo(({ event, onDetail }) => {
  const now = new Date();
  // event.end가 없거나 유효하지 않은 경우 event.start를 사용
  const eventEnd = event.end ? new Date(event.end) : new Date(event.start);
  const isPast = eventEnd < now;

  // HH:mm 형식으로 시간을 포맷하는 함수
  const formatTime = (start) => {
    let startStr = start;
    if (start instanceof Date) {
      startStr = start.toISOString();
    }

    if (!startStr || !startStr.includes('T')) {
      return '00:00';
    }
    return startStr.split('T')[1].substring(0, 5);
  };

  return (
    <Tooltip title="Click to see details" placement="left">
      <EventItem onClick={() => onDetail(event)} $isPast={isPast}>
        <span>{event.title}</span>
        <span className="event-time">{event.allDay ? 'all-day' : formatTime(event.start)}</span>
      </EventItem>
    </Tooltip>
  );
});

const ScheduleList = ({
  allEvents,
  onAdd,
  onDetail,
  selectedDate,
  onClearSelectedDate,
  isInsideModal = false, // 모달 안에 있는지 여부를 prop으로 받음
}) => {
  // ✅ [수정] '오늘', '이번 달', '전체'를 전환하는 필터 상태. 기본값은 'today'.
  const [filterMode, setFilterMode] = useState("today");

  // ✅ [수정] props와 내부 필터 상태에 따라 보여줄 이벤트를 계산합니다.
  const filteredEvents = useMemo(() => {
    let events;

    // 1. 필터링
    if (selectedDate) {
      const selectedDayStart = new Date(`${selectedDate}T00:00:00`);
      const selectedDayEnd = new Date(`${selectedDate}T23:59:59`);

      events = allEvents.filter(event => {
        if (!event.start) return false;

        if (event.rrule && event.rrule.freq) {
          try {
            const options = { ...event.rrule };
            const freqMap = {
              'YEARLY': RRule.YEARLY, 'MONTHLY': RRule.MONTHLY, 'WEEKLY': RRule.WEEKLY,
              'DAILY': RRule.DAILY, 'HOURLY': RRule.HOURLY, 'MINUTELY': RRule.MINUTELY, 'SECONDLY': RRule.SECONDLY,
            };
            const freqString = event.rrule.freq.toUpperCase();
            if (!freqMap[freqString]) return false;

            options.freq = freqMap[freqString];
            options.dtstart = new Date(event.start); // dtstart는 event.start를 사용

            if (isNaN(options.dtstart.getTime())) return false;

            if (event.rrule.until) {
              const untilStr = event.rrule.until;
              options.until = new Date(untilStr.includes('T') ? untilStr : `${untilStr}T23:59:59`);
            }

            const rule = new RRule(options);
            const occurrences = rule.between(selectedDayStart, selectedDayEnd, true);
            return occurrences.length > 0;
          } catch (e) {
            return false;
          }
        }

        const eventStart = new Date(event.start);
        const eventEnd = event.end ? new Date(event.end) : eventStart;
        return eventStart <= selectedDayEnd && eventEnd > selectedDayStart;
      });
    } else {
      const now = new Date();
      switch (filterMode) {
        case "today": {
          const todayStr = now.toISOString().split("T")[0];
          events = allEvents.filter((e) => e.start?.startsWith(todayStr));
          break;
        }
        case "month": {
          const year = now.getFullYear();
          const month = String(now.getMonth() + 1).padStart(2, "0");
          const monthPrefix = `${year}-${month}`;
          events = allEvents.filter((e) => e.start?.startsWith(monthPrefix));
          break;
        }
        case "all":
          events = [...allEvents];
          break;
        default:
          events = [];
      }
    }

    // 2. 정렬 (시간순)
    return events.sort((a, b) => new Date(a.start) - new Date(b.start));
  }, [allEvents, selectedDate, filterMode]);

  // ✅ [수정] 상황에 맞는 제목을 동적으로 생성합니다.
  const title = useMemo(() => {
    // 1. 특정 날짜가 선택된 경우
    if (selectedDate) {
      const date = new Date(selectedDate + "T00:00:00"); // Use local timezone for consistency
      if (isNaN(date.getTime())) return "Date Information";

      const month = date.getMonth() + 1;
      const day = date.getDate();
      const dayOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][
        date.getDay()
      ];
      return `${month} / ${day} (${dayOfWeek})`;
    }
    // 2. 필터 모드에 따른 제목
    return FILTERS[filterMode]?.label || "Schedules";
  }, [selectedDate, filterMode]);

  const handleFilterClick = (mode) => {
    if (selectedDate) {
      onClearSelectedDate();
    }
    setFilterMode(mode);
  };

  // 표시할 필터 버튼들을 결정합니다.
  const renderFilterButtons = () => {
    // ✅ [수정] 특정 날짜가 선택된 경우에도 '이번 달'과 '오늘' 일정으로 바로 갈 수 있는 버튼을 표시합니다.
    if (selectedDate) {
      return ["month", "today"].map((key) => {
        const FilterIcon = FILTERS[key].icon;
        return (
          <Tooltip key={key} title={FILTERS[key].label} placement="bottom">
            <FilterButton onClick={() => handleFilterClick(key)}>
              <FilterIcon />
            </FilterButton>
          </Tooltip>
        );
      });
    }
    // 기본 목록 뷰에서는 현재 활성화된 필터를 제외한 나머지 버튼들을 표시합니다.
    return Object.keys(FILTERS)
      .filter((key) => key !== filterMode)
      .map((key) => {
        const FilterIcon = FILTERS[key].icon;
        return (
          <Tooltip key={key} title={FILTERS[key].label} placement="bottom">
            <FilterButton onClick={() => handleFilterClick(key)}>
              <FilterIcon />
            </FilterButton>
          </Tooltip>
        );
      });
  };

  const [file, setFile] = useState(null);
  const onFileChange = (e) => {
    setFile(e.target.files[0]);
  };
  const uploadHandler = async () => {
    if (!file) {
      alert("Please select a file.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await api.post("/api/firebase", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      alert("Upload successful: " + response.data);
    } catch (error) {
      console.error("Upload failed", error);
      alert("Upload failed");
    }
  };
  return (
    <ListWrapper isInsideModal={isInsideModal}>
      <ListHeader>
        <DateTitle>{title}</DateTitle>
        {/* 모달 안에서는 필터 버튼을 숨깁니다. */}
        {!isInsideModal && <FilterButtons>{renderFilterButtons()}</FilterButtons>}
      </ListHeader>

      {filteredEvents.length > 0 ? (
        <EventList>
          {filteredEvents.map((s) => (
            <ScheduleEventItem key={s.id} event={s} onDetail={onDetail} />
          ))}
        </EventList>
      ) : (
        <NoEventsMessage>There is no registered schedule.</NoEventsMessage>
      )}

      <ActionButtons>
        <Button className="primary" onClick={onAdd}>
          Add Schedule
        </Button>
      </ActionButtons>
    </ListWrapper>
  );
};

export default ScheduleList;
