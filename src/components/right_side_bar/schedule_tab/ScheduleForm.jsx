import { useEffect, useRef, useMemo } from "react"; // useState 제거
import { useTags } from "../../../contexts/TagContext.jsx";
import { useSchedule } from "../../../contexts/ScheduleContext.jsx"; // ✅ useSchedule 훅 import
import { useAuth } from "../../../AuthContext.jsx";
import { Select } from "antd"; // AntD Select import
import RRuleGenerator from "./RRuleGenerator.jsx";
import RRuleSummary from "./RRuleSummary.jsx";
import {
    CheckboxWrapper,
    CustomCheckbox,
    DateTimeRow,
    FieldSet,
    FormBody,
    FormWrapper,
    Input,
    Label
} from "../../../styled_components/right_side_bar/schedule_tab/ScheduleFormStyled.jsx";
import { ActionButtons, Button } from "../../../styled_components/common/FormElementsStyled.jsx";

const ScheduleForm = ({ onBack, onShowRRuleForm, isInsideModal = false }) => {
    const formRef = useRef(null);
    // ✅ Context에서는 데이터(form)와 데이터 조작 함수(addEvent, updateEvent)만 가져옵니다.
    //    UI 제어 함수(onBack, onShowRRuleForm)는 props를 통해 전달받습니다.
    const { formData: form, setFormData: setForm, addEvent, updateEvent } = useSchedule();
    const { tags } = useTags();
    const { user } = useAuth();

    const myTags = useMemo(() => {
        if (!user) return [];
        return tags.filter(tag => tag.owner.userId === user.id);
    }, [tags, user]);

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
        if (form && form.startDate > form.endDate) {
            setForm(prev => ({ ...prev, endDate: prev.startDate }));
        }
        if (form && form.startDate === form.endDate && form.startTime > form.endTime) {
            setForm(prev => ({ ...prev, endTime: prev.startTime }));
        }
    }, [form?.startDate, form?.startTime, form?.endDate, form?.endTime, setForm]);

    const handleSave = () => {
        const { title, description, allDay, startDate, startTime, endDate, endTime, location, tagId, calendarId, rrule } = form;
        const finalTitle = title.trim() ? title : "New Schedule";
        const finalStart = allDay ? startDate : `${startDate}T${startTime}`;
        const finalEnd = allDay ? endDate : `${endDate}T${endTime}`;

        const eventData = {
            id: form.id,
            title: finalTitle,
            start: finalStart,
            end: finalEnd,
            allDay,
            rrule: rrule || null,
            extendedProps: {
                description,
                location,
                tagId,
                calendarId,
            }
        };

        form.id ? updateEvent(eventData) : addEvent(eventData);
        onBack(); // props로 받은 onBack 함수 호출
    };

    // 태그 선택 옵션을 생성
    const tagOptions = myTags.map(tag => ({
        value: tag.id,
        label: tag.label
    }));

    if (!form) return null;

    return (
        <FormWrapper ref={formRef} isInsideModal={isInsideModal}>
            <FormBody>
                {/* ... 다른 FieldSet들 ... */}
                <FieldSet>
                    <Label htmlFor="title">Title</Label>
                    <Input id="title" placeholder="Schedule Title" value={form.title} onChange={set("title")} />
                </FieldSet>

                <CheckboxWrapper>
                    <CustomCheckbox id="all-day" checked={form.allDay} onChange={set("allDay")} />
                    <Label htmlFor="all-day" style={{fontWeight: 'normal', cursor: 'pointer'}}>All day</Label>
                </CheckboxWrapper>

                {/* ✅ 날짜/시간 구조 변경 */}
                <FieldSet>
                    <Label>Date & Time</Label>
                    <DateTimeRow>
                        <Input
                            type="date"
                            value={form.startDate}
                            onChange={set("startDate")}
                        />
                        <Input
                            type="date"
                            value={form.endDate}
                            min={form.startDate}
                            onChange={set("endDate")}
                        />
                    </DateTimeRow>

                    {!form.allDay && (
                        <DateTimeRow>
                            <Input
                                type="time"
                                value={form.startTime}
                                onChange={set("startTime")}
                            />
                            <Input
                                type="time"
                                value={form.endTime}
                                min={form.startDate === form.endDate ? form.startTime : undefined}
                                onChange={set("endTime")}
                            />
                        </DateTimeRow>
                    )}
                </FieldSet>
                {/* ✅ 여기까지 날짜/시간 구조 수정 */}

                <FieldSet>
                    <Label htmlFor="location">Location</Label>
                    <Input id="location" placeholder="Location" value={form.location} onChange={set("location")} />
                </FieldSet>

                {/* 태그 입력을 Select로 변경 */}
                <FieldSet>
                    <Label htmlFor="tags">Tag</Label>
                    <Select
                        id="tags"
                        placeholder="Select a tag"
                        value={form.tagId}
                        onChange={set("tagId")}
                        options={tagOptions}
                        style={{ width: '100%' }}
                        allowClear
                        getPopupContainer={() => formRef.current}
                    />
                </FieldSet>

                <FieldSet>
                    <Label>Repeat</Label>
                    <RRuleSummary rrule={form.rrule} onClick={onShowRRuleForm} />
                </FieldSet>

                <FieldSet>
                    <Label htmlFor="description">Description</Label>
                    <Input as="textarea" id="description" rows="5" placeholder="Description" value={form.description} onChange={set("description")} />
                </FieldSet>
            </FormBody>

            <ActionButtons>
                <Button className="secondary" onClick={onBack}>Cancel</Button>
                <Button className="primary" onClick={handleSave}>Save</Button>
            </ActionButtons>
        </FormWrapper>
    )
}

export default ScheduleForm;
