import { RRule } from 'rrule';

// Constants
const WEEKDAYS_MAP = { MO: '월', TU: '화', WE: '수', TH: '목', FR: '금', SA: '토', SU: '일' };
const WEEKDAYS_ORDER = ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'];

export const FREQ_OPTIONS = {
    NONE: '',
    DAILY: 'DAILY',
    WEEKLY: 'WEEKLY',
    MONTHLY: 'MONTHLY',
    YEARLY: 'YEARLY',
};

export const TERMINATION_TYPES = {
    NONE: 'none',
    COUNT: 'count',
    UNTIL: 'until',
};

// Helper to sort BYDAY arrays consistently
const sortWeekdays = (days) => {
    if (!Array.isArray(days)) return [];
    return WEEKDAYS_ORDER.filter(day => days.includes(day));
};

/**
 * Parses an RRULE string into a standardized state object.
 * Handles various formats (with/without RRULE: prefix, mixed case keys).
 * @param {string} rruleString The RRULE string to parse.
 * @returns {object} A standardized state object for UI and logic.
 */
export const parseRRule = (rruleString) => {
    const initialState = {
        freq: FREQ_OPTIONS.NONE,
        interval: 1,
        byday: [],
        terminationType: TERMINATION_TYPES.NONE,
        count: 10,
        until: '',
    };

    if (!rruleString) return initialState;

    // Normalize the string: remove prefix, split into parts
    const rules = rruleString.replace(/^RRULE:/i, '').split(';').reduce((acc, rule) => {
        const [key, val] = rule.split('=');
        if (key && val) {
            acc[key.toUpperCase()] = val; // Standardize keys to uppercase
        }
        return acc;
    }, {});

    let terminationType = TERMINATION_TYPES.NONE;
    let count = initialState.count;
    let until = initialState.until;

    if (rules.COUNT) {
        terminationType = TERMINATION_TYPES.COUNT;
        count = parseInt(rules.COUNT, 10);
    } else if (rules.UNTIL) {
        terminationType = TERMINATION_TYPES.UNTIL;
        // Handle YYYYMMDDTHHmmssZ format
        const untilDateStr = rules.UNTIL.split('T')[0];
        if (untilDateStr && untilDateStr.length === 8) {
            until = `${untilDateStr.slice(0, 4)}-${untilDateStr.slice(4, 6)}-${untilDateStr.slice(6, 8)}`;
        }
    }

    const rawByday = rules.BYDAY ? rules.BYDAY.split(',') : [];

    return {
        freq: rules.FREQ || FREQ_OPTIONS.NONE,
        interval: parseInt(rules.INTERVAL, 10) || 1,
        byday: sortWeekdays(rawByday),
        terminationType,
        count,
        until,
    };
};

/**
 * Generates a standardized RRULE string from a state object.
 * @param {object} state The state object (from parseRRule or UI).
 * @returns {string} The generated RRULE string (e.g., "FREQ=DAILY;INTERVAL=2").
 */
export const generateRRule = (state) => {
    const { freq, interval, byday, terminationType, count, until } = state;
    if (!freq || freq === FREQ_OPTIONS.NONE) return '';

    let newRruleParts = [`FREQ=${freq}`];

    if (interval > 1) {
        newRruleParts.push(`INTERVAL=${interval}`);
    }

    if (freq === FREQ_OPTIONS.WEEKLY && byday.length > 0) {
        // Ensure days are sorted before joining
        newRruleParts.push(`BYDAY=${sortWeekdays(byday).join(',')}`);
    }

    switch (terminationType) {
        case TERMINATION_TYPES.COUNT:
            if (count > 0) {
                newRruleParts.push(`COUNT=${count}`);
            }
            break;
        case TERMINATION_TYPES.UNTIL:
            if (until) {
                // Convert YYYY-MM-DD to YYYYMMDDTHHmmssZ for RFC 5545 compliance
                const utcDate = until.replace(/-/g, '') + 'T235959Z';
                newRruleParts.push(`UNTIL=${utcDate}`);
            }
            break;
        default:
            break;
    }
    return newRruleParts.join(';');
};

/**
 * Generates a human-readable summary text from an RRULE string.
 * @param {string} rruleString The RRULE string.
 * @returns {string} A human-readable summary (e.g., "매주 월, 수요일, 10회").
 */
export const rruleToText = (rruleString) => {
    if (!rruleString) {
        return '반복 안 함';
    }

    // Use the standardized parser
    const rules = parseRRule(rruleString);

    const { freq, interval, byday, terminationType, count, until } = rules;
    let summary = '';

    // 1. Frequency and Interval
    switch (freq) {
        case FREQ_OPTIONS.DAILY:
            summary = interval > 1 ? `${interval}일마다` : '매일';
            break;
        case FREQ_OPTIONS.WEEKLY:
            summary = interval > 1 ? `${interval}주마다` : '매주';
            if (byday && byday.length > 0) {
                const days = sortWeekdays(byday).map(day => WEEKDAYS_MAP[day]).join(', ');
                summary += ` ${days}요일`;
            }
            break;
        case FREQ_OPTIONS.MONTHLY:
            summary = interval > 1 ? `${interval}개월마다` : '매월';
            break;
        case FREQ_OPTIONS.YEARLY:
            summary = interval > 1 ? `${interval}년마다` : '매년';
            break;
        default:
            return '반복 안 함';
    }

    // 2. Termination
    if (terminationType === TERMINATION_TYPES.COUNT) {
        summary += `, ${count}회`;
    } else if (terminationType === TERMINATION_TYPES.UNTIL && until) {
        summary += `, ${until}까지`;
    }

    return summary;
};

/**
 * Parses an RRULE string into a simple key-value object for FullCalendar.
 * Keys are lowercased to be compatible with rrule.js options.
 * @param {string} rruleString The RRULE string.
 * @returns {object} A simple key-value object (e.g., {freq: 'weekly', count: 10}).
 */
export const parseRRuleForCalendar = (rruleString) => {
  if (!rruleString) {
    return {};
  }

  const rruleObject = {};
  const parts = rruleString
    .replace(/^RRULE:/i, '')
    .replace(/\n/g, ';')
    .split(';')
    .filter(part => part);

  parts.forEach(part => {
    const splitIndex = part.indexOf('=');
    if (splitIndex === -1) return;

    const key = part.substring(0, splitIndex).trim().toLowerCase();
    let value = part.substring(splitIndex + 1).trim();

    if (key === 'byday') {
      // convert BYDAY → byweekday with Weekday objects
      const days = value.split(',').map(dayStr => {
        switch (dayStr) {
          case 'SU': return RRule.SU;
          case 'MO': return RRule.MO;
          case 'TU': return RRule.TU;
          case 'WE': return RRule.WE;
          case 'TH': return RRule.TH;
          case 'FR': return RRule.FR;
          case 'SA': return RRule.SA;
          default: return null;
        }
      }).filter(Boolean);
      rruleObject['byweekday'] = days;
      return; // skip adding "byday"
    } else if (key === 'count' || key === 'interval') {
      value = parseInt(value, 10);
    } else if (key === 'until') {
      if (value.length === 8) {
        value = `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}T23:59:59Z`;
      } else if (value.length === 15 && value.endsWith('Z')) {
        value = `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}T${value.slice(9, 11)}:${value.slice(11, 13)}:${value.slice(13, 15)}Z`;
      }
    }

    if (key && value !== undefined) {
      rruleObject[key] = value;
    }
  });

  return rruleObject;
};
