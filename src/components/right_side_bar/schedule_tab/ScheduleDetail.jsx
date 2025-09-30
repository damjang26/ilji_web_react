import { useMemo } from "react";
import { useTags } from "../../../contexts/TagContext.jsx";
import {
    BackButton,
    DetailHeader, HeaderDate,
    DetailWrapper,
    InfoLabel,
    InfoSection,
    InfoValue,
    Title
} from "../../../styled_components/right_side_bar/schedule_tab/ScheduleDetailStyled.jsx";
import { Button, ActionButtons } from "../../../styled_components/common/FormElementsStyled.jsx";
import { useAuth } from "../../../AuthContext.jsx";

const ScheduleDetail = ({event, displayDate, onCancel, onEdit, onDelete, selectedDateFromList}) => {
    const { tags } = useTags();
    const { user } = useAuth();

    if (!event) {
        return <div>일정을 선택해주세요.</div>;
    }

    // 현재 일정의 tagId에 해당하는 태그 객체를 찾습니다。
    const currentTag = useMemo(() => {
        const tagId = event.extendedProps?.tagId;
        if (!tagId) return null;
        if (!Array.isArray(tags)) return null; // tags가 배열이 아닐 경우 방어 코드
        return tags.find(t => t.id === tagId);
    }, [event, tags]);

    // 날짜와 시간을 상황에 맞게 표시하는 함수
    const formatDateRange = () => {
        const toDateStr = (d) => new Date(d).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });

        // 목록에서 넘어온 반복 일정의 경우, 목록의 날짜를 우선으로 표시
        if (event.rrule && selectedDateFromList) {
            return toDateStr(selectedDateFromList);
        }

        if (!event.start) return "날짜 정보 없음";

        const toTimeStr = (d) => {
            const date = new Date(d);
            return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
        };

        // For all-day events, FullCalendar's event.end is the morning of the next day (exclusive).
        if (event.allDay) {
            const start = new Date(event.start);
            start.setHours(0, 0, 0, 0); // Normalize to midnight

            if (event.end) {
                const end = new Date(event.end);
                end.setHours(0, 0, 0, 0); // Normalize to midnight

                const oneDay = 24 * 60 * 60 * 1000;
                // If the difference is exactly one day, it's a single-day event.
                if (end.getTime() - start.getTime() === oneDay) {
                    return toDateStr(start);
                }
                
                // Otherwise, it's a multi-day event. Subtract one day from the exclusive end for display.
                const inclusiveEnd = new Date(end.getTime() - oneDay);
                return `${toDateStr(start)} ~ ${toDateStr(inclusiveEnd)}`;
            } else {
                // No end date also means it's a single day event.
                return toDateStr(start);
            }
        }

        // Timed event logic
        const start = new Date(event.start);
        const end = event.end ? new Date(event.end) : start;

        if (toDateStr(start) === toDateStr(end)) {
            return `${toDateStr(start)} ${toTimeStr(start)} - ${toTimeStr(end)}`;
        } else {
            return `${toDateStr(start)} ${toTimeStr(start)} - ${toDateStr(end)} ${toTimeStr(end)}`;
        }
    };
    
    const isOwner = user && user.id === event.extendedProps.calendarId; // user가 null일 수 있으므로 방어 코드 필요

    return (
        <DetailWrapper>
            <DetailHeader>
                <BackButton onClick={onCancel}>← 목록으로</BackButton>
                {/* ✅ [수정] 헤더 오른쪽에 날짜를 표시합니다. */}
                {displayDate && <HeaderDate>{displayDate}</HeaderDate>}
            </DetailHeader>

            <Title>{event.title}</Title>

            <InfoSection>
                <div>
                    <InfoLabel>날짜</InfoLabel>
                    <InfoValue>{formatDateRange()}</InfoValue>
                </div>
                {event.extendedProps?.location && <div>
                    <InfoLabel>장소</InfoLabel>
                    <InfoValue>{event.extendedProps.location}</InfoValue>
                </div>}
                {currentTag && <div>
                    <InfoLabel>태그</InfoLabel>
                    <InfoValue>{currentTag.label}</InfoValue>
                </div>}
                {event.extendedProps?.description && <div>
                    <InfoLabel>설명</InfoLabel>
                    <InfoValue>{event.extendedProps.description}</InfoValue>
                </div>}
            </InfoSection>

            {isOwner && (
                <ActionButtons>
                    <Button className="secondary" onClick={() => onDelete(event.id)}>삭제</Button>
                    <Button className="primary" onClick={() => onEdit(event)}>수정</Button>
                </ActionButtons>
            )}
        </DetailWrapper>
    )
}

export default ScheduleDetail;