const WEEKDAYS_MAP = { MO: 'Mon', TU: 'Tue', WE: 'Wed', TH: 'Thu', FR: 'Fri', SA: 'Sat', SU: 'Sun' };
const WEEKDAYS_ORDER = ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'];

export const rruleToText = (rrule) => {
    if (!rrule) {
        return 'Does not repeat';
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
            summary = interval > 1 ? `Every ${interval} days` : 'Daily';
            break;
        case 'WEEKLY':
            summary = interval > 1 ? `Every ${interval} weeks` : 'Weekly';
            if (BYDAY) {
                const days = BYDAY.split(',').sort((a, b) => WEEKDAYS_ORDER.indexOf(a) - WEEKDAYS_ORDER.indexOf(b)).map(day => WEEKDAYS_MAP[day]).join(', ');
                summary += ` on ${days}`;
            }
            break;
        case 'MONTHLY':
            summary = interval > 1 ? `Every ${interval} months` : 'Monthly';
            break;
        case 'YEARLY':
            summary = interval > 1 ? `Every ${interval} years` : 'Annually';
            break;
        default:
            return 'Does not repeat';
    }

    // 2. Termination
    if (COUNT) {
        summary += `, ${COUNT} times`;
    } else if (UNTIL) {
        const date = UNTIL.substring(0, 8).replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3');
        summary += `, until ${date}`;
    }

    return summary;
};