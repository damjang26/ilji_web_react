import { useMemo } from "react";
import { useTags } from "../../../contexts/TagContext.jsx";
import {
    BackButton,
    DetailHeader,
    DetailWrapper,
    InfoLabel,
    InfoSection,
    InfoValue,
    Title
} from "../../../styled_components/right_side_bar/schedule_tab/ScheduleDetailStyled.jsx";
import { Button, ActionButtons } from "../../../styled_components/common/FormElementsStyled.jsx";

const ScheduleDetail = ({item, onEdit, onCancel, onDelete}) => {
    const { tags } = useTags(); // TagContext에서 전체 태그 목록 가져오기

    // item이 로드되기 전에 렌더링되는 것을 방지 (오류의 근본 원인)
    if (!item) {
        return <div>일정을 선택해주세요.</div>;
    }

    // 현재 일정의 tagId에 해당하는 태그 객체를 찾습니다.
    const currentTag = useMemo(() => {
        const tagId = item.extendedProps?.tagId;
        if (!tagId) return null;
        return tags.find(t => t.id === tagId);
    }, [item, tags]);

    // 날짜와 시간을 상황에 맞게 표시하는 함수
    const formatDateRange = () => {
        if (!item.start) return "날짜 정보 없음";

        const start = new Date(item.start);
        const end = item.end ? new Date(item.end) : start; // end가 없으면 start로 대체

        // Case 1: '하루 종일' 일정
        if (item.allDay) {
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

    return (
        <DetailWrapper>
            <DetailHeader>
                <BackButton onClick={onCancel}>← 목록으로</BackButton>
            </DetailHeader>

            <Title>{item.title}</Title>

            <InfoSection>
                <div>
                    <InfoLabel>날짜</InfoLabel>
                    <InfoValue>{formatDateRange()}</InfoValue>
                </div>
                {item.extendedProps?.location && <div>
                    <InfoLabel>장소</InfoLabel>
                    <InfoValue>{item.extendedProps.location}</InfoValue>
                </div>}
                {currentTag && <div>
                    <InfoLabel>태그</InfoLabel>
                    <InfoValue>{currentTag.label}</InfoValue>
                </div>}
                {item.extendedProps?.description && <div>
                    <InfoLabel>설명</InfoLabel>
                    <InfoValue>{item.extendedProps.description}</InfoValue>
                </div>}
            </InfoSection>

            <ActionButtons>
                <Button className="secondary" onClick={() => onDelete(item.id)}>삭제</Button>
                <Button className="primary" onClick={() => onEdit(item.id)}>수정</Button>
            </ActionButtons>
        </DetailWrapper>
    )
}

export default ScheduleDetail;