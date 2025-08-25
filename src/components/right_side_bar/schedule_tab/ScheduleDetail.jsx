const ScheduleDetail = ({item, onEdit, onCancel, onDelete}) => {
    // item이 로드되기 전에 렌더링되는 것을 방지 (오류의 근본 원인)
    if (!item) {
        return null; // 또는 로딩 스피너를 보여줄 수 있습니다.
    }

    const formatDetailTime = (item) => {
        if (!item.start) return "시간 정보 없음";
        const start = new Date(item.start);
        const end = item.end ? new Date(item.end) : null;

        const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
        if (item.allDay) {
            // 하루 종일 일정은 날짜만 표시
            return start.toLocaleDateString('ko-KR', options);
        }

        // 시간 지정 일정은 날짜와 시간 모두 표시
        options.hour = '2-digit';
        options.minute = '2-digit';

        return `${start.toLocaleString('ko-KR', options)}${end ? ` - ${end.toLocaleTimeString('ko-KR', {hour: '2-digit', minute: '2-digit'})}`: ''}`;
    }

    return (
        <>
            <button onClick={onCancel}>뒤로</button>
            <hr />
            <div><b>Title</b> : {item.title}</div>
            <div><b>Time</b> : {formatDetailTime(item)}</div>
            <div><b>Location</b> : {item.extendedProps?.location || '지정 안 함'}</div>
            <div><b>Tags</b> : {item.extendedProps?.tags || '없음'}</div>
            <div><b>Description</b> : {item.extendedProps?.description}</div>
            <div style={{ marginTop: 12 }}>
                <button onClick={() => onEdit(item.id)}>Edit</button>
                <button onClick={() => onDelete(item.id)} style={{ marginLeft: 8, color: "#e11d48" }}>
                    Delete
                </button>
            </div>

        </>)
}

export default ScheduleDetail;