import React, {useState, useEffect, useMemo, useRef, useCallback} from 'react';
import {useJournal} from "../../../../contexts/JournalContext.jsx";
import {useMyPage} from "../../../../contexts/MyPageContext.jsx"; // [수정] isOwner 상태를 가져오기 위해 추가
import {useNavigate, useLocation} from "react-router-dom"; // ✅ 페이지 이동을 위해 추가
import {
    FeedContainer,
    PostActions,
    PostContainer, PostHeaderActions,
    PostContent,
    PostHeader,
    PostImage,
    ProfileImage,
    UserInfo,
    EmptyFeedContainer,
    EmptyFeedText,
    WriteJournalButton,
} from "../../../../styled_components/main/post/PostListStyled.jsx";
import {FaRegComment, FaRegHeart, FaRegShareSquare} from "react-icons/fa";
import {HiPencilAlt} from "react-icons/hi";
import {MdDeleteForever} from "react-icons/md";

// 한 번에 불러올 일기 개수
const JOURNALS_PER_PAGE = 10;

const JournalList = () => {
    // 1. Context에서 전체 일기 목록(Map)과 로딩 상태를 가져옵니다.
    const {journals, loading: journalLoading, deleteJournal} = useJournal();
    // 2. [수정] MyPageContext에서 현재 페이지의 소유자 여부를 가져옵니다.
    const {isOwner} = useMyPage();
    const navigate = useNavigate(); // ✅ navigate 함수 가져오기
    const location = useLocation(); // ✅ 모달 네비게이션의 배경 위치를 위해 추가합니다.

    // 3. 화면에 보여줄 일기 목록(페이지네이션)과 관련된 상태를 관리합니다.
    const [page, setPage] = useState(1);
    const [displayedJournals, setDisplayedJournals] = useState([]);
    const [hasMore, setHasMore] = useState(true); // 더 불러올 일기가 있는지 여부

    // 4. ✅ [수정] journals Map을 최신순으로 정렬된 '배열'로 변환합니다.
    const sortedJournals = useMemo(() => {
        if (!journals || journals.size === 0) return [];
        // Map의 value들(일기 객체)만 배열로 추출한 뒤, logDate를 기준으로 내림차순 정렬합니다.
        // ✅ [수정] 'ilogDate'를 'logDate'로 변경합니다.
        return Array.from(journals.values()).sort((a, b) => new Date(b.logDate) - new Date(a.logDate));
    }, [journals]);

    // 5. 페이지가 바뀌거나, 정렬된 원본 데이터가 바뀔 때마다 화면에 보여줄 목록을 업데이트합니다.
    useEffect(() => {
        const newJournalCount = page * JOURNALS_PER_PAGE;
        const newJournalsToShow = sortedJournals.slice(0, newJournalCount);

        setDisplayedJournals(newJournalsToShow);

        // 더 이상 불러올 일기가 없으면 hasMore를 false로 설정합니다.
        if (newJournalsToShow.length >= sortedJournals.length) {
            setHasMore(false);
        } else {
            setHasMore(true);
        }
    }, [page, sortedJournals]);

    // 6. Intersection Observer를 사용해 무한 스크롤을 구현합니다.
    const observer = useRef();
    const lastJournalElementRef = useCallback(node => {
        if (journalLoading) return; // 로딩 중에는 중복 실행 방지
        if (observer.current) observer.current.disconnect(); // 기존 observer 연결 해제

        observer.current = new IntersectionObserver(entries => {
            // 관찰 대상(마지막 요소)이 화면에 보이고, 더 불러올 게시글이 있다면
            if (entries[0].isIntersecting && hasMore) {
                setPage(prevPage => prevPage + 1); // 다음 페이지 로드
            }
        });

        if (node) observer.current.observe(node); // 새 노드 관찰 시작
    }, [journalLoading, hasMore]);

    // ✅ [수정] handleDelete 함수를 useCallback으로 감싸 불필요한 재생성을 방지합니다.
    const handleDelete = useCallback(async (journalId, journalDate) => {
        // 사용자가 정말 삭제할 것인지 확인
        if (window.confirm("정말로 이 일기를 삭제하시겠습니까?")) {
            try {
                // Context의 deleteJournal 함수 호출
                await deleteJournal(journalId, journalDate);
                alert("일기가 삭제되었습니다.");
                // 삭제 성공 후 특별한 페이지 이동은 필요 없으므로, 상태 업데이트에 따라 UI가 자동으로 갱신됩니다.
            } catch (error) {
                alert("일기 삭제 중 오류가 발생했습니다.");
            }
        }
    }, [deleteJournal]); // deleteJournal 함수가 변경될 때만 이 함수를 재생성합니다.

    // ✅ [추가] 수정 버튼 클릭 핸들러
    const handleEdit = useCallback((journalToEdit) => {
        // ✅ [수정] 확인 창 없이 바로 수정 모드로 진입하도록 변경
        console.log("✏️ 수정할 일기 객체:", journalToEdit);
        navigate('/journal/write', {
            state: {
                journalToEdit: journalToEdit, // 수정할 일기 데이터를 전달합니다.
                backgroundLocation: location, // 모달 뒤에 현재 페이지를 배경으로 유지합니다.
            }
        });
    }, [navigate, location]); // navigate와 location이 변경될 때만 함수를 재생성합니다.

    // 초기 로딩 중이거나, 작성된 일기가 없을 때의 UI 처리
    if (journalLoading && sortedJournals.length === 0) {
        return <div>일기를 불러오는 중...</div>;
    }
    if (!journalLoading && sortedJournals.length === 0) {
        return (
            <EmptyFeedContainer>
                <FaRegComment size={64}/>
                <h2>아직 작성된 일기가 없습니다</h2>
                <EmptyFeedText>
                    오늘의 첫 일기를 작성해보세요!
                </EmptyFeedText>
                <WriteJournalButton onClick={() => navigate('/journal/write', {
                    state: {backgroundLocation: location}
                })}>
                    ✏️ 일기 작성하기
                </WriteJournalButton>
            </EmptyFeedContainer>
        );
    }

    return (
        <div>
            <FeedContainer>
                {displayedJournals.map((journal, index) => {
                    // 현재 렌더링하는 요소가 마지막 요소인지 확인
                    const isLastElement = displayedJournals.length === index + 1;

                    // ✅ [수정] 'journal.images' 배열의 첫 번째 요소를 대표 이미지로 사용합니다.
                    const firstImageUrl = (journal.images && journal.images.length > 0) ? journal.images[0] : null;

                    return (
                        // ✅ [수정] PostListStyled 디자인에 journal 객체의 데이터를 매핑합니다.
                        <PostContainer key={journal.id} ref={isLastElement ? lastJournalElementRef : null}>
                            <PostHeader>
                                {/* ✅ [수정] 각 journal에 포함된 작성자 정보를 사용합니다. */}
                                <ProfileImage src={journal.writerProfileImage || '/path/to/default/profile.png'}
                                              alt={`${journal.writerNickname} profile`}/>
                                <UserInfo>
                                    <span className="username">{journal.writerNickname || '사용자'}</span>
                                    {/* ✅ [수정] 'ilogDate'를 'logDate'로 변경합니다. */}
                                    <span className="date">{new Date(journal.logDate).toLocaleDateString()}</span>
                                </UserInfo>
                                {/* [수정] isOwner가 true일 때만 수정/삭제 버튼을 보여줍니다. */}
                                {isOwner && (
                                    <PostHeaderActions>
                                        {/* ✅ [수정] onClick 핸들러에 handleEdit 함수를 연결합니다. */}
                                        <button data-tooltip="수정" onClick={() => handleEdit(journal)}>
                                            <HiPencilAlt/>
                                        </button>
                                        {/* ✅ [수정] 'ilogDate'를 'logDate'로 변경합니다. */}
                                        <button data-tooltip="삭제"
                                                onClick={() => handleDelete(journal.id, journal.logDate.split('T')[0])}>
                                            <MdDeleteForever/>
                                        </button>
                                    </PostHeaderActions>
                                )}
                            </PostHeader>

                            <div>
                                {firstImageUrl && <PostImage src={firstImageUrl} alt="Journal image"/>}
                            </div>
                            <PostContent>{journal.content}</PostContent>

                            <PostActions>
                                <button><FaRegHeart/></button>
                                <button><FaRegComment/></button>
                                <button><FaRegShareSquare/></button>
                            </PostActions>
                        </PostContainer>
                    );
                })}
                {hasMore && <div>다음 일기를 불러오는 중...</div>}
                {!hasMore && sortedJournals.length > 0 &&
                    <div style={{textAlign: 'center', padding: '20px'}}></div>}
            </FeedContainer>
        </div>
    );
};

export default JournalList;