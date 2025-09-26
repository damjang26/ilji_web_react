import React, { useMemo } from 'react';
import { FaChevronRight } from 'react-icons/fa';
import { SummaryWrapper, SummaryText, ChevronIcon } from '../../../styled_components/right_side_bar/schedule_tab/RRuleSummaryStyled';

// [수정] 요일 맵을 영어로 변경합니다.
const WEEKDAYS_MAP = { MO: 'Mon', TU: 'Tue', WE: 'Wed', TH: 'Thu', FR: 'Fri', SA: 'Sat', SU: 'Sun' };
const WEEKDAYS_ORDER = ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'];

const RRuleSummary = ({ rrule, onClick }) => {
    const summaryText = useMemo(() => {
        if (!rrule) {
            return 'Does not repeat'; // [수정]
        }

        const rules = rrule.split(';').reduce((acc, rule) => {
            const [key, val] = rule.split('=');
            if (key && val) acc[key] = val;
            return acc;
        }, {});

        const { FREQ, INTERVAL, BYDAY, COUNT, UNTIL } = rules;
        let summary = '';

        // 1. Frequency and Interval
        const interval = parseInt(INTERVAL, 10) || 1;
        switch (FREQ) {
            case 'DAILY':
                summary = interval > 1 ? `Every ${interval} days` : 'Every day'; // [수정]
                break;
            case 'WEEKLY':
                summary = interval > 1 ? `Every ${interval} weeks` : 'Every week'; // [수정]
                if (BYDAY) {
                    const days = BYDAY.split(',').sort((a, b) => WEEKDAYS_ORDER.indexOf(a) - WEEKDAYS_ORDER.indexOf(b)).map(day => WEEKDAYS_MAP[day]).join(', ');
                    summary += ` on ${days}`; // [수정]
                }
                break;
            case 'MONTHLY':
                summary = interval > 1 ? `Every ${interval} months` : 'Every month'; // [수정]
                break;
            case 'YEARLY':
                summary = interval > 1 ? `Every ${interval} years` : 'Every year'; // [수정]
                break;
            default:
                return 'Does not repeat'; // [수정]
        }

        // 2. Termination
        if (COUNT) {
            summary += `, ${COUNT} times`; // [수정]
        } else if (UNTIL) {
            const date = UNTIL.substring(0, 8).replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3');
            summary += `, until ${date}`; // [수정]
        }

        return summary;
    }, [rrule]);

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