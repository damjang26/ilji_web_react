import React, { useMemo, useCallback } from 'react';
import {
    GeneratorWrapper,
    Row,
    Select,
    DayButtonGroup,
    DayButton,
    Section,
    InputRow,
    SmallInput,
    RadioGroup,
    RadioLabel,
    RadioInput,
    ClickableInputWrapper,
} from '../../../styled_components/right_side_bar/schedule_tab/RRuleGeneratorStyled';
import { ActionButtons, Button } from '../../../styled_components/common/FormElementsStyled.jsx'; // ✅ 버튼 추가

// --- Constants for better readability and maintenance ---
const FREQ_OPTIONS = {
    NONE: '',
    DAILY: 'DAILY',
    WEEKLY: 'WEEKLY',
    MONTHLY: 'MONTHLY',
    YEARLY: 'YEARLY',
};

const TERMINATION_TYPES = {
    NONE: 'none',
    COUNT: 'count',
    UNTIL: 'until',
};

const WEEKDAYS = [
    { label: '월', value: 'MO' },
    { label: '화', value: 'TU' },
    { label: '수', value: 'WE' },
    { label: '목', value: 'TH' },
    { label: '금', value: 'FR' },
    { label: '토', value: 'SA' },
    { label: '일', value: 'SU' },
];

// Helper to sort BYDAY arrays consistently according to the defined order (월-일)
const sortWeekdays = (days) => WEEKDAYS.map(d => d.value).filter(day => days.includes(day))

/**
 * Parses an rrule string into a structured state object.
 * @param {string} rruleString The rrule string to parse.
 * @returns {object} A state object representing the rule.
 */
const parseRRule = (rruleString) => {
    const initialState = {
        freq: FREQ_OPTIONS.NONE,
        interval: 1,
        byday: [],
        terminationType: TERMINATION_TYPES.NONE,
        count: 10,
        until: '',
    };

    if (!rruleString) return initialState;

    const rules = rruleString.split(';').reduce((acc, rule) => {
        const [key, val] = rule.split('=');
        if (key && val) acc[key] = val;
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
 * Generates an rrule string from a state object.
 * @param {object} state The state object.
 * @returns {string} The generated rrule string.
 */
const generateRRule = (state) => {
    const { freq, interval, byday, terminationType, count, until } = state;
    if (!freq) return '';

    let newRruleParts = [`FREQ=${freq}`];

    if (interval > 1) {
        newRruleParts.push(`INTERVAL=${interval}`);
    }

    if (freq === FREQ_OPTIONS.WEEKLY && byday.length > 0) {
        newRruleParts.push(`BYDAY=${byday.join(',')}`);
    }

    switch (terminationType) {
        case TERMINATION_TYPES.COUNT:
            newRruleParts.push(`COUNT=${count}`);
            break;
        case TERMINATION_TYPES.UNTIL:
            if (until) {
                const utcDate = until.replace(/-/g, '') + 'T235959Z';
                newRruleParts.push(`UNTIL=${utcDate}`);
            }
            break;
        default:
            break;
    }
    return newRruleParts.join(';');
};

const RRuleGenerator = ({ value, onChange, onClose }) => {
    // 1. Derive UI state directly from props. No internal state management.
    const currentState = useMemo(() => parseRRule(value), [value]);

    // 2. Create a single, memoized handler to update the parent.
    const handleStateChange = useCallback((newState) => {
        const newRrule = generateRRule(newState);
        if (newRrule !== value) {
            onChange(newRrule);
        }
    }, [value, onChange]);

    // 3. All event handlers now calculate the next state and call handleStateChange.
    const handleFreqChange = (e) => {
        const newFreq = e.target.value;
        handleStateChange({
            ...currentState,
            freq: newFreq,
            interval: 1, // Reset interval
            byday: newFreq === FREQ_OPTIONS.WEEKLY ? currentState.byday : [], // Reset byday if not weekly
        });
    };

    const handleIntervalChange = (e) => {
        handleStateChange({
            ...currentState,
            interval: Math.max(1, parseInt(e.target.value, 10) || 1),
        });
    };

    const handleDayClick = (dayValue) => {
        const newByday = currentState.byday.includes(dayValue)
            ? currentState.byday.filter(d => d !== dayValue)
            : [...currentState.byday, dayValue];
        handleStateChange({ ...currentState, byday: sortWeekdays(newByday) });
    };

    const handleTerminationTypeChange = (type) => {
        handleStateChange({ ...currentState, terminationType: type });
    };

    const handleCountChange = (e) => {
        handleStateChange({
            ...currentState,
            terminationType: TERMINATION_TYPES.COUNT,
            count: Math.max(1, parseInt(e.target.value, 10) || 1),
        });
    };

    const handleUntilChange = (e) => {
        handleStateChange({
            ...currentState,
            terminationType: TERMINATION_TYPES.UNTIL,
            until: e.target.value,
        });
    };

    const handleCountInputClick = () => {
        if (currentState.terminationType !== TERMINATION_TYPES.COUNT) {
            handleTerminationTypeChange(TERMINATION_TYPES.COUNT);
        }
    };

    const handleUntilInputClick = () => {
        if (currentState.terminationType !== TERMINATION_TYPES.UNTIL) {
            handleTerminationTypeChange(TERMINATION_TYPES.UNTIL);
        }
    };

    const { freq, interval, byday, terminationType, count, until } = currentState;

    const freqLabel = useMemo(() => {
        switch (freq) {
            case FREQ_OPTIONS.DAILY: return '일';
            case FREQ_OPTIONS.WEEKLY: return '주';
            case FREQ_OPTIONS.MONTHLY: return '개월';
            case FREQ_OPTIONS.YEARLY: return '년';
            default: return '';
        }
    }, [freq]);

    // --- Render ---
    return (
        <GeneratorWrapper>
            {/* Frequency and Interval */}
            <Row>
                <Select value={freq} onChange={handleFreqChange}>
                    <option value={FREQ_OPTIONS.NONE}>반복 안 함</option>
                    <option value={FREQ_OPTIONS.DAILY}>매일</option>
                    <option value={FREQ_OPTIONS.WEEKLY}>매주</option>
                    <option value={FREQ_OPTIONS.MONTHLY}>매월</option>
                    <option value={FREQ_OPTIONS.YEARLY}>매년</option>
                </Select>
            </Row>

            {freq && (
                <InputRow>
                    <SmallInput
                        type="number"
                        value={interval}
                        onChange={handleIntervalChange}
                        min="1"
                    />
                    <span>{freqLabel}마다 반복</span>
                </InputRow>
            )}

            {/* Weekly Options */}
            {freq === FREQ_OPTIONS.WEEKLY && (
                <Row>
                    <DayButtonGroup>
                        {WEEKDAYS.map(day => (
                            <DayButton
                                key={day.value}
                                type="button"
                                $isSelected={byday.includes(day.value)}
                                onClick={() => handleDayClick(day.value)}
                            >
                                {day.label}
                            </DayButton>
                        ))}
                    </DayButtonGroup>
                </Row>
            )}

            {/* Monthly/Yearly Options (Placeholder for future) */}
            {/* ... */}

            {/* Termination Options */}
            {freq && (
                <Section>
                    <RadioGroup>
                        <RadioLabel>
                            <RadioInput
                                name="termination"
                                value={TERMINATION_TYPES.NONE}
                                checked={terminationType === TERMINATION_TYPES.NONE}
                                onChange={() => handleTerminationTypeChange(TERMINATION_TYPES.NONE)}
                            />
                            계속 반복
                        </RadioLabel>

                        <RadioLabel>
                            <RadioInput
                                name="termination"
                                value={TERMINATION_TYPES.COUNT}
                                checked={terminationType === TERMINATION_TYPES.COUNT}
                                onChange={() => handleTerminationTypeChange(TERMINATION_TYPES.COUNT)}
                            />
                            <ClickableInputWrapper>
                                <SmallInput
                                    type="number"
                                    value={count}
                                    onChange={handleCountChange}
                                    min="1"
                                    onClick={handleCountInputClick}
                                />
                                <span>회 반복</span>
                            </ClickableInputWrapper>
                        </RadioLabel>

                        <RadioLabel>
                            <RadioInput
                                name="termination"
                                value={TERMINATION_TYPES.UNTIL}
                                checked={terminationType === TERMINATION_TYPES.UNTIL}
                                onChange={() => handleTerminationTypeChange(TERMINATION_TYPES.UNTIL)}
                            />
                             <ClickableInputWrapper>
                                <span>종료 날짜</span>
                                <SmallInput
                                    as="input"
                                    type="date"
                                    value={until}
                                    onChange={handleUntilChange}
                                    onClick={handleUntilInputClick}
                                    style={{width: 'auto'}}
                                />
                             </ClickableInputWrapper>
                        </RadioLabel>
                    </RadioGroup>
                </Section>
            )}

            {/* ✅ 확인/뒤로가기 버튼 추가 */}
            <ActionButtons>
                <Button className="secondary" onClick={onClose}>뒤로가기</Button>
                <Button className="primary" onClick={onClose}>확인</Button>
            </ActionButtons>
        </GeneratorWrapper>
    );
};

export default RRuleGenerator;