import styled from "styled-components";

// 전체 피드를 감싸고 중앙 정렬하는 컨테이너
export const FeedContainer = styled.div`
    width: 600px; /* 피드의 최대 너비 */
    margin: 20px auto; /* 페이지 중앙에 위치 */
    display: flex;
    flex-direction: column;
    gap: 24px; /* 포스트 사이의 간격 */
`;

// 개별 포스트(게시물) 카드
export const PostContainer = styled.article`
    background-color: #ffffff;
    border: 1px solid #dbdbdb;
    border-radius: 8px;
    display: flex;
    flex-direction: column;

    transition: background-color 0.2s ease;

    &:hover {
        background-color: #f5f5f5; /* 연한 회색 배경 */
        cursor: pointer;
`;

// 포스트 헤더 (프로필 사진, 유저 아이디, 날짜)
export const PostHeader = styled.header`
    display: flex;
    align-items: center;
    padding: 20px 25px;
    gap: 12px;
`;

// ✅ [신규] 포스트 헤더의 액션 버튼 (수정, 삭제 등)
export const PostHeaderActions = styled.div`
    margin-left: auto; /* 헤더의 오른쪽 끝으로 밀어냄 */
    display: flex;
    align-items: center;
    gap: 8px;

    button {
        background: none;
        border: none;
        cursor: pointer;
        font-size: 20px; /* 아이콘 크기 */
        color: #8e8e8e; /* 아이콘 색상 */
        padding: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        position: relative; /* 툴팁 기준 */
        transition: background-color 0.2s, color 0.2s;

        &:hover {
            background-color: #f0f2f5;
            color: #262626;
        }

        /* 툴팁 기본 숨김 */

        &::after {
            content: attr(data-tooltip);
            position: absolute;
            top: 130%; /* 버튼 위쪽 */
            left: 50%;
            transform: translateX(-50%);
            background-color: #333;
            color: #fff;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            white-space: nowrap;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.2s, transform 0.2s;
            z-index: 10;
        }

        &:hover::after {
            opacity: 1;
            transform: translateX(-50%) translateY(-4px);
        }
    }
`;


// 프로필 이미지
export const ProfileImage = styled.img`
    width: 32px;
    height: 32px;
    border-radius: 50%;
    object-fit: cover;
    background-color: #efefef; /* 이미지가 없을 경우를 대비한 배경색 */
`;

// 유저 정보 (아이디, 날짜)
export const UserInfo = styled.div`
    display: flex;
    flex-direction: column;

    .username {
        font-weight: 600;
        font-size: 14px;
        color: #262626;
    }

    .date {
        font-size: 12px;
        color: #8e8e8e;
    }
`;

// 포스트 이미지
export const PostImage = styled.img`
    width: 80%;
    height: auto;
    max-height: 750px; /* 이미지 최대 높이 제한 */
    object-fit: cover;

    // ✅ [추가] 이미지를 블록 요소로 만들어 수평 중앙 정렬을 적용합니다.
    display: block;
    margin-left: auto;
    margin-right: auto;
`;

// ✅ [신규] 여러 이미지를 위한 그리드 컨테이너
export const ImageGrid = styled.div`
    display: grid;
    gap: 2px; /* 이미지 사이의 간격 */
    border-radius: 16px;
    overflow: hidden;
    border: 1px solid #cfd9de; /* 트위터와 유사한 얇은 테두리 */
    margin: 0 16px 16px; /* 포스트 내용과의 간격 조정 */
    /* ✅ [수정] 여러 이미지일 때만 그리드의 최대 높이를 제한합니다. */
    max-height: ${({count}) => (count > 1 ? '300px' : 'none')};

    /* 이미지 개수에 따라 그리드 레이아웃 변경 */
    ${({count}) => {
        if (count === 2) {
            return `grid-template-columns: 1fr 1fr;`;
        }
        if (count === 3) {
            return `
                grid-template-columns: 1fr 1fr;
                grid-template-rows: 1fr 1fr;
                & > div:first-child {
                    grid-row: span 2;
                }
            `;
        }
        if (count >= 4) {
            return `
                grid-template-columns: 1fr 1fr;
                grid-template-rows: 1fr 1fr;
            `;
        }
    }}
`;

// ✅ [신규] 그리드 내 각 이미지를 감싸는 래퍼
export const ImageWrapper = styled.div`
    position: relative;
    width: 100%;
    height: ${({count}) => (count > 1 ? '100%' : 'auto')};
    /* ✅ [수정] 여러 이미지일 때만 padding-top 트릭 사용 */
    padding-top: ${({count}) => (count > 1 ? '100%' : '0')};

    img {
        position: ${({count}) => (count > 1 ? 'absolute' : 'static')};
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        /* ✅ [수정] 이미지 개수에 따라 object-fit 속성 변경 */
        object-fit: ${({count}) => (count > 1 ? 'cover' : 'contain')};
        background-color: #f0f2f5; /* 이미지 로딩 전 배경색 */

        /* ✅ [수정] 이미지가 1개일 때만 최대 높이/너비를 제한하고, 중앙 정렬합니다. */
        ${({count}) => count === 1 && `
            max-height: 410px;
            display: block;
            margin: 0 auto;
        `}
    }
`;

// 포스트 본문 내용
export const PostContent = styled.div`
    padding: 20px 25px;
    font-size: 14px;
    line-height: 1.5;
    color: #262626;
    // ✅ [ 추가 ] 텍스트의 공백(스페이스) 과 줄바꿈(\\n) 을 HTML에 그대로 렌더링합니다. 
    white-space: pre-wrap;
    // 글자가 너무 길어질 경우 단어를 기준으로 줄바꿈합니다.
    word-wrap: break-word;

    /* ✅ [추가] '...더보기' 텍스트 스타일 */
    .more-text {
        color: #8e8e8e;
        font-weight: 500;
    }
`;

// 포스트 액션 버튼 (좋아요, 댓글 등)
export const PostActions = styled.div`
    display: flex;
    padding: 14px 20px;
    gap: 50px;
`;

// ✅ [신규] 아이콘과 카운트를 묶는 그룹
export const ActionItem = styled.div`
    display: flex;
    align-items: center;
    gap: 6px; /* 아이콘과 숫자 사이의 간격 */
    cursor: pointer;
    color: #262626; /* 기본 텍스트/아이콘 색상 */

    /* 그룹 내의 버튼(아이콘) 스타일 */

    button {
        background: none;
        border: none;
        cursor: pointer;
        font-size: 22px; /* 아이콘 크기 */
        padding: 0;
        color: inherit; /* 부모(ActionItem)의 색상을 상속받음 */
        transition: transform 0.1s ease-in-out;
    }

    /* 그룹 내의 숫자(span) 스타일 */

    span {
        font-size: 14px;
        font-weight: 400;
    }

    /* 기본 호버 효과 (두 번째, 세 번째 아이템) */

    &:not(:first-child):hover {
        opacity: 0.4;
    }

    /* ✅ [수정] 첫 번째 아이템(하트)에만 특별한 호버 효과 적용 */

    &:first-child:hover {
        color: #ff3040; /* 그룹 전체의 색상을 변경 */
        opacity: 0.8;
    }
`;

// ✅ [신규] 피드의 끝을 알리는 메시지
export const EndOfFeed = styled.div`
    text-align: center;
    padding: 40px 20px;
    color: #8e8e8e;
    font-size: 14px;
    line-height: 1.6;
    border-top: 1px solid #efefef;
    margin-top: 20px;
`;

// ✅ [신규] 피드가 비어있을 때 보여줄 컨테이너
export const EmptyFeedContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 60vh;
    color: #666;
    text-align: center;

    /* 컨테이너 안의 아이콘 스타일 */

    svg {
        margin-bottom: 16px;
        color: #aaa;
    }

    h2 {
        margin: 0;
    }
`;

// ✅ [신규] 피드가 비어있을 때의 안내 문구
export const EmptyFeedText = styled.p`
    margin-top: 8px;
    font-size: 14px;
    color: #888;
`;

// ✅ [신규] '일기 작성하기' 버튼
export const WriteJournalButton = styled.button`
    margin-top: 20px;
    padding: 10px 20px;
    border-radius: 8px;
    background-color: #7b5fff;
    color: #fff;
    border: none;
    cursor: pointer;
    font-size: 15px;
    font-weight: 600;
    transition: background-color 0.2s;

    &:hover {
        background-color: #6a52e0;
    }
`;