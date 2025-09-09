import React, { useState, useMemo, useRef, useLayoutEffect, useEffect } from 'react';
import styled from 'styled-components';
import { Tooltip } from 'antd';
import { FaTimes, FaPlus, FaEdit, FaTrash, FaArrowLeft } from 'react-icons/fa';
import { useSchedule } from '../../../../contexts/ScheduleContext.jsx';
import { useTags } from '../../../../contexts/TagContext.jsx';


// --- Styled Components ---
const PopupWrapper = styled.div`
    position: fixed;
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
    /* ✅ [수정] z-index를 antd 모달의 기본값(1000)보다 낮게 설정하여
       태그 추가 모달 등이 팝업 위에 표시되도록 합니다.
    */
    z-index: 999;
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
    padding: 10px 4px; /* 좌우 패딩 조정 */
    font-size: 14px;
    line-height: 1.6;
`;

// ✅ [추가] 상세 정보 표시를 위한 스타일
const DetailInfoSection = styled.div`
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin: 16px 0;
`;

const DetailInfoItem = styled.div``;

const DetailInfoLabel = styled.span`
    display: block;
    font-size: 12px;
    color: #888;
    margin-bottom: 4px;
`;

const DetailInfoValue = styled.span`
    font-size: 14px;
    color: #333;
    white-space: pre-wrap; /* 설명 줄바꿈을 위해 추가 */
    word-break: break-word; /* 긴 단어 줄바꿈 */
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

// ✅ [수정] 사이드바처럼 상세 정보를 표시하도록 DetailView를 확장합니다.
const DetailView = ({ event, onEdit, tags }) => {
    // 현재 일정의 tagId에 해당하는 태그 객체를 찾습니다.
    const currentTag = useMemo(() => {
        const tagId = event.extendedProps?.tagId;
        if (!tagId || !tags) return null;
        return tags.find(t => t.id === tagId);
    }, [event, tags]);

    // 날짜와 시간을 상황에 맞게 표시하는 함수
    const formatDateRange = (item) => {
        if (!item.start) return "날짜 정보 없음";

        const start = new Date(item.start);
        const end = item.end ? new Date(item.end) : start;

        // Case 1: '하루 종일' 일정
        if (item.allDay) {
            const inclusiveEnd = new Date(end.getTime());
            inclusiveEnd.setDate(inclusiveEnd.getDate() - 1);

            const startDateStr = start.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
            const inclusiveEndDateStr = inclusiveEnd.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });

            if (startDateStr === inclusiveEndDateStr) {
                return startDateStr;
            }
            return `${startDateStr} ~ ${inclusiveEndDateStr}`;
        }

        // Case 2: 시간 지정 일정
        const startDateStr = start.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
        const startTimeStr = start.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false });

        const endDateStr = end.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
        const endTimeStr = end.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false });

        if (startDateStr === endDateStr) {
            return `${startDateStr} ${startTimeStr} - ${endTimeStr}`;
        }
        return `${startDateStr} ${startTimeStr} - ${endDateStr} ${endTimeStr}`;
    };

    return (
        <DetailContent>
            <h4>{event.title}</h4>
            <DetailInfoSection>
                <DetailInfoItem>
                    <DetailInfoLabel>날짜</DetailInfoLabel>
                    <DetailInfoValue>{formatDateRange(event)}</DetailInfoValue>
                </DetailInfoItem>

                {event.extendedProps?.location && (
                    <DetailInfoItem>
                        <DetailInfoLabel>장소</DetailInfoLabel>
                        <DetailInfoValue>{event.extendedProps.location}</DetailInfoValue>
                    </DetailInfoItem>
                )}

                {currentTag && (
                    <DetailInfoItem>
                        <DetailInfoLabel>태그</DetailInfoLabel>
                        <DetailInfoValue>{currentTag.label}</DetailInfoValue>
                    </DetailInfoItem>
                )}

                {event.extendedProps?.description && (
                    <DetailInfoItem>
                        <DetailInfoLabel>설명</DetailInfoLabel>
                        <DetailInfoValue>{event.extendedProps.description}</DetailInfoValue>
                    </DetailInfoItem>
                )}
            </DetailInfoSection>
            <AddButton onClick={() => onEdit(event)}>수정</AddButton>
        </DetailContent>
    );
};


// --- Main Popup Component ---
const SchedulePopUp = () => {
    // --- Global State ---
    const {
        events,
        popupState,
        closePopup,
        addEvent,
        updateEvent,
        requestDeleteConfirmation, // ✅ [수정] 중앙화된 삭제 요청 함수를 가져옵니다.
        openSidebarForNew,
        openSidebarForEdit,
        openSidebarForDetail,
        openSidebarForDate, // ✅ 사이드바의 리스트 뷰를 제어하기 위해 추가
    } = useSchedule();
    const { tags } = useTags();

    const [position, setPosition] = useState({ top: 0, left: 0 });
    const popupRef = useRef(null);

    const { isOpen, data: popupData } = popupState;

    // ✅ [수정] 팝업 헤더에 표시될 날짜를 지능적으로 결정합니다.
    // 사용자가 날짜를 클릭했는지, 이벤트를 직접 클릭했는지에 따라 popupData의 구조가 다릅니다.
    // 이 코드는 두 경우 모두를 처리하여 항상 정확한 날짜를 표시합니다.
    const date = useMemo(() => {
        if (!popupData) return null;

        // Case 1: 날짜를 클릭한 경우, popupData.date에 날짜 문자열이 직접 들어있습니다.
        if (popupData.date) {
            return popupData.date;
        }

        // Case 2: 이벤트를 직접 클릭한 경우, popupData.event에서 날짜를 추출해야 합니다.
        if (popupData.event?.start) {
            const d = new Date(popupData.event.start);
            // toISOString()의 시간대 문제를 피하기 위해 로컬 날짜 구성요소를 사용합니다.
            return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        }
        return null;
    }, [popupData]);

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
    }, [isOpen, popupData, events]); // ✅ viewMode, currentItem 의존성 제거

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
    const handleDetailClick = (item) => {
        openSidebarForDetail(item);
        closePopup();
    };

    const handleAddClick = () => {
        // 팝업의 날짜를 기준으로 새 일정 폼을 사이드바에 엽니다.
        openSidebarForNew({ startStr: date, endStr: date, allDay: true });
        closePopup();
    };

    // ✅ [수정] 삭제 버튼 클릭 시, Context의 중앙화된 삭제 확인 함수를 호출합니다.
    const handleDelete = (id) => {
        requestDeleteConfirmation(id);
        // 팝업은 닫지 않고, 삭제 확인 모달이 위에 뜨도록 둡니다.
    };

    return (
        <PopupWrapper ref={popupRef} $visible={isOpen} style={{ top: position.top, left: position.left }}>
            <PopupHeader>
                <span>{date}</span>
                <Tooltip title="닫기" placement="bottom">
                    <HeaderButton onClick={closePopup}><FaTimes /></HeaderButton>
                </Tooltip>
            </PopupHeader>
            <ContentWrapper>
                <EventListView
                    events={eventsForDay}
                    onAdd={handleAddClick}
                    onDetail={handleDetailClick}
                    onDelete={handleDelete}
                />
            </ContentWrapper>
        </PopupWrapper>
    );
};

export default SchedulePopUp;