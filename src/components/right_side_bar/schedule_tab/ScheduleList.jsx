const ScheduleList = ({schedules, onAdd, onDetail}) => {
    return (
        <>
            <div>8 / 22 금요일(날짜)</div>
            <hr />
            <ul style={{ paddingLeft: 16 }}>
                {schedules.map((s) => (
                    <li
                        key={s.no}
                        style={{ cursor: "pointer", marginBottom: 8 }}
                        onClick={() => onDetail(s.no)}
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