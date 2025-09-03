import styled from "styled-components";

/** ScheduleDetail.jsx의 스타일을 정의합니다. (일정 상세 보기) */

export const DetailWrapper = styled.div`
    padding: 8px;
    box-sizing: border-box;
`;

/** '뒤로가기' 버튼을 포함하는 헤더 */
export const DetailHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid #eee;
`;

/** 목록으로 돌아가는 '뒤로가기' 버튼 */
export const BackButton = styled.button`
    background: none;
    border: none;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    color: #868e96;
    padding: 4px 8px;
    border-radius: 4px;
    transition: background-color 0.2s, color 0.2s;

    &:hover {
        background-color: #f1f3f5;
        color: #343a40;
    }
`;

/** 헤더에 표시될 날짜 */
export const HeaderDate = styled.span`
  font-size: 16px;
  font-weight: 600;
  color: #555;
`;

/** 일정의 제목 */
export const Title = styled.h2`
    font-size: 22px;
    font-weight: 600;
    margin: 8px 0 24px 0;
    word-break: break-all;
    color: #212529;
    border-left: 4px solid #3498db;
    padding-left: 12px;
`;

/** 날짜, 장소 등 상세 정보를 담는 컨테이너 */
export const InfoSection = styled.div`
    display: grid;
    gap: 16px;
    font-size: 14px;
    padding: 8px 2px; /* 스크롤바와 내용 사이에 약간의 여백을 줍니다. */
`;

/** 정보 항목의 라벨 (예: '날짜') */
export const InfoLabel = styled.strong`
    display: block;
    color: #868e96;
    font-weight: 500;
    margin-bottom: 4px;
`;

/** 정보 항목의 값 (예: '2025-08-07') */
export const InfoValue = styled.p`
    margin: 0;
    color: #343a40;
    word-break: break-all;
    line-height: 1.5;
`;