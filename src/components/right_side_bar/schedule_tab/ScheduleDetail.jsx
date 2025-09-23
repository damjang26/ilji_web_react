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
    console.log("ScheduleDetail: Component rendering started.");
    console.log("ScheduleDetail received event:", event);
    const { tags } = useTags();
    const { user } = useAuth();
    console.log("ScheduleDetail - tags from useTags():", tags);
    console.log("ScheduleDetail - user from useAuth():", user);

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
    console.log("ScheduleDetail - currentTag:", currentTag);

    // 날짜와 시간을 상황에 맞게 표시하는 함수
    const formatDateRange = () => {
        if (!event.start) return "날짜 정보 없음";

        const start = new Date(event.start);
        const end = event.end ? new Date(event.end) : start; // end가 없으면 start로 대체

        // Case 1: '하루 종일' 일정
        if (event.allDay) {
            // FullCalendar의 end는 exclusive(포함 안됨)이므로,
            // 화면 표시는 inclusive(포함됨)으로 바꿔야 합니다. (하루 빼기)
            const inclusiveEnd = new Date(end.getTime());
            inclusiveEnd.setDate(inclusiveEnd.getDate() - 1);

            const startDateStr = start.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
            const inclusiveEndDateStr = inclusiveEnd.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });

            // 시작일과 (보정된)종료일이 같으면 날짜 하나만 표시
            if (startDateStr === inclusiveEndDateStr) {
                return startDateStr;
            }
            // 여러 날에 걸친 경우
            return `${startDateStr} ~ ${inclusiveEndDateStr}`;
        }

        // Case 2: 시간 지정 일정
        const startDateStr = start.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
        const startTimeStr = start.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false });

        const endDateStr = end.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
        const endTimeStr = end.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false });

        // 같은 날에 시작하고 끝나는 경우
        if (startDateStr === endDateStr) {
            return `${startDateStr} ${startTimeStr} - ${endTimeStr}`;
        }
        // 여러 날에 걸쳐 진행되는 경우
        return `${startDateStr} ${startTimeStr} - ${endDateStr} ${endTimeStr}`;
    };
    console.log("ScheduleDetail - formatDateRange result:", formatDateRange());
    
    const isOwner = user && user.id === event.extendedProps.calendarId; // user가 null일 수 있으므로 방어 코드 필요
    console.log("ScheduleDetail - isOwner:", isOwner);

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