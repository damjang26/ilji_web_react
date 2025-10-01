import React, { useMemo } from 'react';
import { FaChevronRight } from 'react-icons/fa';
import { SummaryWrapper, SummaryText, ChevronIcon } from '../../../styled_components/right_side_bar/schedule_tab/RRuleSummaryStyled';
import { rruleToText } from '../../../utils/rrule.js';

// [ROLLBACK_MARKER]
// const WEEKDAYS_MAP = { MO: '월', TU: '화', WE: '수', TH: '목', FR: '금', SA: '토', SU: '일' };
// const WEEKDAYS_ORDER = ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'];

const RRuleSummary = ({ rrule, onClick }) => {
    const summaryText = useMemo(() => rruleToText(rrule), [rrule]);

    // [ROLLBACK_MARKER]
    // const summaryText = useMemo(() => {
    //     if (!rrule) {
    //         return '반복 안 함';
    //     }
    //
    //     const rules = rrule.split(';').reduce((acc, rule) => {
    //         const [key, val] = rule.split('=');
    //         if (key && val) acc[key] = val;
    //         return acc;
    //     }, {});
    //
    //     const { FREQ, INTERVAL, BYDAY, COUNT, UNTIL } = rules;
    //     let summary = '';
    //
    //     // 1. Frequency and Interval
    //     const interval = parseInt(INTERVAL, 10) || 1;
    //     switch (FREQ) {
    //         case 'DAILY':
    //             summary = interval > 1 ? `${interval}일마다` : '매일';
    //             break;
    //         case 'WEEKLY':
    //             summary = interval > 1 ? `${interval}주마다` : '매주';
    //             if (BYDAY) {
    //                 const days = BYDAY.split(',').sort((a, b) => WEEKDAYS_ORDER.indexOf(a) - WEEKDAYS_ORDER.indexOf(b)).map(day => WEEKDAYS_MAP[day]).join(', ');
    //                 summary += ` ${days}요일`;
    //             }
    //             break;
    //         case 'MONTHLY':
    //             summary = interval > 1 ? `${interval}개월마다` : '매월';
    //             break;
    //         case 'YEARLY':
    //             summary = interval > 1 ? `${interval}년마다` : '매년';
    //             break;
    //         default:
    //             return '반복 안 함';
    //     }
    //
    //     // 2. Termination
    //     if (COUNT) {
    //         summary += `, ${COUNT}회`;
    //     } else if (UNTIL) {
    //         const date = UNTIL.substring(0, 8).replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3');
    //         summary += `, ${date}까지`;
    //     }
    //
    //     return summary;
    // }, [rrule]);


    return (
        <SummaryWrapper onClick={onClick}>
            <SummaryText>{summaryText}</SummaryText>
            <ChevronIcon>
                <FaChevronRight />
            </ChevronIcon>
        </SummaryWrapper>
    );
};

export default RRuleSummary;