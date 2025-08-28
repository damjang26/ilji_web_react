import React, { useState, useMemo, useRef, useLayoutEffect, useEffect } from 'react';
import styled from 'styled-components';
import { Tooltip } from 'antd';
import { FaTimes, FaPlus, FaEdit, FaTrash, FaArrowLeft } from 'react-icons/fa';
import { useSchedule } from '../../../../contexts/ScheduleContext.jsx';
import { useTags } from '../../../../contexts/TagContext.jsx';
import ScheduleForm from '../../../right_side_bar/schedule_tab/ScheduleForm.jsx';
import ScheduleEdit from '../../../right_side_bar/schedule_tab/ScheduleEdit.jsx';


// --- Styled Components ---
const PopupWrapper = styled.div`
    position: fixed;
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
    z-index: 1100;
    width: 340px;
    padding: 12px;
    transition: opacity 0.15s ease-in-out, visibility 0.15s ease-in-out;
    opacity: ${({ $visible }) => ($visible ? 1 : 0)};
    visibility: ${({ $visible }) => ($visible ? 'visible' : 'hidden')};
    color: #333;
    /* ✅ 위치 계산 로직이 left, top을 직접 제어하므로 transform은 제거합니다. */
`;

const PopupHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
    padding-bottom: 10px;
    border-bottom: 1px solid #eee;
    & > span { font-size: 16px; font-weight: 600; color: #555; }
`;

const HeaderButton = styled.button`
    background: none; border: none; cursor: pointer; font-size: 18px;
    color: #888; padding: 4px; line-height: 1;
    &:hover { color: #333; }
`;

const ContentWrapper = styled.div`
    max-height: 70vh;
    overflow-y: auto;
    padding-right: 5px;
    margin-right: -5px;
`;

const EventList = styled.ul`
    list-style: none; padding: 0; margin: 0 0 12px 0;
`;

const EventItem = styled.li`
    display: flex; justify-content: space-between; align-items: center;
    padding: 8px 4px; border-bottom: 1px solid #f5f5f5; font-size: 14px;
    cursor: pointer;
    &:hover { background-color: #f9f9f9; }
    &:last-child { border-bottom: none; }
`;

const EventTitle = styled.span` flex-grow: 1; `;
const EventActions = styled.div` display: flex; gap: 8px; `;
const ActionButton = styled.button`
    background: none; border: none; cursor: pointer; color: #999;
    &:hover { color: #333; }
`;

const AddButton = styled.button`
    width: 100%; background-color: #f7f7f7; border: 1px dashed #ccc;
    border-radius: 6px; padding: 8px; cursor: pointer; color: #555;
    display: flex; align-items: center; justify-content: center; gap: 8px; font-size: 14px;
    &:hover { background-color: #eee; border-color: #bbb; }
`;

const NoEventsMessage = styled.p` text-align: center; color: #888; font-size: 14px; padding: 20px 0; `;

const DetailContent = styled.div`
    padding: 10px;
    font-size: 14px;
    line-height: 1.6;
`;

// --- Sub-components for different modes ---

const EventListView = ({ events, onAdd, onDetail, onDelete }) => (
    <>
        <EventList>
            {events.length > 0 ? (
                events.map(event => (
                    <EventItem key={event.id} onClick={() => onDetail(event)}>
                        <EventTitle>{event.title}</EventTitle>
                        <EventActions>
                            <Tooltip title="삭제" placement="top">
                                <ActionButton onClick={(e) => { e.stopPropagation(); onDelete(event.id); }}>
                                    <FaTrash />
                                </ActionButton>
                            </Tooltip>
                        </EventActions>
                    </EventItem>
                ))
            ) : (
                <NoEventsMessage>일정이 없습니다.</NoEventsMessage>
            )}
        </EventList>
        <AddButton onClick={onAdd}><FaPlus /> 일정 추가</AddButton>
    </>
);

const DetailView = ({ event, onEdit }) => (
    <DetailContent>
        <h4>{event.title}</h4>
        <p>{event.extendedProps?.description || '설명 없음'}</p>
        <AddButton onClick={() => onEdit(event)}>수정</AddButton>
    </DetailContent>
);


// --- Main Popup Component ---
const SchedulePopUp = () => {
    // --- Global State ---
    const {
        events,
        popupState,
        closePopup,
        addEvent,
        updateEvent,
        deleteEvent,
        openSidebarForNew,
        openSidebarForEdit,
        openSidebarForDetail,
        openSidebarForDate, // ✅ 사이드바의 리스트 뷰를 제어하기 위해 추가
        selectedInfo,       // ✅ 사이드바의 상태를 감지하기 위해 추가
    } = useSchedule();
    const { tags } = useTags();

    // --- ✅ 팝업 내부의 화면 전환을 위한 독립적인 상태 ---
    const [viewMode, setViewMode] = useState('list'); // 'list', 'detail', 'form'
    const [currentItem, setCurrentItem] = useState(null); // For detail/edit
    const [position, setPosition] = useState({ top: 0, left: 0 });
    const popupRef = useRef(null);

    const { isOpen, data: popupData } = popupState;
    const date = popupData?.date;

    // ✅ [수정] 팝업의 뷰(list, detail, form)를 결정하는 로직을 하나로 통합합니다.
    // 이 효과는 팝업이 열리거나 사이드바의 상태가 바뀔 때, 팝업의 뷰를 올바르게 설정하여
    // 두 컴포넌트의 상태를 동기화합니다. useLayoutEffect를 사용하여 화면 깜빡임을 방지합니다.
    useLayoutEffect(() => {
        // 팝업이 닫혀있거나, 동기화의 기준이 되는 사이드바 정보가 없으면 아무것도 하지 않습니다.
        if (!isOpen || !selectedInfo) {
            return;
        }

        switch (selectedInfo.type) {
            case 'list_for_date':
                // '목록 보기'는 팝업의 날짜와 일치할 때만 동기화합니다.
                if (date === selectedInfo.data?.startStr) {
                    setViewMode('list');
                    setCurrentItem(null);
                }
                break;
            case 'detail':
                // '상세 보기'는 항상 동기화합니다.
                setViewMode('detail');
                setCurrentItem(selectedInfo.data);
                break;
            case 'new':
                // '새 일정' 폼은 팝업의 날짜와 일치할 때만 동기화합니다.
                if (date === selectedInfo.data?.startStr) {
                    setViewMode('form');
                    setCurrentItem(null);
                }
                break;
            case 'edit':
                // '수정' 폼은 항상 동기화합니다.
                setViewMode('form');
                setCurrentItem(selectedInfo.data);
                break;
            default:
                // 의도하지 않은 type에 대해서는 아무것도 하지 않습니다.
                break;
        }
    }, [isOpen, selectedInfo, date]);

    // ✅ 2. 위치를 계산하고 조정합니다.
    // 이 효과는 위의 효과로 인해 viewMode가 'list'로 설정된 *후*의 렌더링 사이클에서 정확한 높이를 측정합니다.
    useLayoutEffect(() => {
        const popupEl = popupRef.current;
        // 팝업이 닫혀있지 않고, 위치 계산에 필요한 모든 정보가 있을 때만 실행합니다.
        if (!isOpen || !popupEl || !popupData?.targetRect) {
            return;
        }

        // ✅ [수정] 위치 계산 로직을 단순화하고 통합합니다.
        // 이제 viewMode에 관계없이 항상 최적의 위치를 계산합니다.
        const { targetRect } = popupData;
        const popupWidth = popupEl.offsetWidth;
        const popupHeight = popupEl.offsetHeight;
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        const margin = 10;

        let newTop, newLeft;

        // 세로 위치 계산: 화면 중앙을 기준으로 위/아래를 결정합니다.
        if (targetRect.top > windowHeight / 2) {
            newTop = targetRect.top - popupHeight - margin;
        } else {
            newTop = targetRect.bottom + margin;
        }

        // 가로 위치 계산: 화면 중앙을 기준으로 좌/우를 결정합니다.
        if (targetRect.left > windowWidth / 2) {
            newLeft = targetRect.right - popupWidth;
        } else {
            newLeft = targetRect.left;
        }

        // 화면 밖으로 나가지 않도록 최종 조정
        newTop = Math.max(margin, Math.min(newTop, windowHeight - popupHeight - margin));
        newLeft = Math.max(margin, Math.min(newLeft, windowWidth - popupWidth - margin));

        // 계산된 위치가 현재 위치와 다를 경우에만 업데이트하여 무한 루프를 방지합니다.
        if (newTop !== position.top || newLeft !== position.left) {
            setPosition({ top: newTop, left: newLeft });
        }
    }, [isOpen, popupData, viewMode, events, currentItem]); // ✅ currentItem을 추가하여 내용 변경 시 위치를 다시 계산하도록 수정

    // ✅ [추가] '팝업 외부 클릭'을 감지하여 팝업을 닫는 로직
    useEffect(() => {
        // 팝업이 닫혀있으면 아무것도 하지 않습니다.
        if (!isOpen) return;

        const handleClickOutside = (event) => {
            // 클릭된 요소가 팝업 내부에 있으면 무시합니다.
            if (popupRef.current && popupRef.current.contains(event.target)) {
                return;
            }

            // ✅ [수정] 팝업을 닫지 말아야 할 '안전지대' 목록을 정의합니다.
            // 캘린더, 사이드바, 다른 팝업 등 기능이 있는 영역을 클릭했을 때는 팝업이 닫히지 않습니다.
            const safeZones = [
            // ✅ [수정] 이제 각 컴포넌트가 이벤트 전파를 스스로 막으므로,
            //    팝업은 캘린더의 기본 요소들만 '안전지대'로 인지하면 됩니다.
                '.fc-event',           // 캘린더 이벤트
                '.fc-daygrid-day',     // 캘린더 날짜 칸
                '.fc-timegrid-slot',   // 캘린더 시간 칸
                '.fc-header-toolbar',  // 캘린더 헤더 (이전/다음, 뷰 전환 버튼)
            ].join(', ');

            if (event.target.closest(safeZones)) {
                return;
            }

            // 위의 모든 조건에 해당하지 않으면 '외부 클릭'으로 간주하고 팝업을 닫습니다.
            closePopup();
        };

        // mousedown 이벤트를 사용하여 클릭 즉시 반응하도록 합니다.
        document.addEventListener('mousedown', handleClickOutside);

        // 컴포넌트가 언마운트되거나, isOpen 상태가 바뀔 때 리스너를 정리합니다.
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, closePopup]);

    // ✅ [수정] Rules of Hooks 위반을 막기 위해 useMemo를 조건부 렌더링(return null) 앞으로 이동합니다.
    const eventsForDay = useMemo(() => {
        // 팝업이 닫혀있거나 날짜 정보가 없으면 필터링하지 않습니다.
        if (!isOpen || !date) return [];
        return events.filter(event => event.start?.startsWith(date))
    }, [isOpen, date, events]);



    if (!isOpen) {
        return null;
    }

    // --- ✅ 팝업 내부 동작 및 사이드바 연동 핸들러 ---
    const handleBackToList = () => {
        // 1. 팝업의 view를 list로 변경합니다.
        setViewMode('list');
        setCurrentItem(null);
        // 2. ✅ 동시에 사이드바도 해당 날짜의 리스트 뷰로 변경합니다.
        if (date) {
            openSidebarForDate({ startStr: date });
        }
    };
    const handleShowDetail = (item) => {
        // 1. 팝업의 view를 detail로 변경합니다.
        setCurrentItem(item);
        setViewMode('detail');
        // 2. ✅ 동시에 사이드바를 열고 상세 정보를 보여줍니다.
        openSidebarForDetail(item);
    };

    const handleShowForm = (item = null) => {
        // 1. 팝업의 view를 form으로 변경합니다.
        setCurrentItem(item);
        setViewMode('form');

        // 2. 동시에 사이드바를 엽니다.
        if (item) {
            // 기존 일정을 수정하는 경우
            openSidebarForEdit(item);
        } else {
            // 새 일정을 추가하는 경우
            openSidebarForNew({ startStr: date, endStr: date, allDay: true });
        }
    };

    const handleSave = (data) => {
        if (currentItem?.id) {
            updateEvent({ ...data, id: currentItem.id });
        } else {
            addEvent(data);
        }
        handleBackToList();
    };

    const handleDelete = (id) => {
        deleteEvent(id);
        // 삭제 후에는 항상 목록 보기로 돌아갑니다.
        handleBackToList();
    };

    const renderContent = () => {
        switch (viewMode) {
            case 'form':
                const FormComponent = currentItem?.id ? ScheduleEdit : ScheduleForm;
                const formProps = {
                    tags: tags,
                    onCancel: handleBackToList,
                    onSave: handleSave,
                    ...(currentItem?.id
                        ? { item: currentItem }
                        : { initialData: { start: date, end: date, allDay: true } })
                };
                return <FormComponent {...formProps} />;
            case 'detail':
                return <DetailView event={currentItem} onEdit={() => handleShowForm(currentItem)} />;
            case 'list':
            default:
                return <EventListView
                    events={eventsForDay}
                    onAdd={() => handleShowForm()}
                    onDetail={handleShowDetail}
                    onDelete={handleDelete}
                />;
        }
    };

    return (
        <PopupWrapper ref={popupRef} $visible={isOpen} style={{ top: position.top, left: position.left }}>
            <PopupHeader>
                {viewMode !== 'list' && <HeaderButton onClick={handleBackToList}><FaArrowLeft /></HeaderButton>}
                <span>{date}</span>
                <Tooltip title="닫기" placement="bottom">
                    <HeaderButton onClick={closePopup}><FaTimes /></HeaderButton>
                </Tooltip>
            </PopupHeader>
            <ContentWrapper>
                {renderContent()}
            </ContentWrapper>
        </PopupWrapper>
    );
};

export default SchedulePopUp;