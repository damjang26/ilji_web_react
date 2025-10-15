import styled, { css } from "styled-components";

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
    /* ✅ [수정] 제목과 버튼을 나란히 정렬하기 위해 flex 속성을 추가합니다. */
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 12px;
    border-bottom: 1px solid #e9ecef;
`;

/** 선택된 날짜를 표시하는 텍스트 */
export const DateTitle = styled.h2`
    font-size: 18px;
    font-weight: 600;
    color: #343a40;
    margin: 0;

    ${props => props.isInsideModal && css`
        font-size: 16px;
    `}
`;

/* ✅ [신규] 필터 아이콘 버튼들을 감싸는 컨테이너입니다. */
export const FilterButtons = styled.div`
    display: flex;
    gap: 8px;
`;

/* ✅ [신규] 개별 필터 아이콘 버튼의 스타일입니다. */
export const FilterButton = styled.button`
    background: none;
    border: none;
    cursor: pointer;
    font-size: 16px;
    padding: 4px;
    color: ${({ $active }) => ($active ? '#7b5fff' : '#aaa')};
    transition: color 0.2s;

    &:hover {
        color: ${({ $active }) => ($active ? '#7b5fff' : '#555')};
    }
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
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 15px;
  border-bottom: 1px solid #eee;
  cursor: pointer;
  transition: background-color 0.2s ease;
  opacity: ${({ $isPast }) => ($isPast ? 0.5 : 1)};

  &:hover {
    background-color: #f9f9f9;
  }

  .event-time {
    font-size: 0.9em;
    color: #888;
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