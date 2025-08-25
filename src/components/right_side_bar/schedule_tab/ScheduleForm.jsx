import { useState, useEffect } from "react";

const ScheduleForm = ({onSave, onCancel, initialData}) => {
    const [form, setForm] = useState({
        title: "",
        date: "",
        location: "",
        tags: "",
        description: "",
        isRepeating: false,
    });

    // initialData가 변경될 때 폼의 상태를 업데이트합니다.
    useEffect(() => {
        if (initialData) {
            setForm({
                title: initialData.title || "",
                // FullCalendar의 날짜 형식(startStr)을 YYYY-MM-DD로 변환
                date: (initialData.startStr || "").split("T")[0],
                location: initialData.extendedProps?.location || "",
                tags: initialData.extendedProps?.tags || "",
                description: initialData.extendedProps?.description || "",
                isRepeating: initialData.extendedProps?.isRepeating || false,
            });
        }
    }, [initialData]);

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

        </>)

}

export default ScheduleForm;