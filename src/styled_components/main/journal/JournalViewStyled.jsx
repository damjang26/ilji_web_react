import styled from "styled-components";

// ✅ [수정] 모달 컨테이너에 새로운 레이아웃을 위한 스타일 추가
export const ViewContainer = styled.div`
    display: flex;
    flex-direction: column;
    position: relative;

    /* 이미지가 없을 때의 기본 스타일 */

    &.no-image {
        background-color: white;
        border-radius: 16px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        gap: 20px;
        padding: 24px;
        min-height: 300px;
        max-height: 80vh;
        overflow-y: auto;
        width: 500px; /* 이미지가 없을 때의 너비 */
    }

    /* 이미지가 있을 때의 스타일 (책 레이아웃을 감싸는 역할) */

    &.has-image {
        padding: 0;
        background-color: transparent;
        box-shadow: none;
        width: auto; /* 너비를 자동으로 설정하여 자식 요소에 맞춤 */
        height: 90vh; /* 화면 높이의 90%를 차지 */
        align-items: center; /* 자식(BookLayoutContainer)을 수직 중앙 정렬 */
        justify-content: center; /* 자식(BookLayoutContainer)을 수평 중앙 정렬 */
    }
`;

// ✅ [신규] 책 형태의 2단 레이아웃을 위한 메인 컨테이너
export const BookLayoutContainer = styled.div`
    display: flex;
    width: 100%;
    height: 100%;
    max-width: 1000px; /* 최대 너비 조정 */
    background-color: #fff;
    border-radius: 8px;
    overflow: hidden;
    border: 1px solid #dbdbdb;
`;

// ✅ [신규] 이미지 슬라이더를 담는 왼쪽 컨테이너
export const ImageSliderContainer = styled.div`
    flex: 1;
    position: relative;
    background-color: #000; /* 이미지 배경 및 레터박스 색상 */
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
`;

// ✅ [신규] 슬라이더의 각 이미지
export const ImageSlide = styled.img`
    /* ✅ [수정] 이미지의 원본 크기를 유지하되, 컨테이너를 벗어나지 않도록 최대 크기를 제한합니다. */
    max-width: 100%;
    max-height: 100%;
    user-select: none; /* 이미지 드래그 방지 */
`;

// ✅ [신규] 슬라이더 화살표 버튼
export const SliderArrow = styled.button`
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    background-color: rgba(26, 26, 26, 0.7);
    color: white;
    border: none;
    border-radius: 50%;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 18px;
    z-index: 10;
    opacity: 0;
    transition: opacity 0.2s ease;

    ${ImageSliderContainer}:hover & {
        opacity: 1;
    }

    &.prev {
        left: 10px;
    }

    &.next {
        right: 10px;
    }
`;

// ✅ [신규] 프로필, 본문 등을 담는 오른쪽 컨테이너
export const ContentContainer = styled.div`
    width: 335px; /* 고정 너비 */
    min-width: 335px;
    padding: 24px;
    border-left: 1px solid #dbdbdb;
    display: flex;
    flex-direction: column;
`;

export const ProfileSection = styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
`;

export const ProfilePicture = styled.img`
    /* ✅ [수정] 오른쪽 영역에서는 조금 작게 */
    width: 32px;
    height: 32px;
    border-radius: 50%;
    object-fit: cover;
`;

export const AuthorInfo = styled.div`
    display: flex;
    flex-direction: column;
`;

export const AuthorName = styled.span`
    /* ✅ [수정] 조금 더 굵게 */
    font-weight: 600;
    font-size: 14px;
`;

export const DateDisplay = styled.span`
    /* ✅ [수정] 조금 더 작게 */
    font-size: 12px;
    color: #888;
`;

export const ContentSection = styled.div`
    font-size: 14px;
    line-height: 1.6;
    white-space: pre-wrap; /* 줄바꿈과 공백을 그대로 표시 */
    padding: 16px;
    overflow-y: auto; /* 내용이 길어지면 스크롤 */
    flex-grow: 1; /* 남는 공간을 모두 채움 */
`;

// export const ImageGrid = styled.div`
//     display: grid;
//     gap: 8px;
//     grid-template-columns: repeat(${({imageCount}) => Math.min(imageCount, 2)}, 1fr);
// `;
//
// export const JournalImage = styled.img`
//     width: 100%;
//     height: auto;
//     border-radius: 12px;
//     object-fit: cover;
// `;