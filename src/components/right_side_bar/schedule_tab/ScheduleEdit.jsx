import {useEffect, useState} from "react";

const ScheduleEdit = ({item, onSave, onCancel}) => {
    // item이 아직 없을 수도 있으니 방어
    const [form, setForm] = useState({
        id: null, // id를 상태에 포함
        title: "",
        date: "",
        location: "",
        tags: "",
        description: "",
        isRepeating: false,
    });

    useEffect(() => {
        if (item) {
            setForm({
                // no 대신 id를 사용합니다.
                id: item.id,
                title: item.title,
                date: item.date,
                location: item.location,
                tags: item.tags,
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
                <input placeholder="Location" value={form.location} onChange={set("location")} />
                <input placeholder="Tags (comma-separated)" value={form.tags} onChange={set("tags")} />
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
            </div>
        </>
    )
}

export default ScheduleEdit;