import React, { useCallback } from 'react';
import ScheduleForm from '../../right_side_bar/schedule_tab/ScheduleForm';
import ScheduleDetail from '../../right_side_bar/schedule_tab/ScheduleDetail';
import ScheduleList from '../../right_side_bar/schedule_tab/ScheduleList';
import RRuleGenerator from '../../right_side_bar/schedule_tab/RRuleGenerator';
import { useSchedule } from '../../../contexts/ScheduleContext';

const SchedulePanelContent = () => {
    console.log("SchedulePanelContent: Component rendering started.");
    const { events, selectedInfo, goBackInSchedulePanel, openSchedulePanelForEdit, openSchedulePanelForRRule, formData, setFormData, openSchedulePanelForDetail, requestDeleteConfirmation } = useSchedule();

    const handleRruleChange = useCallback((newRrule) => {
        setFormData(prev => ({ ...prev, rrule: newRrule }));
    }, [setFormData]);

    // 캘린더 빈 공간 클릭 시 (list_for_date)에는 패널을 띄우지 않습니다.
    if (selectedInfo?.type === 'list_for_date') {
        return null;
    }

    if (!selectedInfo) return null;

    switch (selectedInfo.type) {
        case 'new':
        case 'edit':
            return <ScheduleForm onBack={goBackInSchedulePanel} onShowRRuleForm={openSchedulePanelForRRule} />;
        case 'detail':
            return <ScheduleDetail event={selectedInfo.data} onBack={goBackInSchedulePanel} onEdit={openSchedulePanelForEdit} onDelete={requestDeleteConfirmation} onCancel={goBackInSchedulePanel} />;
            // 이게 캘린더 날짜 빈공간 클릭 했을때 안에 그려질 정보
            // case 'list_for_date':
            //     return <ScheduleList allEvents={events} dateInfo={selectedInfo.data} onBack={goBackInSchedulePanel} onDetail={openSchedulePanelForDetail} />;
        case 'rrule_form':
            return <RRuleGenerator value={formData.rrule} onChange={handleRruleChange} onClose={goBackInSchedulePanel} />;
        default:
            return null;
    }
};

export default SchedulePanelContent;
