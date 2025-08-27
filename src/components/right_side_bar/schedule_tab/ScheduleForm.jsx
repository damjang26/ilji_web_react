import { useState, useEffect } from "react";
import { useTags } from "../../../contexts/TagContext.jsx"; // useTags 훅 import
import { Select } from "antd"; // AntD Select import
import {
    ActionButtons,
    Button,
    CheckboxWrapper,
    DateTimeRow,
    FieldSet,
    FormBody,
    FormWrapper,
    Input,
    Label
} from "../../../styled_components/right_side_bar/schedule_tab/ScheduleFormStyled.jsx";

const ScheduleForm = ({onSave, onCancel, initialData}) => {
    const { tags } = useTags(); // TagContext에서 태그 목록 가져오기

    const [form, setForm] = useState({
        title: "",
        location: "",
        tagId: null, // 'tags'를 'tagId'로 변경하고 초기값을 null로 설정
        description: "",
        allDay: true,
        startDate: "",
        startTime: "09:00",
        endDate: "",
        endTime: "10:00",
        calendarId: 1,
    });

    useEffect(() => {
        if (initialData) {
            const startDateStr = (initialData.startStr || new Date().toISOString()).split("T")[0];
            let endDateStr = startDateStr;

            if (initialData.endStr) {
                const inclusiveEndDate = new Date(initialData.endStr);
                if (!isNaN(inclusiveEndDate.getTime())) {
                    inclusiveEndDate.setDate(inclusiveEndDate.getDate() - 1);
                    endDateStr = inclusiveEndDate.toISOString().split('T')[0];
                }
            }

            setForm(prev => ({
                ...prev,
                startDate: startDateStr,
                endDate: endDateStr,
            }));
        }
    }, [initialData]);

    // set 함수를 tagId 변경에도 대응하도록 수정
    const set = (k) => (v) => {
        // AntD Select는 event 객체가 아닌 value를 직접 전달
        if (k === 'tagId') {
            setForm((prev) => ({ ...prev, [k]: v }));
            return;
        }
        const value = v?.target?.type === "checkbox" ? v.target.checked : v.target.value;
        setForm((prev) => ({ ...prev, [k]: value }));
    };

    useEffect(() => {
        if (form.startDate > form.endDate) {
            setForm(prev => ({ ...prev, endDate: prev.startDate }));
        }
        if (form.startDate === form.endDate && form.startTime > form.endTime) {
            setForm(prev => ({ ...prev, endTime: prev.startTime }));
        }
    }, [form.startDate, form.startTime, form.endDate, form.endTime]);

    const handleSave = () => {
        const { title, description, allDay, startDate, startTime, endDate, endTime, location, tagId, calendarId } = form;
        const finalTitle = title.trim() ? title : "새 일정";
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
                tagId, // tags 대신 tagId 전송
                calendarId,
            }
        });
    };

    // 태그 선택 옵션을 생성
    const tagOptions = tags.map(tag => ({
        value: tag.id,
        label: tag.label
    }));

    return (
        <FormWrapper>
            <FormBody>
                {/* ... 다른 FieldSet들 ... */}
                <FieldSet>
                    <Label htmlFor="title">제목</Label>
                    <Input id="title" placeholder="일정 제목" value={form.title} onChange={set("title")} />
                </FieldSet>

                <CheckboxWrapper>
                    <input type="checkbox" id="all-day" checked={form.allDay} onChange={set("allDay")} />
                    <Label htmlFor="all-day" style={{fontWeight: 'normal', cursor: 'pointer'}}>하루 종일</Label>
                </CheckboxWrapper>

                <FieldSet>
                    <Label>시작</Label>
                    <DateTimeRow>
                        <Input type="date" value={form.startDate} onChange={set("startDate")} />
                        {!form.allDay && <Input type="time" value={form.startTime} onChange={set("startTime")} />}
                    </DateTimeRow>
                </FieldSet>

                <FieldSet>
                    <Label>종료</Label>
                    <DateTimeRow>
                        <Input type="date" value={form.endDate} min={form.startDate} onChange={set("endDate")} />
                        {!form.allDay && <Input type="time" value={form.endTime} min={form.startDate === form.endDate ? form.startTime : undefined} onChange={set("endTime")} />}
                    </DateTimeRow>
                </FieldSet>

                <FieldSet>
                    <Label htmlFor="location">장소</Label>
                    <Input id="location" placeholder="장소" value={form.location} onChange={set("location")} />
                </FieldSet>

                {/* 태그 입력을 Select로 변경 */}
                <FieldSet>
                    <Label htmlFor="tags">태그</Label>
                    <Select
                        id="tags"
                        placeholder="태그 선택"
                        value={form.tagId}
                        onChange={set("tagId")} // set 함수가 직접 value를 받도록 수정했음
                        options={tagOptions}
                        style={{ width: '100%' }}
                        allowClear // 선택을 취소할 수 있는 x 버튼 추가
                    />
                </FieldSet>

                <FieldSet>
                    <Label htmlFor="description">설명</Label>
                    <Input as="textarea" id="description" rows="5" placeholder="설명" value={form.description} onChange={set("description")} />
                </FieldSet>
            </FormBody>

            <ActionButtons>
                <Button className="secondary" onClick={onCancel}>취소</Button>
                <Button className="primary" onClick={handleSave}>저장</Button>
            </ActionButtons>
        </FormWrapper>
    )
}

export default ScheduleForm;
