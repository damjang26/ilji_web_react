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
  // HH:mm 형식으로 시간을 포맷하는 함수
  const formatTime = (start) => {
    let startStr = start;
    // 방어 코드: start가 Date 객체인 경우, 문자열로 변환합니다.
    // 이는 낙관적 업데이트 시 또는 데이터 포맷이 일관되지 않을 때 발생할 수 있습니다.
    if (start instanceof Date) {
      startStr = start.toISOString();
    }

    if (!startStr || !startStr.includes('T')) {
      // all-day recurring events might not have a time part in their start string
      // which is the dtstart. Default to 00:00 in that case for display.
      return '00:00';
    }
    return startStr.split('T')[1].substring(0, 5);
  };

  return (
    <Tooltip title="Click to see details" placement="left">
      <EventItem onClick={() => {
        onDetail(event);
      }}>
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
    // 1. 캘린더에서 특정 날짜가 선택된 경우, 해당 날짜의 일정만 보여줍니다.
    if (selectedDate) {
      const selectedDayStart = new Date(`${selectedDate}T00:00:00`);
      const selectedDayEnd = new Date(`${selectedDate}T23:59:59`);

      return allEvents.filter(event => {
        if (!event.start) return false;

        // 반복 일정 처리 (기존 로직 유지)
        if (event.rrule && event.rrule.freq) {
          const options = { ...event.rrule };
          const freqMap = {
            'YEARLY': RRule.YEARLY, 'MONTHLY': RRule.MONTHLY, 'WEEKLY': RRule.WEEKLY,
            'DAILY': RRule.DAILY, 'HOURLY': RRule.HOURLY, 'MINUTELY': RRule.MINUTELY, 'SECONDLY': RRule.SECONDLY,
          };
          const freqString = event.rrule.freq.toUpperCase();
          if (!freqMap[freqString]) return false;
          options.freq = freqMap[freqString];
          options.dtstart = event.rrule.dtstart;
          if (event.rrule.until) {
            const untilStr = event.rrule.until;
            options.until = new Date(untilStr.includes('T') ? untilStr : `${untilStr}T23:59:59`);
          }
          const rule = new RRule(options);
          const occurrences = rule.between(selectedDayStart, selectedDayEnd, true);
          return occurrences.length > 0;
        }

        // 비반복 일정에 대한 통합 처리 (시간 지정, 하루 종일, 여러 날 모두 포함)
        const eventStart = new Date(event.start);
        // event.end가 없는 경우(예: API 데이터 이상)를 대비하여 event.start로 대체
        const eventEnd = event.end ? new Date(event.end) : eventStart;

        // 두 기간 [A, B)와 [C, D)가 겹치는지 확인하는 표준 공식: (A < D && B > C)
        // 여기서 우리 로직은 [selectedDayStart, selectedDayEnd] 와 [eventStart, eventEnd) 의 교차점을 찾습니다.
        // FullCalendar의 all-day 이벤트는 종료일이 포함되지 않으므로(exclusive), 이 로직이 정확합니다.
        return eventStart <= selectedDayEnd && eventEnd > selectedDayStart;
      });
    }

    // 2. 특정 날짜가 선택되지 않은 경우, '오늘' 또는 '이번 달' 필터를 적용합니다.
    const now = new Date();
    switch (filterMode) {
      case "today": {
        const todayStr = now.toISOString().split("T")[0];
        // start가 오늘 날짜로 시작하는 모든 이벤트를 포함
        return allEvents.filter((e) => e.start?.startsWith(todayStr));
      }
      case "month": {
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, "0");
        const monthPrefix = `${year}-${month}`;
        // start가 해당 월로 시작하는 모든 이벤트를 포함
        return allEvents.filter((e) => e.start?.startsWith(monthPrefix));
      }
      case "all":
        return allEvents;
      default:
        return [];
    }
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
