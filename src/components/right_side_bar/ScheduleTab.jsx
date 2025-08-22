import {useMemo, useState} from "react";
// tool
import ScheduleList from "./schedule_tab/ScheduleList.jsx";
import ScheduleForm from "./schedule_tab/ScheduleForm.jsx";
import ScheduleEdit from "./schedule_tab/ScheduleEdit.jsx";
import ScheduleDetail from "./schedule_tab/ScheduleDetail.jsx";
// components

const ScheduleTab = () => {
    const [mode, setMode] = useState("list"); // "list" | "create" | "edit"
    const [selectedId, setSelectedId] = useState(null);

    // 임시 데이터(추후 삭제)===============================================================
    const [schedules, setSchedules] = useState([
        {
            no: 1,
            title: "일정1",
            date: "2025-08-21",
            description: "첫 번째 일정입니다.",
            isRepeating: false,
        },
        {
            no: 2,
            title: "일정2",
            date: "2025-08-21",
            description: "두 번째 일정입니다.",
            isRepeating: true,
        },
        {
            no: 3,
            title: "일정3",
            date: "2025-08-21",
            description: "세 번째 일정입니다.",
            isRepeating: false,
        }]
    )
    // ==================================================================================


    const selectedItem = useMemo(
        () => schedules.find((s) => s.no === selectedId) || null,
        [schedules, selectedId]
    );


    // 생성 저장
    const createSchedule = (form) => {
        const nextNo = schedules.length ? Math.max(...schedules.map(s => s.no)) + 1 : 1;
        const newItem = {no: nextNo, ...form};
        setSchedules((prev) => [...prev, newItem]);
    };
    // 수정 저장
    const updateSchedule = (form) => {
        setSchedules((prev) =>
            prev.map((s) => (s.no === form.no ? {...s, ...form} : s))
        );
    };
    // 삭제
    const deleteSchedule = (no) => {
        setSchedules((prev) => prev.filter((s) => s.no !== no));
    };


    return (
        <>
            {mode === "list" && (
                <ScheduleList
                    schedules={schedules}
                    onAdd={() => setMode("create")}
                    onDetail={(id) => {
                        setSelectedId(id);
                        setMode("detail");
                    }}
                />
            )}

            {mode === "create" && (
                <ScheduleForm
                    schedules={schedules}
                    onCancel={() => setMode("list")}
                    onSave={(newData) => {
                        createSchedule(newData);
                        setMode("list");
                    }}
                />
            )}

            {mode === "edit" && (
                <ScheduleEdit
                    schedules={schedules}
                    item={selectedItem}
                    onDetail={() => setMode("detail")}
                    onSave={(updated) => {
                        updateSchedule(updated);
                        setMode("list");
                    }}
                />
            )}

            {mode === "detail" && (
                <ScheduleDetail
                    item={selectedItem}
                    schedules={schedules}
                    onCancel={() => setMode("list")}
                    onEdit={(id) => {
                        setSelectedId(id);
                        setMode("edit");
                    }}
                    onDelete={(no) => {
                        deleteSchedule(no);
                        setMode("list");
                    }}
                />
            )}


        </>
    );
};

export default ScheduleTab;