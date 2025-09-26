import { useState, useCallback, useEffect } from "react";
import ScheduleList from "./schedule_tab/ScheduleList.jsx";
import ScheduleDetail from "./schedule_tab/ScheduleDetail.jsx"; // ScheduleDetail을 import 합니다.
import { useSchedule } from "../../contexts/ScheduleContext.jsx";
import { TabWrapper } from "../../styled_components/right_side_bar/ScheduleTabStyled.jsx";

const ScheduleTab = ({ isInsideModal = false, initialEvent = null }) => {
    const {
        events,
        selectedInfo, // 날짜 정보를 위해 selectedInfo 가져오기
        openSchedulePanelForNew,
        openSchedulePanelForEdit, // 수정 패널을 여는 함수 가져오기
        switchToModalFormView, // 모달 뷰 전환 함수 가져오기
    } = useSchedule();

    // 1. 선택된 이벤트를 관리할 상태를 추가합니다. null이면 목록, 값이 있으면 상세 정보를 표시합니다.
    const [selectedEvent, setSelectedEvent] = useState(null);

    // prop으로 받은 initialEvent가 있으면 상세 보기 상태로 설정합니다.
    useEffect(() => {
        if (initialEvent) {
            setSelectedEvent(initialEvent);
        }
    }, [initialEvent]);

    const handleAdd = useCallback(() => {
        const today = new Date().toISOString().split('T')[0];
        const dateInfo = { startStr: today, endStr: today, allDay: true };

        if (isInsideModal) {
            // 모달 안에서는 모달의 뷰를 '폼'으로 변경
            switchToModalFormView(dateInfo);
        } else {
            // 사이드 패널에서는 기존 방식대로 패널 열기
            openSchedulePanelForNew(dateInfo);
        }
    }, [isInsideModal, openSchedulePanelForNew, switchToModalFormView]);

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
        if (window.confirm("Are you sure you want to delete this schedule?")) {
            // await deleteSchedule(eventId); // context의 삭제 함수 호출
            handleBackToList(); // 목록으로 돌아가기
        }
    }, [handleBackToList]);

    const handleEdit = useCallback((event) => {
        if (isInsideModal) {
            // 모달 안에서는 모달의 뷰를 '폼'으로 변경
            switchToModalFormView(event);
        } else {
            // 사이드 패널에서는 기존 방식대로 패널 열기
            openSchedulePanelForEdit(event);
        }
    }, [isInsideModal, switchToModalFormView, openSchedulePanelForEdit]);


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
                    selectedDate={selectedInfo?.data?.startStr} // 선택된 날짜 정보를 prop으로 전달
                    isInsideModal={isInsideModal} // 모달 안에 있는지 여부 전달
                />
            )}
        </TabWrapper>
    );
};

export default ScheduleTab;