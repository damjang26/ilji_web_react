import { useEffect, useMemo, useState } from "react";
import ScheduleList from "./schedule_tab/ScheduleList.jsx";
import ScheduleForm from "./schedule_tab/ScheduleForm.jsx";
import ScheduleDetail from "./schedule_tab/ScheduleDetail.jsx";
import { useSchedule } from "../../contexts/ScheduleContext.jsx";
import { TabWrapper } from "../../styled_components/right_side_bar/ScheduleTabStyled.jsx";

const ScheduleTab = () => {
    const [filteredDate, setFilteredDate] = useState(null);

    const {
        events,
        requestDeleteConfirmation, // ✅ [수정] 중앙화된 삭제 요청 함수를 가져옵니다.
        selectedInfo,
        openSidebarForNew,
        openSidebarForDetail,
        openSidebarForEdit,
        goBackInSidebar, // ✅ [수정] '뒤로가기' 로직을 처리하는 함수를 가져옵니다.
    } = useSchedule();

    const mode = selectedInfo?.type || 'list';
    const selectedItem = useMemo(() => {
        if ((mode === 'detail' || mode === 'edit') && selectedInfo?.data) {
            return selectedInfo.data;
        }
        return null;
    }, [mode, selectedInfo]);

    // ✅ 렌더링 시점에 displayDate를 직접 계산하여 상태 업데이트 지연 문제를 원천적으로 방지합니다.
    const displayDate = useMemo(() => {
        if (selectedInfo?.type === 'list_for_date') {
            return selectedInfo.data.startStr;
        }

        if (selectedInfo?.type === 'detail' || selectedInfo?.type === 'edit') {
            const event = selectedInfo.data;
            if (event?.start) {
                // ✅ [수정] toISOString()은 UTC 기준으로 변환하므로, 로컬 시간대 기준으로 날짜를 포맷합니다.
                if (event.start instanceof Date) {
                    const d = new Date(event.start);
                    const year = d.getFullYear();
                    const month = String(d.getMonth() + 1).padStart(2, '0');
                    const day = String(d.getDate()).padStart(2, '0');
                    return `${year}-${month}-${day}`;
                }
                return String(event.start).split('T')[0]; // 문자열인 경우 그대로 사용
            }
        }

        return null;
    }, [selectedInfo]);

    useEffect(() => {
        // 이 useEffect는 이제 '날짜별 목록' 모드에서 사용되는 filteredDate 상태만 관리합니다.
        if (selectedInfo?.type === 'list_for_date') {
            setFilteredDate(selectedInfo.data.startStr);
        } else if (selectedInfo?.type === 'list' || !selectedInfo) {
            setFilteredDate(null);
        }
    }, [selectedInfo]);

    const handleClearSelectedDate = () => {
        setFilteredDate(null);
    };

    const handleAdd = () => {
        const date = filteredDate || new Date().toISOString().split('T')[0];
        openSidebarForNew({ startStr: date, endStr: date, allDay: true });
    };

    const renderContent = () => {
        switch (mode) {
            case 'new':
            case 'edit':
                // ✅ 'new'와 'edit' 모드 모두 props 없이 ScheduleForm을 렌더링합니다.
                return <ScheduleForm />;
            case 'detail':
                return <ScheduleDetail
                    item={selectedItem}
                    displayDate={displayDate}
                    onCancel={goBackInSidebar} // ✅ [수정] '뒤로가기' 버튼에 올바른 함수를 연결합니다.
                    onEdit={openSidebarForEdit}
                    onDelete={requestDeleteConfirmation} // ✅ [수정] Context의 함수를 직접 전달합니다.
                />;
            case 'list_for_date':
            case 'list':
            default:
                return <ScheduleList
                    selectedDate={filteredDate}
                    allEvents={events} // ✅ [수정] 필터링되지 않은 전체 이벤트를 전달합니다.
                    onAdd={handleAdd} // ✅ [수정] 오늘 또는 선택된 날짜로 일정을 추가하는 핸들러를 전달합니다.
                    onDetail={openSidebarForDetail}
                    onClearSelectedDate={handleClearSelectedDate} // ✅ [신규] 날짜 선택을 해제하는 함수 전달
                />;
        }
    }

    return (
        <TabWrapper>
            {renderContent()}
        </TabWrapper>
    );
};

export default ScheduleTab;
