import {useEffect, useMemo, useState} from "react";
// tool
import ScheduleList from "./schedule_tab/ScheduleList.jsx";
import ScheduleForm from "./schedule_tab/ScheduleForm.jsx";
import ScheduleEdit from "./schedule_tab/ScheduleEdit.jsx";
import ScheduleDetail from "./schedule_tab/ScheduleDetail.jsx";
import { useSchedule } from "../../contexts/ScheduleContext.jsx";
// components

const ScheduleTab = () => {
    const [mode, setMode] = useState("list"); // "list" | "create" | "edit"
    const [selectedId, setSelectedId] = useState(null);
    const [filteredDate, setFilteredDate] = useState(null); // ✅ 클릭된 날짜를 저장할 상태
    // ✅ Context에서 데이터와 모든 함수를 가져옴
    const {
        events,
        addEvent,
        updateEvent,
        deleteEvent,
        selectedInfo,
        closeSidebar
    } = useSchedule();

    // Context의 변경에 따라 내부 모드를 동기화합니다.
    useEffect(() => {
        if (selectedInfo) {
            // ✅ '날짜 목록 보기' 신호를 받았을 때
            if (selectedInfo.type === "list_for_date") {
                setMode("list"); // 목록 모드를 유지
                setFilteredDate(selectedInfo.data.startStr); // 선택된 날짜를 저장
            }
            // '상세 보기' 신호를 받았을 때
            else if (selectedInfo.type === "detail") {
                // FullCalendar의 event.id는 문자열이므로 그대로 사용합니다.
                setSelectedId(selectedInfo.data.id);
                setMode("detail");
                setFilteredDate(null); // 날짜 필터링은 해제
            }
        } else {
            // 사이드바가 닫히면 목록으로 돌아갑니다.
            setMode("list");
            setSelectedId(null);
            setFilteredDate(null); // 날짜 필터링도 해제
        }
    }, [selectedInfo]);

    // 모든 '취소' 또는 '닫기' 동작을 처리하는 함수
    // 이제 이 함수는 더 이상 내부 화면 전환에 사용되지 않습니다.
    const handleCancel = () => {
        // Context의 사이드바를 닫도록 신호를 보냅니다.
        closeSidebar();
    };

    const filteredEvents = useMemo(() => {
        if (!filteredDate) return events; // 날짜 필터가 없으면 전체 목록 반환
        // 선택된 날짜에 해당하는 이벤트만 필터링
        return events.filter(e => e.date === filteredDate || e.start?.startsWith(filteredDate));
    }, [events, filteredDate]);

    const selectedItem = useMemo(
        // FullCalendar의 id와 ScheduleTab의 no를 통일해야 합니다.
        () => events.find((s) => s.id === selectedId) || null,
        [events, selectedId]
    );
    
    return (
        <>
            {mode === "list" && (
                <ScheduleList
                    // ✅ 필터링된 이벤트를 전달
                    selectedDate={filteredDate}
                    schedules={filteredEvents}
                    onAdd={() => {
                        setMode("create");
                    }}
                    onDetail={(id) => {
                        setSelectedId(id);
                        setMode("detail");
                    }}
                />
            )}

            {mode === "create" && (
                <ScheduleForm
                    // ✅ 목록 보기에서 '추가'를 눌렀을 때, 필터링된 날짜를 전달
                    initialData={{ startStr: filteredDate }}
                    onCancel={() => setMode('list')} // 생성 취소는 목록으로 돌아갑니다.
                    onSave={(newData) => {
                        addEvent(newData); // ✅ Context의 함수 호출
                        // 저장 후 목록으로 돌아갑니다.
                        setMode('list');
                    }}
                />
            )}

            {mode === "edit" && (
                <ScheduleEdit
                    item={selectedItem}
                    onCancel={() => setMode('detail')} // 수정 취소는 상세 보기로 돌아갑니다.
                    onSave={(updated) => {
                        updateEvent(updated); // ✅ Context의 함수 호출
                        // 수정 후 상세 보기로 돌아갑니다.
                        setMode("detail");
                    }}
                />
            )}

            {mode === "detail" && (
                <ScheduleDetail
                    item={selectedItem}
                    onCancel={() => setMode('list')} // 상세 보기에서 "뒤로"는 목록으로 돌아갑니다.
                    onEdit={(id) => {
                        setSelectedId(id);
                        setMode("edit");
                    }}
                    onDelete={(id) => {
                        // id를 기준으로 이벤트를 삭제하도록 수정합니다.
                        deleteEvent(id); // ✅ Context의 함수 호출
                        setMode('list'); // 삭제 후 목록으로 돌아갑니다.
                    }}
                />
            )}


        </>
    );
};

export default ScheduleTab;