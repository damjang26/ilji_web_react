/**
 * Parses an rrule string into a structured object with lowercase keys.
 * Example: "FREQ=WEEKLY;BYDAY=MO,FR" -> { freq: "WEEKLY", byday: "MO,FR" }
 * @param {string} rruleString The rrule string to parse.
 * @returns {object} A key-value object representing the rule.
 */
export const parseRruleString = (rruleString) => {
    if (!rruleString) {
        return {};
    }
    const rruleObject = {};
    rruleString.split(';').forEach(part => {
        const [key, value] = part.split('=');
        if (key && value) {
            // FullCalendar's rrule object properties are lowercase (freq, dtstart, etc.)
            rruleObject[key.toLowerCase()] = value;
        }
    });
    return rruleObject;
};
