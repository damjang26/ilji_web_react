const ScheduleDetail = ({item, onEdit, onCancel, onDelete}) => {
    return (
        <>
            <button onClick={onCancel}>뒤로</button>
            <hr />
            <div><b>Title</b> : {item.title}</div>
            <div><b>Date</b> : {item.date}</div>
            <div><b>Description</b> : {item.description}</div>
            <label style={{ display: "inline-flex", gap: 6, alignItems: "center" }}>
                <input type="checkbox" checked={item.isRepeating} disabled />
                반복 여부
            </label>
            <div style={{ marginTop: 12 }}>
                <button onClick={() => onEdit(item.no)}>Edit</button>
                <button onClick={() => onDelete(item.no)} style={{ marginLeft: 8, color: "#e11d48" }}>
                    Delete
                </button>
            </div>

        </>)
}

export default ScheduleDetail;