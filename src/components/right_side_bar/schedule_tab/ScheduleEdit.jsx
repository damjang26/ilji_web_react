import {useEffect, useState} from "react";

const ScheduleEdit = ({item, onSave, onDelete, onCancel}) => {
    // item이 아직 없을 수도 있으니 방어
    const [form, setForm] = useState({
        no: null,
        title: "",
        date: "",
        description: "",
        isRepeating: false,
    });

    useEffect(() => {
        if (item) {
            setForm({
                no: item.no,
                title: item.title,
                date: item.date,
                description: item.description,
                isRepeating: item.isRepeating,
            });
        }
    }, [item]);

    const set = (k) => (e) => {
        const v = e?.target?.type === "checkbox" ? e.target.checked : e.target.value;
        setForm((prev) => ({ ...prev, [k]: v }));
    };




    return (
        <>
            <button onClick={onCancel}>취소</button>
            <hr />
            <div style={{ display: "grid", gap: 8 }}>
                <input placeholder="Title" value={form.title} onChange={set("title")} />
                <input type="date" placeholder="Date" value={form.date} onChange={set("date")} />
                <input
                    placeholder="Description"
                    value={form.description}
                    onChange={set("description")}
                />
                <label style={{ display: "inline-flex", gap: 6, alignItems: "center" }}>
                    <input type="checkbox" checked={form.isRepeating} onChange={set("isRepeating")} />
                    반복 여부
                </label>
            </div>
            <div style={{ marginTop: 12 }}>
                <button onClick={() => onSave(form)}>저장</button>
                <button onClick={() => onDelete(form.no)} style={{ marginLeft: 8, color: "#e11d48" }}>
                    삭제
                </button>
            </div>
        </>
    )
}

export default ScheduleEdit;