import React, {useState, useEffect} from 'react'; // ✅ useEffect 추가
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import {useJournal} from '../../contexts/JournalContext.jsx';
import {
    CalendarGlobalStyle,
    DatePickerContainer,
    DatePickerWrapper,
    PanelDescription
} from "../../styled_components/right_side_bar/JournalDatePickerStyled.jsx";
import {Button} from "../../styled_components/common/FormElementsStyled.jsx";

const JournalDatePicker = ({onDateSelect}) => { // onDateSelect는 패널을 닫는 용도로 사용됩니다.
    // ✅ [수정] setVisibleDateRange 함수를 추가로 가져옵니다.
    const {hasMyJournal, setVisibleDateRange} = useJournal();
    // ✅ [추가] 사용자가 선택한 날짜를 관리하기 위한 내부 상태
    const [selectedDate, setSelectedDate] = useState(new Date());

    // ✅ [신규] DatePicker의 월이 변경될 때마다 실행되는 함수
    const handleMonthChange = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const startDate = new Date(year, month, 1);
        const endDate = new Date(year, month + 1, 0); // 해당 월의 마지막 날

        // JournalContext에 필요한 데이터 범위를 알려줍니다.
        setVisibleDateRange({
            start: startDate.toISOString().split('T')[0],
            end: endDate.toISOString().split('T')[0],
        });
    };

    // ✅ [신규] 컴포넌트가 처음 마운트될 때 현재 월의 데이터를 로드합니다.
    useEffect(() => {
        handleMonthChange(selectedDate);
    }, []); // 처음 한 번만 실행

    const isDateDisabled = (date) => {
        // 1. 오늘 이후의 날짜는 비활성화
        if (date > new Date()) {
            return true;
        }

        // 2. 이미 일기가 작성된 날짜는 비활성화
        // ✅ [수정] toISOString()은 UTC 기준으로 변환하여 시간대 오류를 유발하므로,
        // 사용자의 로컬 시간대를 기준으로 'YYYY-MM-DD' 형식의 문자열을 생성합니다.
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;

        if (hasMyJournal(dateStr)) { // ✅ [수정] hasMyJournal로 변경
            return true;
        }

        return false;
    };

    return (
        <DatePickerContainer>
            <CalendarGlobalStyle/>
            <PanelDescription>🗓️Start your i-log — just pick a date!📝</PanelDescription>
            <DatePickerWrapper>
                <DatePicker
                    selected={selectedDate}
                    onChange={(date) => setSelectedDate(date)}
                    filterDate={date => !isDateDisabled(date)}
                    onMonthChange={handleMonthChange} // ✅ [추가] 월 변경 시 핸들러 연결
                    inline
                />
            </DatePickerWrapper>
            {/* ✅ [수정] isDateDisabled 함수를 사용하여 선택된 날짜에 일기가 이미 있으면 버튼을 비활성화합니다. */}
            <Button
                className="primary"
                onClick={() => onDateSelect(selectedDate)}
                disabled={isDateDisabled(selectedDate)} // ✅ [추가] disabled 속성 추가
                style={{width: '100%'}}>
                Write i-log
            </Button>
        </DatePickerContainer>
    );
};

export default JournalDatePicker;