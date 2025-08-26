import { useState, useEffect } from "react";

const ScheduleForm = ({onSave, onCancel, initialData}) => {
    // 백엔드 데이터 구조에 맞게 폼 상태를 상세하게 변경
    const [form, setForm] = useState({
        title: "",
        location: "",
        tags: "",
        description: "",
        allDay: true,
        startDate: "",
        startTime: "09:00",
        endDate: "",
        endTime: "10:00",
        calendarId: 1, // 기본 캘린더 ID
    });

    // initialData가 변경될 때 폼의 상태를 업데이트합니다.
    useEffect(() => {
        if (initialData) {
            const startDate = (initialData.startStr || "").split("T")[0];
            setForm(prev => ({
                ...prev,
                startDate: startDate,
                endDate: startDate, // 기본적으로 시작일과 종료일을 같게 설정
            }));
        }
    }, [initialData]);

    const set = (k) => (e) => {
        const v = e?.target?.type === "checkbox" ? e.target.checked : e.target.value;
        setForm((prev) => ({ ...prev, [k]: v }));
    };

    const handleSave = () => {
        const { title, description, allDay, startDate, startTime, endDate, endTime, location, tags, calendarId } = form;

        // FullCalendar가 이해할 수 있는 형식으로 start, end 값을 조립합니다.
        const finalStart = allDay ? startDate : `${startDate}T${startTime}`;
        const finalEnd = allDay ? endDate : `${endDate}T${endTime}`;

        onSave({
            title,
            start: finalStart,
            end: finalEnd,
            allDay,
            extendedProps: {
                description,
                location,
                tags,
                calendarId,
                // rrule: ... // 반복 로직 추가 시
            }
        });
    };

    return (
        <>
            <button onClick={onCancel}>취소</button>
            <hr />
            <div style={{ display: "grid", gap: 8 }}>
                <input placeholder="Title" value={form.title} onChange={set("title")} />
                <label style={{ display: "inline-flex", gap: 6, alignItems: "center" }}>
                    <input type="checkbox" checked={form.allDay} onChange={set("allDay")} />
                    하루 종일
                </label>
                <div style={{display: 'flex', gap: '4px'}}>
                    <input type="date" value={form.startDate} onChange={set("startDate")} style={{width: '100%'}} />
                    {!form.allDay && <input type="time" value={form.startTime} onChange={set("startTime")} />}
                </div>
                <div style={{display: 'flex', gap: '4px'}}>
                    <input type="date" value={form.endDate} onChange={set("endDate")} style={{width: '100%'}} />
                    {!form.allDay && <input type="time" value={form.endTime} onChange={set("endTime")} />}
                </div>
                <input placeholder="Location" value={form.location} onChange={set("location")} />
                <input placeholder="Tags (comma-separated)" value={form.tags} onChange={set("tags")} />
                <input
                    placeholder="Description"
                    value={form.description}
                    onChange={set("description")}
                />
            </div>
            <div style={{ marginTop: 12 }}>
                <button onClick={handleSave}>저장</button>
            </div>

        </>)

}

export default ScheduleForm;