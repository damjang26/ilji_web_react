import styled from "styled-components";

/** ScheduleList.jsx의 스타일을 정의합니다. (일정 목록) */

/** 목록 뷰 전체를 감싸는 컨테이너 */
export const ListWrapper = styled.div`
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: 8px;
    box-sizing: border-box;
`;

/** 날짜 제목을 포함하는 헤더 영역 */
export const ListHeader = styled.header`
    padding-bottom: 12px;
    border-bottom: 1px solid #e9ecef;
`;

/** 선택된 날짜를 표시하는 텍스트 */
export const DateTitle = styled.h2`
    font-size: 18px;
    font-weight: 600;
    color: #343a40;
    margin: 0;
`;

/** 일정 목록을 감싸는 ul 태그, 스크롤 가능 */
export const EventList = styled.ul`
    list-style: none;
    padding: 16px 0;
    margin: 0;
    flex-grow: 1;
    overflow-y: auto;
`;

/** 개별 일정 항목을 나타내는 li 태그 */
export const EventItem = styled.li`
    padding: 12px;
    margin-bottom: 8px;
    border-radius: 6px;
    cursor: pointer;
    transition: background-color 0.2s, transform 0.2s;
    background-color: #f8f9fa;
    border: 1px solid #e9ecef;
    font-weight: 500;
    color: #212529;
    font-size: 14px;

    &:hover {
        background-color: #f1f3f5;
        transform: translateY(-2px);
    }
`;

/** 등록된 일정이 없을 때 표시되는 메시지 */
export const NoEventsMessage = styled.div`
    text-align: center;
    color: #868e96;
    padding: 40px 0;
    font-size: 14px;
    flex-grow: 1;
    display: flex;
    align-items: center;
    justify-content: center;
`;

/** '일정 추가' 버튼 */
export const AddButton = styled.button`
    width: 100%;
    padding: 12px;
    border: none;
    border-radius: 6px;
    font-size: 15px;
    font-weight: bold;
    cursor: pointer;
    transition: background-color 0.2s;
    background-color: #3498db;
    color: white;
    margin-top: auto;
    
    &:hover {
        background-color: #2980b9;
    }
`;