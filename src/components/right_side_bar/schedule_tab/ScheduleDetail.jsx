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

const ScheduleDetail = ({event, displayDate, onCancel, onEdit, onDelete}) => {
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
        if (!event.start) return "날짜 정보 없음";

        const start = new Date(event.start);
        // Use the reliable end from the instance if available, otherwise fallback to event.end
        const end = event._instance?.range?.end ? new Date(event._instance.range.end) :
                    event.end ? new Date(event.end) : null;

        const toDateStr = (d) => d.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
        const toTimeStr = (d) => `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;

        // Case 1: '하루 종일' 일정 (allDay: true)
        if (event.allDay) {
            // If there's no end date, it's definitely a single day event.
            if (!end) {
                return toDateStr(start);
            }

            // FullCalendar's end is exclusive. To get the real last day, subtract a moment.
            const inclusiveEnd = new Date(end.getTime() - 1000);

            // Now compare the start date with the calculated inclusive end date.
            if (start.getFullYear() === inclusiveEnd.getFullYear() &&
                start.getMonth() === inclusiveEnd.getMonth() &&
                start.getDate() === inclusiveEnd.getDate())
            {
                return toDateStr(start);
            } else {
                return `${toDateStr(start)} ~ ${toDateStr(inclusiveEnd)}`;
            }
        }

        // Case 2: 시간 지정 일정 (allDay: false)
        const finalEnd = end || start; // If end is null, use start.
        const startDateStr = toDateStr(start);
        const startTimeStr = toTimeStr(start);
        const endDateStr = toDateStr(finalEnd);
        const endTimeStr = toTimeStr(finalEnd);

        if (startDateStr === endDateStr) {
            return `${startDateStr} ${startTimeStr} - ${endTimeStr}`;
        }
        return `${startDateStr} ${startTimeStr} - ${endDateStr} ${endTimeStr}`;
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