import {useEffect, useState} from "react";

const ScheduleEdit = ({item, onSave, onCancel}) => {
    // 백엔드 데이터 구조에 맞게 폼 상태를 상세하게 변경
    const [form, setForm] = useState({
        id: null,
        title: "",
        location: "",
        tags: "",
        description: "",
        allDay: true,
        startDate: "",
        startTime: "09:00",
        endDate: "",
        endTime: "10:00",
        calendarId: 1,
    });

    useEffect(() => {
        if (item) {
            // 백엔드에서 온 start, end (ISO 문자열)를 날짜와 시간으로 분리합니다.
            const start = item.start ? new Date(item.start) : new Date();
            // all-day event might not have an end date in some cases.
            // We'll default to the start date if end is not present.
            const end = item.end ? new Date(item.end) : new Date(start);

            const toYYYYMMDD = (d) => d.toISOString().split('T')[0];
            const toHHMM = (d) => d.toTimeString().substring(0, 5);

            setForm({
                id: item.id,
                title: item.title,
                location: item.extendedProps?.location || "",
                tags: item.extendedProps?.tags || "",
                description: item.extendedProps?.description || "",
                allDay: item.allDay,
                startDate: toYYYYMMDD(start),
                startTime: item.allDay ? '09:00' : toHHMM(start),
                endDate: toYYYYMMDD(end),
                endTime: item.allDay ? '10:00' : toHHMM(end),
                calendarId: item.extendedProps?.calendarId || 1,
            });
        }
    }, [item]);

    const set = (k) => (e) => {
        const v = e?.target?.type === "checkbox" ? e.target.checked : e.target.value;
        setForm((prev) => ({ ...prev, [k]: v }));
    };

    const handleSave = () => {
        const { id, title, description, allDay, startDate, startTime, endDate, endTime, location, tags, calendarId } = form;

        // FullCalendar가 이해할 수 있는 형식으로 start, end 값을 조립합니다.
        const finalStart = allDay ? startDate : `${startDate}T${startTime}`;
        const finalEnd = allDay ? endDate : `${endDate}T${endTime}`;

        // onSave에 전달할 객체
        const updatedEvent = {
            id,
            title,
            start: finalStart,
            end: finalEnd,
            allDay,
            extendedProps: {
                description,
                location,
                tags,
                calendarId,
            }
        };
        onSave(updatedEvent);
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
        </>
    )
}

export default ScheduleEdit;