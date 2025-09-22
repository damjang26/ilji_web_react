import styled from "styled-components";
import {ProfilePicture} from "../journal/JournalViewStyled.jsx";

// 전체 피드를 감싸고 중앙 정렬하는 컨테이너
export const FeedContainer = styled.div`
    /* ✅ [신규] JournalItemWrapper를 감싸는 컨테이너 */

    & > div {
        display: flex;
        flex-direction: column;
        gap: 30px; /* 포스트 사이의 간격 */
    }

    width: 600px; /* 피드의 최대 너비 */
    margin: 20px auto; /* 페이지 중앙에 위치 */
    display: flex;
    flex-direction: column;
    gap: 30px; /* 포스트 사이의 간격 */
`;

export const JournalItemWrapper = styled.div`
    position: relative; /* 자식인 IndexTabsContainer의 위치 기준점 */
`;

// 개별 포스트(게시물) 카드
export const PostContainer = styled.article`
    position: relative;
    overflow: hidden; /* ✅ [수정] 자식 요소(이미지 등)가 컨테이너 밖으로 나가지 않도록 설정합니다. */
    background-color: #ffffff;
    border: 1.5px solid #a3a3a3;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    z-index: 1;
    /* ✅ [수정] 실제로 변경되는 min-height와 max-height에 transition을 적용합니다. */
    transition: min-height 0.4s ease-in-out, max-height 0.4s ease-in-out, background-color 0.2s ease;
    min-height: ${({isCommentOpen}) => (isCommentOpen ? '600px' : '250px')};

    &.not-has-image,
    &.landscape {
        max-height: ${({isCommentOpen}) => (isCommentOpen ? '600px' : '500px')};
    }

    &:hover {
        //background-color: #f5f5f5; /* 연한 회색 배경 */
`;

export const SpringBinder = styled.img`
    position: absolute;
    left: -15px;
    top: 28px;
    width: 40px; /* 스프링 이미지의 너비 (이미지에 맞게 조절) */
    object-fit: cover; /* 이미지가 잘리지 않고 채워지도록 설정 */
    z-index: 2; /* 다른 콘텐츠보다 위에 보이도록 설정 */
    pointer-events: none; /* 이미지가 클릭 등 다른 이벤트를 방해하지 않도록 설정 */
`;

export const SpringBinder2 = styled.img`
    position: absolute;
    left: -15px;
    bottom: 28px;
    width: 40px; /* 스프링 이미지의 너비 (이미지에 맞게 조절) */
    object-fit: cover; /* 이미지가 잘리지 않고 채워지도록 설정 */
    z-index: 2; /* 다른 콘텐츠보다 위에 보이도록 설정 */
    pointer-events: none; /* 이미지가 클릭 등 다른 이벤트를 방해하지 않도록 설정 */
`;

// 포스트 헤더 (프로필 사진, 유저 아이디, 날짜)
export const PostHeader = styled.header`
    display: flex;
    align-items: center;
    padding: 20px 25px;
    gap: 2px;
`;

// JournalList에서 2단 레이아웃을 위한 컨테이너
export const JournalItemLayoutContainer = styled.div`
    display: flex;
    width: 100%;

    &.landscape {
        flex-direction: column;
    }
`;

// 2단 레이아웃의 우측 컨텐츠 영역
export const JournalItemContentContainer = styled.div`
    padding: 0; /* 내부 요소들이 패딩을 갖도록 변경 */
    flex: 1;
    min-height: 0; /* flex 아이템 내부에서 스크롤이 올바르게 동작하기 위해 필요 */
    border-left: 1px solid #dbdbdb;
    display: flex;
    flex-direction: column;

    /* ✅ [추가] 가로 이미지 레이아웃일 때 스타일 조정 */

    ${JournalItemLayoutContainer}.landscape & {
        width: 100%; /* 너비를 100%로 설정 */
        min-width: auto; /* 최소 너비 제한 해제 */
        border-left: none; /* 기존의 왼쪽 테두리 제거 */
        border-top: 1px solid #dbdbdb; /* 위쪽 테두리 추가 */
    }
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

    /* ✅ [추가] 가로 이미지 레이아웃일 때 스타일 조정 */

    ${JournalItemLayoutContainer}.landscape & {
        max-height: 450px; /* 가로 이미지일 때 슬라이더의 최대 높이 제한 */
    }

    &:hover {
        cursor: pointer;
    }
`;

// ✅ [신규] 슬라이더에 표시될 개별 이미지
export const ImageSlide = styled.img`
    width: 100%;
    height: 100%;
    object-fit: cover; /* 컨테이너에 꽉 차도록 */
    transition: opacity 0.3s ease-in-out;
`;

// ✅ [신규] 슬라이더 좌/우 화살표 버튼
export const SliderArrow = styled.button`
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    background-color: rgba(0, 0, 0, 0.4);
    color: white;
    border: none;
    cursor: pointer;
    padding: 10px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2;
    opacity: 0; /* 기본적으로 숨김 */
    transition: opacity 0.2s ease, background-color 0.2s ease;

    ${ImageSliderContainer}:hover & {
        opacity: 1; /* 컨테이너에 호버 시 나타남 */
    }

    &.prev {
        left: 10px;
    }

    &.next {
        right: 10px;
    }

    &:hover {
        background-color: rgba(0, 0, 0, 0.7);
    }
`;

// ✅ [신규] 여러 인덱스 탭을 감싸고 위치를 지정하는 컨테이너
export const IndexTabsContainer = styled.div`
    position: absolute;
    top: 30px; /* 위에서부터의 위치 */
    right: -45px; /* 오른쪽 테두리에 겹치도록 배치 */
    z-index: 0; /* 콘텐츠보다 뒤에 있도록 설정 */
    display: flex;
    flex-direction: column; /* 아이콘을 세로로 배치 */
    gap: 10px; /* 탭 사이의 간격 */
`;

// ✅ [수정] 개별 인덱스 탭의 스타일 (위치 지정 제거)
export const IndexTabActions = styled.div`
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

// 프로필 이미지
export const ProfileImage = styled.img`
    width: 40px;
    height: 40px;
    border-radius: 50%;
    object-fit: cover;
    padding: 4px; /* ✅ [추가] 호버 시 배경색이 보이도록 패딩 추가 */
    transition: background-color 0.2s, font-weight 0.2s;

    &:hover {
        font-weight: 600; /* bold 스타일 */
        background-color: #cccccc;
        cursor: pointer;
    }

    ${PostContainer}.not-has-image & {
        margin-left: 10px;
    }
`;

// 유저 정보 (아이디, 날짜)
export const UserInfo = styled.div`
    display: flex;
    flex-direction: column; /* 자식 요소(div)가 너비를 100% 차지하도록 column으로 변경 */
    flex: 1; /* 남은 공간을 모두 차지하도록 설정 */
    gap: 6px;

    /* ✅ [추가] UserInfo 바로 아래의 div에 flex 스타일 적용 */

    > div {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;

        /* ✅ [추가] username과 date를 감싸는 div에 대한 스타일 */

        > div {
            display: flex;
            align-items: flex-end;
            gap: 8px; /* 이름과 시간 사이의 간격 */
        }
    }

    .username {
        font-weight: 600;
        font-size: 17px;
        color: #262626;
        padding: 2px 3px; /* ✅ [추가] 호버 시 배경색이 보이도록 패딩 추가 */
        border-radius: 4px; /* ✅ [추가] 부드러운 모서리 */
        transition: background-color 0.2s, font-weight 0.2s;

        &:hover {
            font-weight: 600; /* bold 스타일 */
            background-color: #cccccc; /* 연한 회색 배경 */
            cursor: pointer;
        }
    }

    .date {
        font-size: 12px;
        color: #8e8e8e;
    }
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
        // JournalItemLayoutContainer 내부에서 사용될 때
    ${JournalItemLayoutContainer} & {
        flex: 1; // flex 아이템으로 작동하도록
        max-width: 300px; // 이미지 영역 최대 너비 제한
    }
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
    margin: 15px 20px 25px 20px; /* ✅ [수정] 좌우 마진을 20px로 통일 */
    font-size: 14px;
    line-height: 1.5;
    color: #262626;
    flex-grow: 1; // 남은 공간을 모두 채우도록 설정
    overflow-y: auto; // 내용이 넘칠 경우 세로 스크롤 생성
    // ✅ [ 추가 ] 텍스트의 공백(스페이스) 과 줄바꿈(\\n) 을 HTML에 그대로 렌더링합니다. 
    white-space: pre-wrap;
    // 글자가 너무 길어질 경우 단어를 기준으로 줄바꿈합니다.
    word-wrap: break-word;

    scrollbar-width: thin;
    scrollbar-color: transparent transparent;

    &:hover {
        scrollbar-color: #ccc transparent;
    }

    &::-webkit-scrollbar {
        width: 8px; /* 스크롤바 너비 */
    }

    &::-webkit-scrollbar-track {
        background: transparent; /* 트랙 배경 투명 */
    }

    &::-webkit-scrollbar-thumb {
        background-color: transparent; /* 스크롤바 핸들 투명 */
        border-radius: 10px;
    }

    &:hover::-webkit-scrollbar-thumb {
        background-color: #ccc; /* 호버 시 핸들 색상 변경 */
    }

    &::-webkit-scrollbar-button {
        width: 0;
        height: 0;
        display: none;
    }

    ${PostContainer}.not-has-image & {
        margin-left: 45px;
    }

    ${JournalItemLayoutContainer}.landscape & {
        margin-left: 45px;
    }
`;

// 포스트 액션 버튼 (좋아요, 댓글 등)
export const PostActions = styled.div`
    display: flex;
    align-items: center;
    gap: 8px; /* 아이템 사이의 간격 */
    padding-top: 12px; /* 위쪽 패딩 */
    margin-top: auto; /* flex-grow를 가진 ContentSection 아래에 위치하여 항상 하단에 고정됨 */
`;

// ✅ [신규] 아이콘과 카운트를 묶는 그룹
export const ActionItem = styled.div`
    display: flex;
    align-items: center;
    gap: 4px; /* 아이콘과 숫자 사이의 간격 */
    cursor: pointer;
    color: #262626; /* 기본 텍스트/아이콘 색상 */

    /* 그룹 내의 버튼(아이콘) 스타일 */

    button {
        /* ✅ [수정] 버튼 내부의 아이콘을 수직 중앙 정렬하기 위해 flex 속성 추가 */
        display: flex;
        align-items: center;
        background: none;
        border: none;
        cursor: pointer;
        font-size: 26px; /* 아이콘 크기 */
        padding: 0;
        color: inherit; /* 부모(ActionItem)의 색상을 상속받음 */
        transition: transform 0.1s ease-in-out;
    }

    &:hover {
        color: #ff3040; /* 그룹 전체의 색상을 변경 */
        opacity: 0.8;
    }

    span {
        font-size: 14px;
        font-weight: 500;
        margin-bottom: 2px;
        padding: 2px 3px; /* ✅ [추가] 호버 시 배경색이 보이도록 패딩 추가 */
        border-radius: 6px; /* ✅ [추가] 부드러운 모서리 */
        transition: background-color 0.2s, font-weight 0.2s; /* ✅ [추가] 부드러운 전환 효과 */

        /* ✅ [추가] 요청하신 호버 스타일 */

        &:hover {
            font-weight: 600; /* bold 스타일 */
            background-color: #cccccc; /* 연한 회색 배경 */
        }
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

export const FindFriendsButton = styled(WriteJournalButton)`
    /* WriteJournalButton 스타일을 그대로 상속받습니다. */
    margin-top: 20px; /* 위쪽 텍스트와의 간격을 추가합니다. */
`;

// ✅ [신규] 일기 목록의 날짜 표시 스타일
export const JournalEntryDate = styled.div`
    display: flex; /* 자식 요소들을 가로로 정렬 */
    align-items: center; /* 수직 중앙 정렬 */
    justify-content: space-between; /* 양쪽 끝으로 요소를 분배 */
    font-size: 14px;
    font-weight: normal;
    padding: 0 25px; /* 위/아래 패딩 조정, 좌우는 유지 */
    margin: 0;
    text-transform: none; /* 대문자 변환 제거 */
    letter-spacing: normal; /* 자간 기본값으로 복원 */
`;

// ✅ [신규] JournalEntryDate 내부에 사용될 날짜 텍스트(h3 대체)
export const JournalDateHeading = styled.h3`
    margin: 0;
    padding: 0;
    font-size: 1rem; /* 16px */
    font-weight: 600;
    color: #333;

    ${PostContainer}.not-has-image & {
        margin-left: 10px;
    }
`;

// 댓글 관련 디자인

export const PostCommentContainer = styled.div`
    position: absolute; /* ✅ [수정] 부모(PostContainer) 기준으로 위치 지정 */
    bottom: 0;
    left: 0;
    right: 0;
    width: 100%;
    z-index: 2; /* ✅ [추가] 다른 콘텐츠 위로 올라오도록 설정 */
    border-radius: 0 0 7px 7px; /* ✅ [수정] 하단 모서리만 둥글게 */

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

// ✅ [신규] PostComment가 absolute일 때 공간을 차지하기 위한 플레이스홀더
export const CommentPlaceholder = styled.div`
    width: 100%;
    height: 50px; /* PostComment가 닫혔을 때의 높이와 동일하게 설정 */
`;

// ✅ [신규] 확장된 댓글 창 내부 콘텐츠를 감싸는 래퍼
export const PostCommentContentWrapper = styled.div`
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
export const PostCommentHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-bottom: 12px;
`;

//  제목과 정렬 옵션을 묶는 컨테이너
export const PostCommentTitleContainer = styled.div`
    display: flex;
    align-items: center;
    gap: 1rem;
`;

// ✅ [신규] 댓글 숨기기 버튼
export const PostHideButton = styled.button`
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
export const PostCommentTitle = styled.h4`
    margin: 0;
    padding: 0;
    font-size: 1rem; /* h4와 유사한 폰트 크기 유지 */
    font-weight: bold;
`;

// 정렬 옵션 버튼
export const PostSortOption = styled.button`
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
export const PostCommentList = styled.div`
    flex-grow: 1; /* 남는 공간을 모두 차지 */
    overflow-y: auto; /* 댓글이 많아지면 스크롤 */
    padding: 8px 0;
`;

// ✅ [신규] 댓글 입력창을 감싸는 컨테이너
export const PostCommentInputContainer = styled.div`
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
export const PostCommentForm = styled.form`
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

export const ProfileImg = styled.img`
    /* ✅ [수정] 오른쪽 영역에서는 조금 작게 */
    width: 36px;
    height: 36px;
    border-radius: 50%;
    object-fit: cover;
`;

export const LikeCountSpan = styled.span`
    cursor: pointer;

    &:hover {
        text-decoration: underline;
    }
`;

// =================================
// 댓글 아이템 관련 스타일 (신규 추가)
// =================================

export const CommentItemContainer = styled.div`
    display: flex;
    gap: 16px;
    padding: 12px 4px;
`;

export const CommentAvatar = styled.img`
    width: 36px;
    height: 36px;
    border-radius: 50%;
    object-fit: cover;
    cursor: pointer;
    margin-top: 4px;
`;

export const CommentBody = styled.div`
    display: flex;
    flex-direction: column;
    gap: 4px;
    flex: 1;
`;

export const CommentHeader = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
`;

export const CommentAuthor = styled.span`
    font-weight: 600;
    font-size: 13px;
    cursor: pointer;

    &:hover {
        text-decoration: underline;
    }
`;

export const CommentTimestamp = styled.span`
    font-size: 12px;
    color: #8e8e8e;
`;

export const CommentText = styled.p`
    margin: 0;
    font-size: 14px;
    line-height: 1.5;
    white-space: pre-wrap;
    word-wrap: break-word;
`;

export const EmptyComment = styled.p`
    text-align: center;
    color: #8e8e8e;
    padding: 40px 0;
`;

export const CommentActions = styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
    margin-top: 8px;
`;

export const CommentActionButton = styled.button`
    background: none;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    padding: 0;
    color: #65676b;
    font-size: 16px;

    &:hover {
        color: #262626;
    }
`;

export const CommentLikeCount = styled.span`
    font-size: 12px;
    color: #8e8e8e;
    font-weight: 500;
    cursor: pointer;

    &:hover {
        text-decoration: underline;
        font-weight: 600; /* bold 스타일 */
        background-color: #cccccc; /* 연한 회색 배경 */
    }
`;

// ✅ [신규] 이미지 모달에 사용될 원본 이미지 스타일
export const OriginalImage = styled.img`
    max-width: 90vw; /* 화면 너비의 90%를 넘지 않도록 설정 */
    max-height: 90vh; /* 화면 높이의 90%를 넘지 않도록 설정 */
    display: block; /* 이미지 아래의 불필요한 여백 제거 */
`;


// =================================
// 댓글 메뉴(삭제 등) 관련 스타일 (신규 추가)
// =================================

export const CommentMenuContainer = styled.div`
    position: relative;
    margin-left: auto; /* 버튼을 오른쪽 끝으로 밀어냄 */
`;

export const CommentMenuButton = styled.button`
    background: none;
    border: none;
    cursor: pointer;
    padding: 8px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #606060;

    &:hover {
        background-color: #f0f0f0;
    }
`;

export const CommentDropdownMenu = styled.div`
    position: absolute;
    top: 44%;
    right: 4px;
    background-color: white;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    z-index: 10;
    width: 90px;
    padding: 8px 0;
`;

export const CommentDropdownItem = styled.button`
    background: none;
    border: none;
    width: 100%;
    padding: 8px 16px;
    text-align: left;
    cursor: pointer;
    font-size: 14px;

    &:hover {
        background-color: #f0f0f0;
    }
`;