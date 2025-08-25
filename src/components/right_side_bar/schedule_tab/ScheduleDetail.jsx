const ScheduleDetail = ({item, onEdit, onCancel, onDelete}) => {
    // item이 로드되기 전에 렌더링되는 것을 방지 (오류의 근본 원인)
    if (!item) {
        return null; // 또는 로딩 스피너를 보여줄 수 있습니다.
    }

    return (
        <>
            <button onClick={onCancel}>뒤로</button>
            <hr />
            <div><b>Title</b> : {item.title}</div>
            <div><b>Date</b> : {item.date}</div>
            <div><b>Location</b> : {item.location || '지정 안 함'}</div>
            <div><b>Tags</b> : {item.tags || '없음'}</div>
            <div><b>Description</b> : {item.description}</div>
            <label style={{ display: "inline-flex", gap: 6, alignItems: "center" }}>
                <input type="checkbox" checked={item.isRepeating} disabled />
                반복 여부
            </label>
            <div style={{ marginTop: 12 }}>
                <button onClick={() => onEdit(item.id)}>Edit</button>
                <button onClick={() => onDelete(item.id)} style={{ marginLeft: 8, color: "#e11d48" }}>
                    Delete
                </button>
            </div>

        </>)
}

export default ScheduleDetail;