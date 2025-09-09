import { useEffect, useRef } from "react";
import { useTags } from "../../../contexts/TagContext.jsx";
import { useSchedule } from "../../../contexts/ScheduleContext.jsx";
import { Select } from "antd";
import RRuleSummary from "./RRuleSummary.jsx";
import {
    ActionButtons,
    Button,
    CheckboxWrapper,
    CustomCheckbox,
    DateTimeRow,
    FieldSet,
    FormBody,
    FormWrapper,
    Input,
    Label
} from "../../../styled_components/right_side_bar/schedule_tab/ScheduleEditStyled.jsx";

const ScheduleEdit = ({item, onSave, tags: tagsFromProp}) => {
    const formRef = useRef(null); // ref 생성
    const { tags: tagsFromContext } = useTags(); // TagContext에서 태그 목록 가져오기
    const { formData: form, setFormData: setForm, goBackInSidebar, openSidebarForRRule } = useSchedule(); // ✅ Context에서 상태 가져오기
    const tags = tagsFromProp || tagsFromContext; // prop으로 받은 tags가 있으면 사용, 없으면 context의 것 사용

    const set = (k) => (e) => {
        // AntD Select는 event 객체가 아닌 value를 직접 전달하므로, e가 바로 value가 됩니다.
        if (k === 'tagId') {
            setForm((prev) => ({ ...prev, [k]: e }));
            return;
        }
        const v = e?.target?.type === "checkbox" ? e.target.checked : e.target.value;
        setForm((prev) => ({ ...prev, [k]: v }));
    };

    // 시작 날짜/시간이 변경될 때 종료 날짜/시간을 자동으로 조정합니다.
    useEffect(() => {
        if (!form) return; // ✅ form이 null일 때를 대비한 가드

        // 시작일이 종료일보다 늦어지면, 종료일을 시작일과 같게 설정
        if (form.startDate > form.endDate) {
            setForm(prev => ({ ...prev, endDate: prev.startDate }));
        }

        // 시작일과 종료일이 같고, 시작 시간이 종료 시간보다 늦어지면, 종료 시간을 시작 시간과 같게 설정
        if (form.startDate === form.endDate && form.startTime > form.endTime) {
            setForm(prev => ({ ...prev, endTime: prev.startTime }));
        }
    }, [form?.startDate, form?.startTime, form?.endDate, form?.endTime, setForm]);

    const handleSave = () => {
        const { id, title, description, allDay, startDate, startTime, endDate, endTime, location, tagId, calendarId, rrule } = form;

        // 제목이 비어있으면 "새 일정"으로 기본값을 설정합니다.
        const finalTitle = title.trim() ? title : "새 일정";

        // FullCalendar가 이해할 수 있는 형식으로 start, end 값을 조립합니다.
        const finalStart = allDay ? startDate : `${startDate}T${startTime}`;
        const finalEnd = allDay ? endDate : `${endDate}T${endTime}`;

        // onSave에 전달할 객체
        const updatedEvent = {
            id,
            title: finalTitle,
            start: finalStart,
            end: finalEnd,
            allDay,
            extendedProps: {
                description,
                location,
                tagId, // tags 대신 tagId 전송
                calendarId,
                rrule,
            }
        };
        onSave(updatedEvent);
    };
 
    // 태그 선택 옵션을 생성
    const tagOptions = tags.map(tag => ({
        value: tag.id,
        label: tag.label
    }));

    // ✅ Context의 formData가 아직 준비되지 않았다면 아무것도 렌더링하지 않습니다.
    if (!form) return null;

    return (
        <FormWrapper ref={formRef}>
            <FormBody>
                <FieldSet>
                    <Label htmlFor="title">제목</Label>
                    <Input id="title" placeholder="일정 제목" value={form.title} onChange={set("title")} />
                </FieldSet>

                <CheckboxWrapper>
                    <CustomCheckbox id="all-day" checked={form.allDay} onChange={set("allDay")} />
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
                        onChange={set("tagId")}
                        options={tagOptions}
                        style={{ width: '100%' }}
                        allowClear
                        getPopupContainer={() => formRef.current} // 드롭다운을 form 내부에 렌더링
                    />
                </FieldSet>

                <FieldSet>
                    <Label>반복</Label>
                    <RRuleSummary rrule={form.rrule} onClick={openSidebarForRRule} />
                </FieldSet>

                <FieldSet>
                    <Label htmlFor="description">설명</Label>
                    <Input as="textarea" id="description" rows="5" placeholder="설명" value={form.description} onChange={set("description")} />
                </FieldSet>
            </FormBody>

            <ActionButtons>
                <Button className="secondary" onClick={goBackInSidebar}>취소</Button>
                <Button className="primary" onClick={handleSave}>저장</Button>
            </ActionButtons>
        </FormWrapper>
    )
}

export default ScheduleEdit;