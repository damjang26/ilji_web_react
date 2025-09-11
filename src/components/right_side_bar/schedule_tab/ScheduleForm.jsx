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

const ScheduleForm = ({ tags: tagsFromProp }) => {
    const formRef = useRef(null);
    // ✅ 1. Context에서 공유 폼 데이터와 태그 데이터를 가져옵니다.
    // ✅ [수정] selectedInfo를 추가로 가져와 뷰를 전환하는 데 사용합니다.
    const { formData: form, setFormData: setForm, goBackInSidebar, addEvent, updateEvent, openSidebarForRRule, selectedInfo } = useSchedule();
    const { tags: tagsFromContext } = useTags();
    const { user } = useAuth();
    const tags = tagsFromProp || tagsFromContext; // prop으로 받은 tags가 있으면 사용, 없으면 context의 것 사용

    const myTags = useMemo(() => {
        if (!user) return [];
        return tags.filter(tag => tag.owner.userId === user.id);
    }, [tags, user]);

    // ✅ 2. 내부 상태(useState)와 초기화 로직(useEffect)을 제거합니다.
    //    이제 모든 상태는 ScheduleContext에서 관리합니다.

    // set 함수를 tagId 변경에도 대응하도록 수정
    const set = (k) => (v) => {
        // AntD Select는 event 객체가 아닌 value를 직접 전달
        if (k === 'tagId') {
            setForm((prev) => ({ ...prev, [k]: v })); // ✅ Context의 setFormData를 호출
            return;
        }
        const value = v?.target?.type === "checkbox" ? v.target.checked : v.target.value;
        setForm((prev) => ({ ...prev, [k]: value }));
    };

    useEffect(() => {
        if (form && form.startDate > form.endDate) { // ✅ form이 null이 아닌지 확인
            setForm(prev => ({ ...prev, endDate: prev.startDate }));
        }
        if (form && form.startDate === form.endDate && form.startTime > form.endTime) { // ✅ form null 체크 추가
            setForm(prev => ({ ...prev, endTime: prev.startTime }));
        }
    }, [form?.startDate, form?.startTime, form?.endDate, form?.endTime, setForm]); // ✅ 의존성 배열을 안전하게 변경

    // ✅ [신규] RRuleGenerator의 변경사항을 받아 formData의 최상위 rrule을 업데이트하는 핸들러입니다.
    const handleRRuleChange = (newRruleString) => {
        setForm(prev => ({
            ...prev,
            rrule: newRruleString,
        }));
    };

    const handleSave = () => {
        const { title, description, allDay, startDate, startTime, endDate, endTime, location, tagId, calendarId, rrule } = form;
        const finalTitle = title.trim() ? title : "새 일정";
        const finalStart = allDay ? startDate : `${startDate}T${startTime}`;
        const finalEnd = allDay ? endDate : `${endDate}T${endTime}`;

        const eventData = {
            id: form.id, // 폼 데이터에 id가 있으면 '수정', 없으면 '생성'으로 판단합니다.
            title: finalTitle,
            start: finalStart,
            end: finalEnd,
            allDay,
            // ✅ [버그 수정] rrule이 빈 문자열("\\")일 경우, FullCalendar가 오류를 발생시키므로 null로 변환합니다.
            rrule: rrule || null,
            extendedProps: {
                description,
                location,
                tagId,
                calendarId,
            }
        };

        // id 유무에 따라 생성 또는 업데이트 함수를 호출합니다.
        form.id ? updateEvent(eventData) : addEvent(eventData);
        // 저장 후, Context의 goBackInSidebar 함수를 호출해 이전 화면으로 돌아갑니다.
        goBackInSidebar();
    };

    // 태그 선택 옵션을 생성
    const tagOptions = myTags.map(tag => ({
        value: tag.id,
        label: tag.label
    }));

    // ✅ 3. Context의 formData가 아직 준비되지 않았다면 아무것도 렌더링하지 않습니다.
    if (!form) return null;

    // ✅ [핵심 수정] selectedInfo.type에 따라 반복 규칙 생성기(RRuleGenerator)를 렌더링합니다.
    if (selectedInfo.type === 'rrule_form') {
        return (
            <RRuleGenerator
                value={form.rrule || ''} // ✅ 최상위 rrule 값을 전달합니다.
                onChange={handleRRuleChange} // ✅ 최상위 rrule을 업데이트하는 핸들러를 전달합니다.
                onClose={goBackInSidebar}
            />
        );
    }

    return (
        <FormWrapper ref={formRef}>
            <FormBody>
                {/* ... 다른 FieldSet들 ... */}
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
                        onChange={set("tagId")} // set 함수가 직접 value를 받도록 수정했음
                        options={tagOptions}
                        style={{ width: '100%' }}
                        allowClear // 선택을 취소할 수 있는 x 버튼 추가
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

export default ScheduleForm;

