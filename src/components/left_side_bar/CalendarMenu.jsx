import styled from "styled-components";

const CalendarMenuContainer = styled.div`
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    justify-content: center; /* 자식 요소들을 수직 중앙에 배치 */
    align-items: center; /* 자식 요소들을 수평 중앙에 배치 */
    gap: 15px; /* 요소들 사이의 간격 */
`;

const CalendarMenu = () => {

    return (
        <CalendarMenuContainer>
            <div>CalendarMenu</div>
        </CalendarMenuContainer>
    )
}

export default CalendarMenu;