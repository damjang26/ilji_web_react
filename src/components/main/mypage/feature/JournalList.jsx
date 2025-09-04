import React, {useState, useEffect, useMemo, useRef, useCallback} from 'react';
import {useJournal} from "../../../../contexts/JournalContext.jsx";
import {useAuth} from "../../../../AuthContext.jsx"; // ❗ 사용자 정보(프로필 사진 등)를 가져오기 위해 추가
import {useNavigate} from "react-router-dom"; // ✅ 페이지 이동을 위해 추가
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
    // 2. 사용자 정보를 가져옵니다 (프로필 사진, 이름 등).
    const {user} = useAuth();
    const navigate = useNavigate(); // ✅ navigate 함수 가져오기

    // 3. 화면에 보여줄 일기 목록(페이지네이션)과 관련된 상태를 관리합니다.
    const [page, setPage] = useState(1);
    const [displayedJournals, setDisplayedJournals] = useState([]);
    const [hasMore, setHasMore] = useState(true); // 더 불러올 일기가 있는지 여부

    // 4. ✅ [수정] journals Map을 최신순으로 정렬된 '배열'로 변환합니다.
    const sortedJournals = useMemo(() => {
        if (!journals || journals.size === 0) return [];
        // Map의 value들(일기 객체)만 배열로 추출한 뒤, ilogDate를 기준으로 내림차순 정렬합니다.
        return Array.from(journals.values()).sort((a, b) => new Date(b.ilogDate) - new Date(a.ilogDate));
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
                <WriteJournalButton onClick={() => navigate('/journal/write')}>
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

                    // ✅ [추가] imgUrl(JSON 문자열)을 파싱하여 첫 번째 이미지 URL을 추출합니다.
                    let firstImageUrl = null;
                    if (journal.imgUrl) {
                        try {
                            const parsedUrls = JSON.parse(journal.imgUrl);
                            if (Array.isArray(parsedUrls) && parsedUrls.length > 0) {
                                firstImageUrl = parsedUrls[0];
                            }
                        } catch (e) {
                            // 파싱에 실패해도 앱이 중단되지 않도록 오류를 콘솔에만 기록합니다.
                            console.error(`Failed to parse imgUrl for journal ${journal.id}:`, journal.imgUrl);
                        }
                    }

                    return (
                        // ✅ [수정] PostListStyled 디자인에 journal 객체의 데이터를 매핑합니다.
                        <PostContainer key={journal.id} ref={isLastElement ? lastJournalElementRef : null}>
                            <PostHeader>
                                <ProfileImage src={user?.picture || '/path/to/default/profile.png'}
                                              alt={`${user?.name} profile`}/>
                                <UserInfo>
                                    <span className="username">{user?.name || '사용자'}</span>
                                    <span className="date">{new Date(journal.ilogDate).toLocaleDateString()}</span>
                                </UserInfo>
                                {/* ✅ [신규] 수정 및 삭제 아이콘을 담는 컨테이너 */}
                                <PostHeaderActions>
                                    {/* TODO: 수정 버튼 클릭 시 JournalWrite 모달을 수정 모드로 열기 */}
                                    <button data-tooltip="수정" onClick={() => alert('수정 모달 열기 기능 구현 예정')}>
                                        <HiPencilAlt/>
                                    </button>
                                    <button data-tooltip="삭제"
                                            onClick={() => handleDelete(journal.id, journal.ilogDate.split('T')[0])}>
                                        <MdDeleteForever/>
                                    </button>
                                </PostHeaderActions>
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