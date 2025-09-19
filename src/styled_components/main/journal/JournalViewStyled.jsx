import styled from "styled-components";

// ✅ [신규] ViewContainer와 SideActionTabsContainer를 함께 감싸는 최상위 래퍼
export const JournalViewWrapper = styled.div`
    position: relative; /* 자식 요소의 absolute 포지셔닝 기준점 */
    width: 100%;
`;

export const ViewContainer = styled.article`
    display: flex;
    flex-direction: column;
    position: relative;
    z-index: 1;

    /* 이미지가 없을 때의 기본 스타일 */

    &.no-image {
        background-color: white;
        border-radius: 16px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        gap: 20px;
        padding: 28px;
        width: 500px; /* 이미지가 없을 때의 너비 */
        position: relative; /* 내부 CommentContainer의 기준점 */

        /* ✅ [추가] 댓글 창 상태에 따라 높이를 동적으로 조절하고 애니메이션을 추가합니다. */
        height: ${({isCommentOpen}) => (isCommentOpen ? '90vh' : 'auto')};
        max-height: 90vh;
        transition: height 0.4s ease-in-out;
    }

    /* 이미지가 있을 때의 스타일 (책 레이아웃을 감싸는 역할) */

    &.has-image {
        padding: 0;
        background-color: transparent;
        box-shadow: none;
        width: auto; /* 너비를 자동으로 설정하여 자식 요소에 맞춤 */
        min-height: 300px;
        max-height: 90vh; /* 화면 높이의 90%를 차지 */
        align-items: center; /* 자식(BookLayoutContainer)을 수직 중앙 정렬 */
        justify-content: center; /* 자식(BookLayoutContainer)을 수평 중앙 정렬 */
    }
`;

// ✅ [신규] 책 형태의 2단 레이아웃을 위한 메인 컨테이너
export const BookLayoutContainer = styled.div`
    display: flex;
    width: 900px;
    max-width: 900px; /* 최대 너비 조정 */
    min-height: 300px;
    background-color: #fff;
    border-radius: 8px;
    overflow: hidden;
    border: 1px solid #dbdbdb;
    z-index: 1;
    align-self: center; /* 높이 변경 시에도 중앙 정렬 유지 */

    /* ✅ [수정] 댓글 창 상태에 따라 높이를 동적으로 조절하고 애니메이션을 추가합니다. */
    height: ${({isCommentOpen}) => (isCommentOpen ? '90vh' : 'auto')};
    max-height: 90vh; /* 최대 높이는 90vh로 제한 */
    transition: height 0.4s ease-in-out;
`;

// ✅ [신규] 이미지 슬라이더를 담는 왼쪽 컨테이너
export const ImageSliderContainer = styled.div`
    flex: 1;
    position: relative;
    background-color: #ffffff; /* 이미지 배경 및 레터박스 색상 */
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
    position: relative; /* 자식 요소(CommentContainer)의 absolute 포지셔닝 기준점 */
`;

export const ProfileSection = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;

    div {
        display: flex;
        align-items: center;
        gap: 12px;
    }
`;

export const ProfilePicture = styled.img`
    /* ✅ [수정] 오른쪽 영역에서는 조금 작게 */
    width: 36px;
    height: 36px;
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
    font-size: 17px;
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

// ✅ [신규] 좋아요, 댓글, 공유 버튼을 담는 액션 컨테이너
export const ActionsContainer = styled.div`
    display: flex;
    align-items: center;
    gap: 8px; /* 아이템 사이의 간격 */
    padding-top: 12px; /* 위쪽 패딩 */
    margin-top: auto; /* flex-grow를 가진 ContentSection 아래에 위치하여 항상 하단에 고정됨 */
`;


// ✅ [신규] JournalView의 사이드 액션 탭을 감싸는 컨테이너
export const SideActionTabsContainer = styled.div`
    position: absolute;
    top: 40px; /* ✅ [수정] ViewContainer 상단에서 20px 아래에 위치 */
    right: -15px; /* ✅ [수정] 오른쪽을 기준으로 위치를 잡습니다. */
    transform: translateX(50%); /* ✅ [수정] 컨테이너 너비의 절반만큼 오른쪽으로 이동하여 겹치게 합니다. */
    z-index: 0; /* 콘텐츠보다 뒤에 있도록 설정 */
    display: flex;
    flex-direction: column; /* 아이콘을 세로로 배치 */
    gap: 10px; /* 탭 사이의 간격 */
`;

// ✅ [신규] JournalView의 개별 사이드 액션 탭
export const SideActionTab = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 12px 8px;
    width: 60px; /* 가로 너비 */
    background-color: ${({type}) => {
        if (type === 'delete') return '#ffabd2';
        if (type === 'edit') return '#cdaaff';
        return '#a9d4ff'; // ✅ [추가] 'share' 타입의 기본 색상
    }};
    border-left: none;
    border-radius: 0 8px 8px 0; /* 오른쪽 모서리만 둥글게 */
    box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.05);
    transition: background-color 0.2s ease, transform 0.2s ease-out;

    &:hover {
        background-color: ${({type}) => {
            if (type === 'delete') return '#ffbbdc';
            if (type === 'edit') return '#d9b2ff';
            return '#bce0ff'; // ✅ [추가] 'share' 타입의 호버 색상
        }};
        transform: translateX(5px); /* 오른쪽으로 5px 이동 */
        cursor: pointer;
    }

    button {
        background: none;
        border: none;
        cursor: pointer;
        font-size: 20px;
        color: ${({type}) => {
            if (type === 'delete') return '#fdeff7';
            if (type === 'edit') return '#f6efff';
            return '#eaf5ff'; // ✅ [추가] 'share' 타입의 아이콘 색상
        }};
        padding: 4px;
        margin-right: 5px;
        margin-left: 20px;
        border-radius: 50%;
        transition: background-color 0.2s, color 0.2s;
    }
`;

export const CommentContainer = styled.div`
    position: absolute; /* 부모(ContentContainer) 기준으로 위치 지정 */
    bottom: 0;
    left: 0;
    right: 0;
    width: 100%;
    border-radius: 7px;

    /* ✅ [수정] 높이와 배경색에 transition을 적용하여 부드러운 애니메이션 효과를 줍니다. */
    height: ${({isOpen}) => (isOpen ? '500px' : '50px')};
    background-color: ${({isOpen}) => (isOpen ? '#ffffff' : '#ffffff')};
    border-top: 1px solid ${({isOpen}) => (isOpen ? '#dbdbdb' : '#ffffff')};
    box-shadow: ${({isOpen}) => (isOpen ? '0 -4px 12px rgba(0, 0, 0, 0.08)' : 'none')};
    transition: height 0.4s ease-in-out, background-color 0.4s ease-in-out, border-top 0.4s ease-in-out;

    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    color: #65676b;
    cursor: ${({isOpen}) => (isOpen ? 'default' : 'pointer')};

    &:hover {
        background-color: ${({isOpen}) => (isOpen ? '#ffffff' : '#efefef')};
    }
`;

// ✅ [신규] 확장된 댓글 창 내부 콘텐츠를 감싸는 래퍼
export const CommentContentWrapper = styled.div`
    width: 100%;
    height: 100%;
    padding: 16px 24px;
    display: flex;
    flex-direction: column;
    overflow: hidden; /* 내부 스크롤을 위해 */
    opacity: 0;
    animation: fadeIn 0.4s ease-in-out 0.2s forwards;

    @keyframes fadeIn {
        to {
            opacity: 1;
        }
    }
`;

// ✅ [신규] 확장된 댓글 창의 헤더 (제목, 닫기 버튼)
export const CommentHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-bottom: 12px;
`;

//  제목과 정렬 옵션을 묶는 컨테이너
export const CommentTitleContainer = styled.div`
    display: flex;
    align-items: center;
    gap: 1rem;
`;

// ✅ [신규] 댓글 숨기기 버튼
export const HideButton = styled.button`
    font-size: 14px;
    color: #8e8e8e;
    cursor: pointer;
    background: none;
    border: none;
    padding: 4px;
    font-weight: 600;

    &:hover {
        color: #262626;
    }
`;

// ✅ [신규] 댓글 제목 스타일 컴포넌트 (h4 기본 여백 제거)
export const CommentTitle = styled.h4`
    margin: 0;
    padding: 0;
    font-size: 1rem; /* h4와 유사한 폰트 크기 유지 */
    font-weight: bold;
`;

// 정렬 옵션 버튼
export const SortOption = styled.button`
    background: none;
    border: none;
    cursor: pointer;
    font-size: 0.8rem;
    color: ${props => props.active ? '#65676b' : '#888'};
    font-weight: ${props => props.active ? 'bold' : 'normal'};
    padding: 0;

    &:hover {
        color: #65676b;
    }
`;

// ✅ [신규] 댓글 목록을 감싸는 컨테이너
export const CommentList = styled.div`
    flex-grow: 1; /* 남는 공간을 모두 차지 */
    overflow-y: auto; /* 댓글이 많아지면 스크롤 */
    padding: 8px 0;
`;

// ✅ [신규] 댓글 입력창을 감싸는 컨테이너
export const CommentInputContainer = styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
    padding-top: 12px;
    border-top: 1px solid #efefef;
    margin-top: auto; /* CommentList가 스크롤 되더라도 항상 하단에 위치 */

    /* 입력창에서는 프로필 사진을 조금 더 작게 */

    ${ProfilePicture} {
        width: 40px;
        height: 40px;
    }
`;

// ✅ [신규] 댓글 입력 폼
export const CommentForm = styled.form`
    flex-grow: 1;
    display: flex;
    align-items: center;

    input {
        width: 100%;
        border: none;
        outline: none;
        background-color: transparent;
        font-size: 14px;
        padding: 8px 0;

        &::placeholder {
            color: #a8a8a8;
        }
    }

    button {
        background: none;
        border: none;
        color: #7b5fff;
        font-weight: 1000;
        padding: 5px;
        border-radius: 50%;
        font-size: 25px; /* ✅ [수정] 아이콘 크기를 키웁니다. */
        cursor: pointer;
        margin-left: 8px;
        transition: color 0.2s ease;
        display: flex; /* ✅ [추가] 아이콘을 중앙에 배치하기 위해 flex를 사용합니다. */
        align-items: center;

        &:hover {
            background-color: rgba(131, 29, 240, 0.1);
        }

        &:disabled {
            color: #c3b3ff;
            cursor: not-allowed;
        }
    }
`;