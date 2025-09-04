import React, { useState, useMemo } from 'react';
import { FaCalendarDay, FaCalendarWeek, FaInfinity } from 'react-icons/fa';
import { Tooltip } from 'antd';
import {
    DateTitle,
    EventItem,
    EventList,
    FilterButton,
    FilterButtons,
    ListHeader,
    ListWrapper,
    NoEventsMessage
} from "../../../styled_components/right_side_bar/schedule_tab/ScheduleListStyled.jsx";
import { ActionButtons, Button } from "../../../styled_components/common/FormElementsStyled.jsx";
import axios from "axios";
import {api} from "../../../api.js";

const FILTERS = {
    all: { icon: FaInfinity, label: "전체 일정" },
    month: { icon: FaCalendarWeek, label: "이번 달 일정" },
    today: { icon: FaCalendarDay, label: "오늘 일정" },
};

// 1. 개별 일정 아이템을 별도의 메모이즈된 컴포넌트로 분리합니다.
const ScheduleEventItem = React.memo(({ event, onDetail }) => {
    return (
        <Tooltip title="클릭하면 상세 보기" placement="left">
            <EventItem onClick={() => onDetail(event)}>
                {event.title}
            </EventItem>
        </Tooltip>
    );
});

const ScheduleList = ({ allEvents, onAdd, onDetail, selectedDate, onClearSelectedDate }) => {
    // ✅ [수정] '오늘', '이번 달', '전체'를 전환하는 필터 상태. 기본값은 'today'.
    const [filterMode, setFilterMode] = useState('today');

    // ✅ [수정] props와 내부 필터 상태에 따라 보여줄 이벤트를 계산합니다.
    const filteredEvents = useMemo(() => {
        // 1. 캘린더에서 특정 날짜가 선택된 경우, 해당 날짜의 일정만 보여줍니다.
        if (selectedDate) {
            return allEvents.filter(e => e.start?.startsWith(selectedDate));
        }

        // 2. 특정 날짜가 선택되지 않은 경우, '오늘' 또는 '이번 달' 필터를 적용합니다.
        const now = new Date();
        switch (filterMode) {
            case 'today':
                { const todayStr = now.toISOString().split('T')[0];
                return allEvents.filter(e => e.start?.startsWith(todayStr)); }
            case 'month':
                { const year = now.getFullYear();
                const month = String(now.getMonth() + 1).padStart(2, '0');
                const monthPrefix = `${year}-${month}`;
                return allEvents.filter(e => e.start?.startsWith(monthPrefix)); }
            case 'all':
                return allEvents;
            default:
                return [];
        }
    }, [allEvents, selectedDate, filterMode]);

    // ✅ [수정] 상황에 맞는 제목을 동적으로 생성합니다.
    const title = useMemo(() => {
        // 1. 특정 날짜가 선택된 경우
        if (selectedDate) {
            const date = new Date(selectedDate + 'T00:00:00Z');
            if (isNaN(date.getTime())) return "날짜 정보";

            const month = date.getUTCMonth() + 1;
            const day = date.getUTCDate();
            const dayOfWeek = ["일", "월", "화", "수", "목", "금", "토"][date.getUTCDay()];
            return `${month} / ${day} ${dayOfWeek}요일`;
        }
        // 2. 필터 모드에 따른 제목
        return FILTERS[filterMode]?.label || "일정";
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
            return ['month', 'today'].map(key => {
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
            .filter(key => key !== filterMode)
            .map(key => {
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
            alert("파일을 선택하세요.");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await api.post('/api/firebase', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            alert("업로드 성공: " + response.data);
        } catch (error) {
            console.error("업로드 실패", error);
            alert("업로드 실패");

        }
    }
    return (
        <ListWrapper>
            <ListHeader>
                <DateTitle>{title}</DateTitle>
                <FilterButtons>{renderFilterButtons()}</FilterButtons>
            </ListHeader>

            {filteredEvents.length > 0 ? (
                <EventList>
                    {filteredEvents.map((s) => (
                        <ScheduleEventItem key={s.id} event={s} onDetail={onDetail} />
                    ))}
                </EventList>
            ) : (
                <NoEventsMessage>등록된 일정이 없습니다.</NoEventsMessage>
            )}

            <ActionButtons>
                <Button className="primary" onClick={onAdd}>일정 추가</Button>
            </ActionButtons>

            {/*<div>mz-section (firebase file upload)*/}
            {/*    <input type="file" onChange={onFileChange} />*/}
            {/*    <button onClick={uploadHandler}>upload</button>*/}
            {/*</div>*/}
        </ListWrapper>
    )
}

export default ScheduleList;