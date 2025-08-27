import {
    DateTitle,
    EventItem,
    EventList,
    ListHeader,
    ListWrapper,
    NoEventsMessage
} from "../../../styled_components/right_side_bar/schedule_tab/ScheduleListStyled.jsx";
import { ActionButtons, Button } from "../../../styled_components/common/FormElementsStyled.jsx";

const ScheduleList = ({schedules, onAdd, onDetail, selectedDate}) => {
    const formatDate = (dateString) => {
        if (!dateString) {
            return "전체 일정"; // 선택된 날짜가 없으면 기본 텍스트를 표시합니다.
        }

        // 'T00:00:00Z'를 추가하여 시간대(Timezone) 문제 없이 UTC로 날짜를 파싱합니다.
        const date = new Date(dateString + 'T00:00:00Z');

        // 유효하지 않은 날짜에 대한 예외 처리
        if (isNaN(date.getTime())) {
            return "날짜 정보";
        }

        const month = date.getUTCMonth() + 1;
        const day = date.getUTCDate();
        const dayOfWeek = ["일", "월", "화", "수", "목", "금", "토"][date.getUTCDay()];

        return `${month} / ${day} ${dayOfWeek}요일`;
    };

    return (
        <ListWrapper>
            <ListHeader>
                <DateTitle>{formatDate(selectedDate)}</DateTitle>
            </ListHeader>

            {schedules.length > 0 ? (
                <EventList>
                    {schedules.map((s) => (
                        <EventItem key={s.id} onClick={() => onDetail(s.id)} title="클릭하면 상세 보기">
                            {s.title}
                        </EventItem>
                    ))}
                </EventList>
            ) : (
                <NoEventsMessage>등록된 일정이 없습니다.</NoEventsMessage>
            )}

            <ActionButtons>
                <Button className="primary" onClick={onAdd}>일정 추가</Button>
            </ActionButtons>
        </ListWrapper>
    )
}

export default ScheduleList;