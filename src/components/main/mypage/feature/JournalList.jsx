import React, {useState, useEffect, useMemo, useRef, useCallback} from 'react';
import {useJournal} from "../../../../contexts/JournalContext.jsx";
import {useMyPage} from "../../../../contexts/MyPageContext.jsx"; // [수정] isOwner 상태를 가져오기 위해 추가
import {useNavigate, useLocation} from "react-router-dom"; // ✅ 페이지 이동을 위해 추가
import {
    FeedContainer,
    PostContainer,
    IndexTabActions,
    IndexTabsContainer,
    JournalItemWrapper,
    PostContent,
    PostHeader,
    ProfileImage,
    UserInfo,
    EmptyFeedContainer,
    EmptyFeedText,
    WriteJournalButton,
    ActionItem,
    JournalItemLayoutContainer,
    JournalItemContentContainer,
    ImageSliderContainer,
    ImageSlide, SliderArrow, JournalEntryDate, CommentPlaceholder,
} from "../../../../styled_components/main/post/PostListStyled.jsx";
import {FaChevronLeft, FaChevronRight, FaRegHeart} from "react-icons/fa"; // ✅ [추가] 화살표 아이콘
import {HiPencilAlt} from "react-icons/hi";
import {MdDeleteForever} from "react-icons/md";
import {RiQuillPenAiLine} from "react-icons/ri";
import {formatRelativeTime} from "../../../../utils/timeFormatter.js";
import {BiSolidShareAlt} from "react-icons/bi";
import PostComment from "../../post/PostComment.jsx";

// 한 번에 불러올 일기 개수
const JOURNALS_PER_PAGE = 10;

// ✅ [신규] 각 일기 항목을 렌더링하는 컴포넌트
// 각 아이템이 독립적인 이미지 슬라이더 상태를 갖도록 분리합니다.
const JournalItem = ({journal, lastJournalElementRef, onDelete, onEdit}) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    // ✅ [추가] 이미지가 가로로 긴지 여부를 저장하는 상태
    const [isLandscape, setIsLandscape] = useState(false);
    // ✅ [추가] 댓글 창의 열림/닫힘 상태를 부모에서 관리합니다.
    const [isCommentOpen, setIsCommentOpen] = useState(false);

    const hasImages = journal.images && journal.images.length > 0;
    const imageUrls = journal.images || [];

    // ✅ [추가] 첫 번째 이미지의 비율을 확인하여 isLandscape 상태를 설정하는 로직
    useEffect(() => {
        if (hasImages) {
            const img = new Image();
            img.src = imageUrls[0];
            img.onload = () => {
                // 이미지의 가로가 세로보다 길면 isLandscape를 true로 설정
                setIsLandscape(img.naturalWidth > img.naturalHeight);
            };
        } else {
            // 이미지가 없으면 false로 초기화
            setIsLandscape(false);
        }
        // journal.id가 바뀔 때마다 (즉, 다른 일기가 렌더링될 때마다) 이 효과를 재실행합니다.
    }, [journal.id, hasImages, imageUrls]);

    // ✅ [신규] 날짜를 'MONTH DAY, YEAR' 형식으로 포맷팅합니다. (예: JAN 01, 2024)
    const formattedDate = useMemo(() => {
        if (!journal?.logDate) return '';
        return new Date(journal.logDate).toLocaleDateString('en-US', {month: 'short', day: '2-digit', year: 'numeric'});
    }, [journal.logDate]);

    const handleNextImage = useCallback((e) => {
        e.stopPropagation(); // 이벤트 버블링 방지
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % imageUrls.length);
    }, [imageUrls.length]);

    const handlePrevImage = useCallback((e) => {
        e.stopPropagation(); // 이벤트 버블링 방지
        setCurrentImageIndex((prevIndex) => (prevIndex - 1 + imageUrls.length) % imageUrls.length);
    }, [imageUrls.length]);

    // ✅ [추가] 댓글 창을 토글하는 함수
    const toggleCommentView = useCallback((e) => {
        e?.stopPropagation(); // 이벤트 버블링 방지
        setIsCommentOpen(prev => !prev);
    }, []);

    const handleShare = useCallback(async () => {
        const shareUrl = window.location.href;
        const shareTitle = `"${journal.writerNickname}"님의 일기`;

        try {
            // Web Share API를 사용하여 네이티브 공유 UI를 엽니다.
            await navigator.share({
                title: shareTitle,
                text: `[일지]에서 ${shareTitle}를 확인해보세요!`,
                url: shareUrl,
            });
        } catch (error) {
            console.log("공유 기능이 지원되지 않거나 사용자가 취소했습니다.", error);
        }
    }, [journal]);

    // 이미지가 있는 경우: 2단 레이아웃 (슬라이더 포함)
    if (hasImages) {
        return (
            <JournalItemWrapper ref={lastJournalElementRef}>
                <PostContainer
                    className="has-image"
                    isCommentOpen={isCommentOpen}
                >
                    <JournalItemLayoutContainer className={isLandscape ? 'landscape' : ''}>
                        {/* ✅ [수정] 이미지 슬라이더 로직 적용 */}
                        <ImageSliderContainer>
                            <ImageSlide src={imageUrls[currentImageIndex]}
                                        alt={`journal image ${currentImageIndex + 1}`}/>
                            {imageUrls.length > 1 && (
                                <>
                                    <SliderArrow className="prev"
                                                 onClick={handlePrevImage}><FaChevronLeft/></SliderArrow>
                                    <SliderArrow className="next"
                                                 onClick={handleNextImage}><FaChevronRight/></SliderArrow>
                                </>
                            )}
                        </ImageSliderContainer>

                        <JournalItemContentContainer>
                            <PostHeader>
                                <ProfileImage
                                    src={journal.writerProfileImage || '/path/to/default/profile.png'}
                                    alt={`${journal.writerNickname} profile`}/>
                                <UserInfo>
                                    <div>
                                        {/* ✅ [수정] username과 date를 div로 묶음 */}
                                        <div>
                                            <span className="username">{journal.writerNickname || '사용자'}</span>
                                            <span className="date">{formatRelativeTime(journal.createdAt)}</span>
                                        </div>

                                        <ActionItem>
                                            <button><FaRegHeart size={24}/></button>
                                            {journal.likeCount > 0 && <span>{journal.likeCount}</span>}
                                        </ActionItem>
                                    </div>
                                </UserInfo>
                            </PostHeader>
                            <JournalEntryDate>
                                <h3>{formattedDate}</h3>
                            </JournalEntryDate>
                            <PostContent>
                                {journal.content}
                            </PostContent>
                        </JournalItemContentContainer>
                    </JournalItemLayoutContainer>
                    <CommentPlaceholder/>
                    <PostComment journal={journal} isOpen={isCommentOpen} onToggle={toggleCommentView}/>
                </PostContainer>
                <IndexTabsContainer>
                    <IndexTabActions type="share" onClick={handleShare}>
                        <button data-tooltip="공유"><BiSolidShareAlt/></button>
                    </IndexTabActions>
                    <IndexTabActions type="edit" onClick={() => onEdit(journal)}>
                        <button data-tooltip="수정"><HiPencilAlt/></button>
                    </IndexTabActions>
                    <IndexTabActions type="delete" onClick={() => onDelete(journal.id, journal.logDate.split('T')[0])}>
                        <button data-tooltip="삭제">
                            <MdDeleteForever/></button>
                    </IndexTabActions>
                </IndexTabsContainer>
            </JournalItemWrapper>
        );
    }

    // 이미지가 없는 경우: 기존 레이아웃
    return (
        <JournalItemWrapper ref={lastJournalElementRef}>
            <PostContainer className="not-has-image" isCommentOpen={isCommentOpen}>
                <PostHeader>
                    <ProfileImage src={journal.writerProfileImage || '/path/to/default/profile.png'}
                                  alt={`${journal.writerNickname} profile`}/>
                    <UserInfo>
                        <div>
                            {/* ✅ [수정] username과 date를 div로 묶음 */}
                            <div>
                                <span className="username">{journal.writerNickname || '사용자'}</span>
                                <span className="date">{formatRelativeTime(journal.createdAt)}</span>
                            </div>

                            <ActionItem>
                                <button><FaRegHeart size={24}/></button>
                                {journal.likeCount > 0 && <span>{journal.likeCount}</span>}
                            </ActionItem>
                        </div>
                    </UserInfo>
                </PostHeader>
                <JournalEntryDate>
                    <h3>{formattedDate}</h3>
                </JournalEntryDate>
                <PostContent>
                    {journal.content}
                </PostContent>
                <CommentPlaceholder/>
                <PostComment journal={journal} isOpen={isCommentOpen} onToggle={toggleCommentView}/>
            </PostContainer>
            <IndexTabsContainer>
                <IndexTabActions type="share" onClick={handleShare}>
                    <button data-tooltip="공유"><BiSolidShareAlt/></button>
                </IndexTabActions>
                <IndexTabActions type="edit" onClick={() => onEdit(journal)}>
                    <button data-tooltip="수정"><HiPencilAlt/></button>
                </IndexTabActions>
                <IndexTabActions type="delete" onClick={() => onDelete(journal.id, journal.logDate.split('T')[0])}>
                    <button data-tooltip="삭제">
                        <MdDeleteForever/></button>
                </IndexTabActions>
            </IndexTabsContainer>
        </JournalItemWrapper>
    );
};

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
                <RiQuillPenAiLine size={64}/>
                <h2>아직 작성된 일기가 없습니다</h2>
                <EmptyFeedText>
                    오늘의 첫 일기를 작성해보세요!
                </EmptyFeedText>
                <WriteJournalButton onClick={() => navigate('/journal/write', {
                    state: {backgroundLocation: location}
                })}>
                    작성하기
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
                    return (
                        <JournalItem
                            key={journal.id}
                            journal={journal}
                            lastJournalElementRef={isLastElement ? lastJournalElementRef : null}
                            onDelete={handleDelete}
                            onEdit={handleEdit}
                        />
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