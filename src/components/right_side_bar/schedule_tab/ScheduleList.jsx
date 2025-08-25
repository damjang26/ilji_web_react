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
        <>
            <div>{formatDate(selectedDate)}</div>
            <hr />
            <ul style={{ paddingLeft: 16 }}>
                {schedules.map((s) => (
                    <li
                        key={s.id}
                        style={{ cursor: "pointer", marginBottom: 8 }}
                        onClick={() => onDetail(s.id)}
                        title="클릭하면 상세 보기"
                    >
                        <div><b>{s.title}</b></div>
                        <small>{s.date}</small>
                    </li>
                ))}
            </ul>
            <button onClick={onAdd}>일정 추가</button>

        </>
    )
}

export default ScheduleList;