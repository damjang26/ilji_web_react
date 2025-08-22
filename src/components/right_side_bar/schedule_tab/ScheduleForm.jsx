import { useState } from "react";

const ScheduleForm = ({onSave, onCancel}) => {
    const [form, setForm] = useState({
        title: "",
        date: "",
        description: "",
        isRepeating: false,
    });

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
            </div>

        </>)

}

export default ScheduleForm;