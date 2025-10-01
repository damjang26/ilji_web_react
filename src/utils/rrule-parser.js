// [ROLLBACK_MARKER] - Content commented out as its logic has been consolidated into src/utils/rrule.js
/*
/**
 * Parses a complex rrule string (potentially containing newlines and multiple parts like DTSTART)
 * into a structured object with lowercase keys.
 * Example: "DTSTART:20250930T000000Z\nRRULE:FREQ=DAILY;COUNT=10" -> { dtstart: "...", freq: "DAILY", count: "10" }
 * @param {string} rruleString The rrule string to parse.
 * @returns {object} A key-value object representing the rule.
 */
/*
export const parseRruleString = (rruleString) => {
    if (!rruleString) {
        return {};
    }

    const rruleObject = {};
    // Replace newlines with semicolons, then split, and filter out empty parts.
    const parts = rruleString.replace(/\n/g, ';').split(';').filter(part => part);

    parts.forEach(part => {
        let separator = '=';
        if (part.includes(':') && !part.includes('=')) {
            separator = ':';
        }
        
        const splitIndex = part.indexOf(separator);
        if (splitIndex === -1) return;

        const key = part.substring(0, splitIndex);
        const value = part.substring(splitIndex + 1);

        if (key && value) {
            // Remove potential "RRULE:" prefix from keys
            const cleanKey = key.replace(/^RRULE:/i, '').trim();
            rruleObject[cleanKey.toLowerCase()] = value.trim();
        }
    });

    return rruleObject;
};
*/