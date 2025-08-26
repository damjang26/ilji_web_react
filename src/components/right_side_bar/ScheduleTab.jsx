import {useEffect, useMemo, useState} from "react";
// tool
import ScheduleList from "./schedule_tab/ScheduleList.jsx";
import ScheduleForm from "./schedule_tab/ScheduleForm.jsx";
import ScheduleEdit from "./schedule_tab/ScheduleEdit.jsx";
import ScheduleDetail from "./schedule_tab/ScheduleDetail.jsx";
import { useSchedule } from "../../contexts/ScheduleContext.jsx";
import { TabWrapper } from "../../styled_components/right_side_bar/ScheduleTabStyled.jsx";
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
        // [디버깅] selectedInfo가 변경될 때마다 로그를 출력하여 상태를 추적합니다.
        console.log('[ScheduleTab] selectedInfo changed:', selectedInfo);

        if (selectedInfo) {
            // ✅ '날짜 목록 보기' 신호를 받았을 때
            if (selectedInfo.type === "list_for_date") {
                console.log('[ScheduleTab] Mode change -> list');
                setMode("list"); // 목록 모드를 유지
                setFilteredDate(selectedInfo.data.startStr); // 선택된 날짜를 저장
            }
            // ✅ [핵심 수정] '새 일정 추가' 신호를 받았을 때 (캘린더에서 드래그)
            else if (selectedInfo.type === "new") {
                console.log('[ScheduleTab] Mode change -> create');
                setMode("create"); // 생성 모드로 변경
                setSelectedId(null); // 기존 선택된 ID는 초기화
                setFilteredDate(null); // 날짜 필터링도 초기화
            }
            // '상세 보기' 신호를 받았을 때
            else if (selectedInfo.type === "detail") {
                console.log('[ScheduleTab] Mode change -> detail');
                // FullCalendar의 event.id는 문자열이므로 그대로 사용합니다.
                setSelectedId(selectedInfo.data.id);
                setMode("detail");
                setFilteredDate(null); // 날짜 필터링은 해제
            }
        } else {
            // 사이드바가 닫히면 목록으로 돌아갑니다.
            console.log('[ScheduleTab] Sidebar closed, resetting mode.');
            setMode("list");
            setSelectedId(null);
            setFilteredDate(null); // 날짜 필터링도 해제
        }
    }, [selectedInfo]);

    // 모든 '취소' 또는 '닫기' 동작을 처리하는 함수
    const filteredEvents = useMemo(() => {
        if (!filteredDate) return events; // 날짜 필터가 없으면 전체 목록 반환
        // 선택된 날짜에 해당하는 이벤트만 필터링
        return events.filter(e => e.date === filteredDate || e.start?.startsWith(filteredDate));
    }, [events, filteredDate]);

    const selectedItem = useMemo(
        // FullCalendar의 id와 ScheduleTab의 no를 통일해야 합니다.
        // FullCalendar의 id(문자열)와 List의 id(숫자) 모두를 처리하기 위해
        // 타입 변환을 허용하는 '==' 비교 연산자를 사용합니다.
        () => events.find((s) => s.id == selectedId) || null,
        [events, selectedId]
    );
    
    return (
        <TabWrapper>
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
                    // [수정] Context의 selectedInfo.data를 initialData로 전달합니다.
                    // 이렇게 하면 캘린더에서 드래그하여 생성할 때 날짜 범위가 자동으로 채워집니다.
                    initialData={selectedInfo?.data}
                    onCancel={closeSidebar} // 생성 취소 시 사이드바를 닫습니다.
                    onSave={(newData) => {
                        addEvent(newData); // ✅ Context의 함수 호출
                        // 저장 후 사이드바를 닫습니다.
                        closeSidebar();
                    }}
                />
            )}

            {mode === "edit" && (
                <ScheduleEdit
                    item={selectedItem}
                    onCancel={closeSidebar} // 수정 취소 시 사이드바를 닫습니다.
                    onSave={(updated) => {
                        updateEvent(updated); // ✅ Context의 함수 호출
                        // 수정 후 사이드바를 닫습니다.
                        closeSidebar();
                    }}
                />
            )}

            {mode === "detail" && (
                <ScheduleDetail
                    item={selectedItem}
                    onCancel={closeSidebar} // 상세 보기에서 "뒤로"는 사이드바를 닫습니다.
                    onEdit={(id) => {
                        setSelectedId(id);
                        setMode("edit");
                    }}
                    onDelete={(id) => {
                        // id를 기준으로 이벤트를 삭제하도록 수정합니다.
                        deleteEvent(id); // ✅ Context의 함수 호출
                        // 삭제 후 사이드바를 닫습니다.
                        closeSidebar();
                    }}
                />
            )}


        </TabWrapper>
    );
};

export default ScheduleTab;