import { useEffect, useMemo, useState } from "react";
import ScheduleList from "./schedule_tab/ScheduleList.jsx";
import ScheduleForm from "./schedule_tab/ScheduleForm.jsx";
import ScheduleEdit from "./schedule_tab/ScheduleEdit.jsx";
import ScheduleDetail from "./schedule_tab/ScheduleDetail.jsx";
import { useSchedule } from "../../contexts/ScheduleContext.jsx";
import ConfirmModal from "../common/ConfirmModal.jsx";
import { TabWrapper } from "../../styled_components/right_side_bar/ScheduleTabStyled.jsx";

const ScheduleTab = () => {
    const [filteredDate, setFilteredDate] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);

    const {
        events,
        addEvent,
        updateEvent,
        deleteEvent,
        selectedInfo,
        openSidebarForNew,
        openSidebarForDetail,
        openSidebarForEdit,
        closeSidebar,
    } = useSchedule();

    const mode = selectedInfo?.type || 'list';
    const selectedItem = useMemo(() => {
        if ((mode === 'detail' || mode === 'edit') && selectedInfo?.data) {
            return selectedInfo.data;
        }
        return null;
    }, [mode, selectedInfo]);

    useEffect(() => {
        if (selectedInfo?.type === 'list_for_date') {
            setFilteredDate(selectedInfo.data.startStr);
        } else {
            setFilteredDate(null);
        }
    }, [selectedInfo]);

    const handleClearSelectedDate = () => {
        setFilteredDate(null);
    };

    const handleReturnToList = () => {
        closeSidebar();
    };

    const handleReturnToDetail = () => {
        if (selectedItem) {
            openSidebarForDetail(selectedItem);
        }
    };

    const handleDeleteRequest = (id) => {
        setItemToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = () => {
        if (itemToDelete) {
            deleteEvent(itemToDelete);
            handleReturnToList();
        }
        setIsDeleteModalOpen(false);
        setItemToDelete(null);
    };

    const handleAdd = () => {
        const date = filteredDate || new Date().toISOString().split('T')[0];
        openSidebarForNew({ startStr: date, endStr: date, allDay: true });
    };

    const renderContent = () => {
        switch (mode) {
            case 'new':
                return <ScheduleForm
                    initialData={selectedInfo?.data}
                    onCancel={handleReturnToList}
                    onSave={(newData) => {
                        addEvent(newData);
                        handleReturnToList();
                    }}
                />;
            case 'edit':
                return <ScheduleEdit
                    item={selectedItem}
                    onCancel={handleReturnToDetail}
                    onSave={(updated) => {
                        updateEvent(updated);
                        handleReturnToList();
                    }}
                />;
            case 'detail':
                return <ScheduleDetail
                    item={selectedItem}
                    onCancel={handleReturnToList}
                    onEdit={openSidebarForEdit} // 이제 event 객체를 직접 넘깁니다.
                    onDelete={handleDeleteRequest}
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
            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title="일정 삭제"
            >
                정말로 이 일정을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </ConfirmModal>
        </TabWrapper>
    );
};

export default ScheduleTab;
