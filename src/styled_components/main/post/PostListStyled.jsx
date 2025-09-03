import styled from "styled-components";

// 전체 피드를 감싸고 중앙 정렬하는 컨테이너
export const FeedContainer = styled.div`
    max-width: 600px; /* 피드의 최대 너비 */
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
`;

// 포스트 헤더 (프로필 사진, 유저 아이디, 날짜)
export const PostHeader = styled.header`
    display: flex;
    align-items: center;
    padding: 12px 16px;
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
        transition: background-color 0.2s, color 0.2s;

        &:hover {
            background-color: #f0f2f5;
            color: #262626;
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
    width: 100%;
    height: auto;
    max-height: 750px; /* 이미지 최대 높이 제한 */
    object-fit: cover;
    border-top: 1px solid #dbdbdb;
    border-bottom: 1px solid #dbdbdb;
`;

// 포스트 본문 내용
export const PostContent = styled.div`
    padding: 12px 16px;
    font-size: 14px;
    line-height: 1.5;
    color: #262626;
`;

// 포스트 액션 버튼 (좋아요, 댓글 등)
export const PostActions = styled.div`
    display: flex;
    padding: 8px 16px;
    gap: 16px;
    border-top: 1px solid #efefef;

    button {
        background: none;
        border: none;
        cursor: pointer;
        font-size: 22px; /* 아이콘 크기 */
        padding: 0;
        transition: transform 0.1s ease-in-out;

        &:hover {
            opacity: 0.4;
        }
    }
`;