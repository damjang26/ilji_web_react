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
        return <div>Please select an event.</div>;
    }

    // 현재 일정의 tagId에 해당하는 태그 객체
    const currentTag = useMemo(() => {
        const tagId = event.extendedProps?.tagId;
        if (!tagId) return null;
        if (!Array.isArray(tags)) return null;
        return tags.find(t => t.id === tagId);
    }, [event, tags]);

    // 날짜/시간 포맷
    const formatDateRange = () => {
        if (!event.start) return "No date information";

        // 반복 일정 → 목록에서 넘어온 날짜 우선
        if (event.rrule && selectedDateFromList) {
            return new Date(selectedDateFromList).toLocaleDateString("en-US", { 
                year: "numeric", month: "long", day: "numeric" 
            });
        }

        // Case 1: All-day event
        if (event.allDay) {
            const start = new Date(event.start);
            start.setHours(0, 0, 0, 0);

            if (event.end) {
                const end = new Date(event.end);
                end.setHours(0, 0, 0, 0);

                const oneDay = 24 * 60 * 60 * 1000;
                if (end.getTime() - start.getTime() === oneDay) {
                    return start.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
                }

                const inclusiveEnd = new Date(end.getTime() - oneDay);
                return `${start.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })} ~ ${inclusiveEnd.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`;
            } else {
                return start.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
            }
        }

        // Case 2: Timed event
        const start = new Date(event.start);
        const end = event.end ? new Date(event.end) : start;

        const startDateStr = start.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
        const startTimeStr = start.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });

        const endDateStr = end.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
        const endTimeStr = end.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });

        if (startDateStr === endDateStr) {
            return `${startDateStr} ${startTimeStr} - ${endTimeStr}`;
        } else {
            return `${startDateStr} ${startTimeStr} - ${endDateStr} ${endTimeStr}`;
        }
    };
    
    const isOwner = user && user.id === event.extendedProps.calendarId;

    return (
        <DetailWrapper>
            <DetailHeader>
                <BackButton onClick={onCancel}>← Back to list</BackButton>
                {displayDate && <HeaderDate>{displayDate}</HeaderDate>}
            </DetailHeader>

            <Title>{event.title}</Title>

            <InfoSection>
                <div>
                    <InfoLabel>Date</InfoLabel>
                    <InfoValue>{formatDateRange()}</InfoValue>
                </div>
                {event.extendedProps?.location && (
                    <div>
                        <InfoLabel>Location</InfoLabel>
                        <InfoValue>{event.extendedProps.location}</InfoValue>
                    </div>
                )}
                {currentTag && (
                    <div>
                        <InfoLabel>Tag</InfoLabel>
                        <InfoValue>{currentTag.label}</InfoValue>
                    </div>
                )}
                {event.extendedProps?.description && (
                    <div>
                        <InfoLabel>Description</InfoLabel>
                        <InfoValue>{event.extendedProps.description}</InfoValue>
                    </div>
                )}
            </InfoSection>

            {isOwner && (
                <ActionButtons>
                    <Button className="secondary" onClick={() => onDelete(event.id)}>Delete</Button>
                    <Button className="primary" onClick={() => onEdit(event)}>Edit</Button>
                </ActionButtons>
            )}
        </DetailWrapper>
    );
};

export default ScheduleDetail;
