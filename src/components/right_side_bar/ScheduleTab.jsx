import { useState, useCallback } from "react";
import ScheduleList from "./schedule_tab/ScheduleList.jsx";
import ScheduleDetail from "./schedule_tab/ScheduleDetail.jsx"; // ScheduleDetail을 import 합니다.
import { useSchedule } from "../../contexts/ScheduleContext.jsx";
import { TabWrapper } from "../../styled_components/right_side_bar/ScheduleTabStyled.jsx";

const ScheduleTab = () => {
    const {
        events,
        openSchedulePanelForNew,
        // openSchedulePanelForDetail, // 더 이상 사용하지 않으므로 주석 처리 또는 삭제
        deleteSchedule, // 삭제 함수를 context에서 가져옵니다 (가정)
        updateSchedule, // 수정 함수를 context에서 가져옵니다 (가정)
    } = useSchedule();

    // 1. 선택된 이벤트를 관리할 상태를 추가합니다. null이면 목록, 값이 있으면 상세 정보를 표시합니다.
    const [selectedEvent, setSelectedEvent] = useState(null);

    const handleAdd = useCallback(() => {
        const today = new Date().toISOString().split('T')[0];
        openSchedulePanelForNew({ startStr: today, endStr: today, allDay: true });
    }, [openSchedulePanelForNew]);

    // 2. 목록에서 아이템 클릭 시, 전역 패널을 여는 대신 selectedEvent 상태를 업데이트합니다.
    const handleShowDetail = useCallback((event) => {
        setSelectedEvent(event);
    }, []);

    // 3. 상세 보기에서 '목록으로' 버튼 클릭 시, selectedEvent를 null로 만들어 목록으로 돌아갑니다.
    const handleBackToList = useCallback(() => {
        setSelectedEvent(null);
    }, []);

    // 상세 보기의 삭제/수정 처리 (Context의 함수를 호출하고 목록으로 돌아감)
    const handleDelete = useCallback(async (eventId) => {
        if (window.confirm("정말로 이 일정을 삭제하시겠습니까?")) {
            // await deleteSchedule(eventId); // context의 삭제 함수 호출
            handleBackToList(); // 목록으로 돌아가기
        }
    }, [handleBackToList]);

    const handleEdit = useCallback((event) => {
        // 수정 로직 (예: 수정 폼을 연다)
        console.log("수정할 이벤트:", event);
        // 수정 패널을 여는 로직을 여기에 구현할 수 있습니다.
        // 예: openSchedulePanelForEdit(event);
        handleBackToList(); // 일단 목록으로 돌아가기
    }, [handleBackToList]);


    return (
        <TabWrapper>
            {/* 4. selectedEvent 상태에 따라 조건부 렌더링 */}
            {selectedEvent ? (
                <ScheduleDetail
                    event={selectedEvent}
                    onCancel={handleBackToList} // "목록으로" 버튼에 handleBackToList 함수 연결
                    onDelete={handleDelete}
                    onEdit={handleEdit}
                />
            ) : (
                <ScheduleList
                    allEvents={events}
                    onAdd={handleAdd}
                    onDetail={handleShowDetail} // 목록 아이템 클릭 시 handleShowDetail 함수 연결
                />
            )}
        </TabWrapper>
    );
};

export default ScheduleTab;