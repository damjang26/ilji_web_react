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
            // initialData가 없거나 날짜 정보가 없으면 오늘 날짜를 기본값으로 사용합니다.
            const startDateStr = (initialData.startStr || new Date().toISOString()).split("T")[0];

            // FullCalendar의 select 정보는 endStr이 exclusive(포함 안됨)이므로,
            // 폼에 표시하기 위해 inclusive(포함됨) 날짜로 변환합니다. (하루 빼기)
            let endDateStr = startDateStr; // 기본적으로 종료일을 시작일과 같게 설정

            if (initialData.endStr) {
                const inclusiveEndDate = new Date(initialData.endStr);
                // new Date()가 유효한 날짜를 반환했는지 확인합니다.
                if (!isNaN(inclusiveEndDate.getTime())) {
                    inclusiveEndDate.setDate(inclusiveEndDate.getDate() - 1);
                    endDateStr = inclusiveEndDate.toISOString().split('T')[0];
                }
            }

            setForm(prev => ({
                ...prev,
                startDate: startDateStr,
                // 사용자가 선택한 날짜 범위를 정확히 반영합니다.
                endDate: endDateStr,
            }));
        }
    }, [initialData]);

    const set = (k) => (e) => {
        const v = e?.target?.type === "checkbox" ? e.target.checked : e.target.value;
        setForm((prev) => ({ ...prev, [k]: v }));
    };

    // 시작 날짜/시간이 변경될 때 종료 날짜/시간을 자동으로 조정합니다.
    useEffect(() => {
        // 시작일이 종료일보다 늦어지면, 종료일을 시작일과 같게 설정
        if (form.startDate > form.endDate) {
            setForm(prev => ({ ...prev, endDate: prev.startDate }));
        }

        // 시작일과 종료일이 같고, 시작 시간이 종료 시간보다 늦어지면, 종료 시간을 시작 시간과 같게 설정
        if (form.startDate === form.endDate && form.startTime > form.endTime) {
            setForm(prev => ({ ...prev, endTime: prev.startTime }));
        }
    }, [form.startDate, form.startTime, form.endDate, form.endTime]);

    const handleSave = () => {
        const { title, description, allDay, startDate, startTime, endDate, endTime, location, tags, calendarId } = form;

        // 제목이 비어있으면 "새 일정"으로 기본값을 설정합니다.
        const finalTitle = title.trim() ? title : "새 일정";

        // FullCalendar가 이해할 수 있는 형식으로 start, end 값을 조립합니다.
        const finalStart = allDay ? startDate : `${startDate}T${startTime}`;
        const finalEnd = allDay ? endDate : `${endDate}T${endTime}`;

        onSave({
            title: finalTitle,
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
                <label style={{ display: "inline-flex", gap: 6, alignItems: "center", cursor: "pointer" }}>
                    <input type="checkbox" checked={form.allDay} onChange={set("allDay")} />
                    하루 종일
                </label>
                <div style={{display: 'flex', gap: '4px', alignItems: 'center'}}>
                    <input type="date" value={form.startDate} onChange={set("startDate")} style={{width: '100%'}} />
                    {!form.allDay && <input type="time" value={form.startTime} onChange={set("startTime")} />}
                </div>
                <div style={{display: 'flex', gap: '4px', alignItems: 'center'}}>
                    <input
                        type="date"
                        value={form.endDate}
                        min={form.startDate} // ✅ 시작 날짜 이전은 선택 불가
                        onChange={set("endDate")}
                        style={{width: '100%'}} />
                    {!form.allDay && <input
                        type="time"
                        value={form.endTime}
                        min={form.startDate === form.endDate ? form.startTime : undefined} // ✅ 같은 날이면 시작 시간 이전은 선택 불가
                        onChange={set("endTime")}
                    />}
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