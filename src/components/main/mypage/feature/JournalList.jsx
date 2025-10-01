import React, {useState, useEffect, useMemo, useCallback} from 'react';
import {useJournal} from "../../../../contexts/JournalContext.jsx";
import {useAuth} from "../../../../AuthContext.jsx";
import {message, Modal, Spin} from "antd";
import {getPagedJournals, getPostLikers, toggleLike} from "../../../../api.js";
import {useInView} from "react-intersection-observer";
import {useNavigate, useLocation, useParams} from "react-router-dom"; // ✅ 페이지 이동을 위해 추가
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
    JournalItemLayoutContainer, LikeCountSpan,
    JournalItemContentContainer,
    ImageSliderContainer, OriginalImage, JournalDateHeading,
    ImageSlide, SliderArrow, JournalEntryDate, CommentPlaceholder, SpringBinder, SpringBinder2
} from "../../../../styled_components/main/post/PostListStyled.jsx";
import {SortOptionsContainer, SortButton} from '../../../../styled_components/main/mypage/MyPageStyled';
import {FaChevronLeft, FaChevronRight, FaRegHeart, FaHeart} from "react-icons/fa"; // ✅ [추가] FaHeart 아이콘
import {HiPencilAlt} from "react-icons/hi";
import {MdDeleteForever} from "react-icons/md";
import {RiQuillPenAiLine} from "react-icons/ri";
import {formatRelativeTime} from "../../../../utils/timeFormatter.js";
import {BiSolidShareAlt} from "react-icons/bi";
import PostLikersModal from "../../post/PostLikersModal.jsx";
import PostComment from "../../post/PostComment.jsx";
import {shareJournal} from "../../../../utils/shareUtils.js";
import {LuBookLock, LuBookUser} from "react-icons/lu"; // ✅ [추가] 공유 부품 임포트

// ✅ [신규] 각 일기 항목을 렌더링하는 컴포넌트
// 각 아이템이 독립적인 이미지 슬라이더 상태를 갖도록 분리합니다.
const JournalItem = ({
                         journal,
                         lastJournalElementRef,
                         onDelete,
                         onEdit,
                         onImageClick,
                         onLikeCountClick,
                         user,
                         handleLikeClick,
                         onCommentCountChange, // ✅ [추가] 댓글 개수 변경 핸들러 prop
                         onProfileClick
                     }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    // ✅ [추가] 이미지가 가로로 긴지 여부를 저장하는 상태
    const [isLandscape, setIsLandscape] = useState(false);
    // ✅ [추가] 댓글 창의 열림/닫힘 상태를 부모에서 관리합니다.
    const [isCommentOpen, setIsCommentOpen] = useState(false);
    const spring = "/images/spring_binder.png"

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

    // ✅ [수정] 공유 로직을 외부 유틸리티 함수로 대체
    const handleShare = useCallback(() => {
        shareJournal(journal);
    }, [journal]);

    // 이미지가 있는 경우: 2단 레이아웃 (슬라이더 포함)
    if (hasImages) {
        return (
            <JournalItemWrapper ref={lastJournalElementRef}>
                <SpringBinder src={spring} alt="Spring binder"/>
                <SpringBinder2 src={spring} alt="Spring binder"/>
                <PostContainer
                    className="has-image"
                    isCommentOpen={isCommentOpen}
                >
                    <JournalItemLayoutContainer className={isLandscape ? 'landscape' : ''}>
                        {/* ✅ [수정] 이미지 슬라이더 로직 적용 */}
                        <ImageSliderContainer onClick={() => onImageClick(imageUrls[currentImageIndex])}>
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
                                    onClick={() => onProfileClick(journal.writerId)}
                                    src={journal.writerProfileImage || '/path/to/default/profile.png'}
                                    alt={`${journal.writerNickname} profile`}/>
                                <UserInfo>
                                    <div>
                                        {/* ✅ [수정] username과 date를 div로 묶음 */}
                                        <div>
                                            <span className="username"
                                                  onClick={() => onProfileClick(journal.writerId)}
                                            >{journal.writerNickname || 'User'}</span>
                                            {journal.visibility === "PRIVATE" &&
                                                <LuBookLock style={{marginRight: '4px'}}/>}
                                            {journal.visibility === "FRIENDS_ONLY" &&
                                                <LuBookUser style={{marginRight: '4px'}}/>}
                                            <span className="date">{formatRelativeTime(journal.createdAt)}</span>
                                        </div>

                                        <ActionItem>
                                            {journal.likeCount > 0 && (
                                                <LikeCountSpan onClick={(e) => {
                                                    e.stopPropagation();
                                                    onLikeCountClick(journal.id);
                                                }}>
                                                    {journal.likeCount}
                                                </LikeCountSpan>
                                            )}
                                            {/* ✅ [수정] PostList와 동일한 '좋아요' 버튼 로직 적용 */}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleLikeClick(journal.id);
                                                }}
                                                disabled={journal.writerId === user?.id}
                                                aria-label={journal.liked ? 'Unlike' : 'Like'}
                                            >
                                                {journal.liked ? <FaHeart color="red"/> : <FaRegHeart/>}
                                            </button>
                                        </ActionItem>
                                    </div>
                                </UserInfo>
                            </PostHeader>
                            <JournalEntryDate>
                                <JournalDateHeading>{formattedDate}</JournalDateHeading>
                            </JournalEntryDate>
                            <PostContent>
                                {journal.content}
                            </PostContent>
                        </JournalItemContentContainer>
                    </JournalItemLayoutContainer>
                    <CommentPlaceholder/>
                    {/* ✅ [수정] onCommentCountChange prop을 전달합니다. */}
                    <PostComment journal={journal} isOpen={isCommentOpen} onToggle={toggleCommentView}
                                 onCommentCountChange={onCommentCountChange}/>
                </PostContainer>
                <IndexTabsContainer>
                    <IndexTabActions type="share" onClick={handleShare}>
                        <button data-tooltip="Share"><BiSolidShareAlt/></button>
                    </IndexTabActions>
                    <IndexTabActions type="edit" onClick={() => onEdit(journal)}>
                        <button data-tooltip="Edit"><HiPencilAlt/></button>
                    </IndexTabActions>
                    <IndexTabActions type="delete" onClick={() => onDelete(journal.id, journal.logDate.split('T')[0])}>
                        <button data-tooltip="Delete">
                            <MdDeleteForever/></button>
                    </IndexTabActions>
                </IndexTabsContainer>
            </JournalItemWrapper>
        );
    }

    // 이미지가 없는 경우: 기존 레이아웃
    return (
        <JournalItemWrapper ref={lastJournalElementRef}>
            <SpringBinder src={spring} alt="Spring binder"/>
            <SpringBinder2 src={spring} alt="Spring binder"/>
            <PostContainer className="not-has-image" isCommentOpen={isCommentOpen}>
                <PostHeader>
                    <ProfileImage
                        onClick={() => onProfileClick(journal.writerId)}
                        src={journal.writerProfileImage || '/path/to/default/profile.png'}
                        alt={`${journal.writerNickname} profile`}/>
                    <UserInfo>
                        <div>
                            {/* ✅ [수정] username과 date를 div로 묶음 */}
                            <div>
                                <span className="username"
                                      onClick={() => onProfileClick(journal.writerId)}>{journal.writerNickname || 'User'}</span>
                                {journal.visibility === "PRIVATE" && <LuBookLock style={{marginRight: '4px'}}/>}
                                {journal.visibility === "FRIENDS_ONLY" &&
                                    <LuBookUser style={{marginRight: '4px'}}/>}
                                <span className="date">{formatRelativeTime(journal.createdAt)}</span>
                            </div>

                            <ActionItem>
                                {journal.likeCount > 0 && (
                                    <LikeCountSpan onClick={(e) => {
                                        e.stopPropagation();
                                        onLikeCountClick(journal.id);
                                    }}>
                                        {journal.likeCount}
                                    </LikeCountSpan>
                                )}
                                {/* ✅ [수정] PostList와 동일한 '좋아요' 버튼 로직 적용 */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleLikeClick(journal.id);
                                    }}
                                    disabled={journal.writerId === user?.id}
                                    aria-label={journal.liked ? 'Unlike' : 'Like'}
                                >
                                    {journal.liked ? <FaHeart color="red"/> : <FaRegHeart/>}
                                </button>
                            </ActionItem>
                        </div>
                    </UserInfo>
                </PostHeader>
                <JournalEntryDate>
                    <JournalDateHeading>{formattedDate}</JournalDateHeading>
                </JournalEntryDate>
                <PostContent>
                    {journal.content}
                </PostContent>
                <CommentPlaceholder/>
                {/* ✅ [수정] onCommentCountChange prop을 전달합니다. */}
                <PostComment journal={journal} isOpen={isCommentOpen} onToggle={toggleCommentView}
                             onCommentCountChange={onCommentCountChange}/>
            </PostContainer>
            <IndexTabsContainer>
                <IndexTabActions type="share" onClick={handleShare}>
                    <button data-tooltip="Share"><BiSolidShareAlt/></button>
                </IndexTabActions>
                <IndexTabActions type="edit" onClick={() => onEdit(journal)}>
                    <button data-tooltip="Edit"><HiPencilAlt/></button>
                </IndexTabActions>
                <IndexTabActions type="delete" onClick={() => onDelete(journal.id, journal.logDate.split('T')[0])}>
                    <button data-tooltip="Delete">
                        <MdDeleteForever/></button>
                </IndexTabActions>
            </IndexTabsContainer>
        </JournalItemWrapper>
    );
};

// [수정] 부모 컴포넌트로부터 onPostChange 함수를 props로 받습니다.
const JournalList = ({onPostChange}) => {
    // ✅ [수정] Context에서는 '수정/삭제' 기능만 가져옵니다. 데이터는 직접 관리합니다.
    const {deleteJournalEntryForList} = useJournal(); // [수정] 새로 만든 함수를 사용합니다.
    const {user: currentUser, postChangeSignal, triggerPostChange} = useAuth(); // [수정] triggerPostChange를 가져옵니다.
    const {userId} = useParams();
    const navigate = useNavigate(); // ✅ navigate 함수 가져오기
    const location = useLocation(); // ✅ 모달 네비게이션의 배경 위치를 위해 추가합니다.

    // ✅ [신규] 페이지네이션 및 정렬을 위한 로컬 상태 (LikeList와 동일)
    const [journals, setJournals] = useState([]);
    const [sortBy, setSortBy] = useState('latest'); // 'latest', 'oldest', 'popular'
    const [page, setPage] = useState(0);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const {ref, inView} = useInView({threshold: 0});

    // --- 모달 관련 상태 ---
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);
    const [selectedImageUrl, setSelectedImageUrl] = useState('');
    // --- 좋아요 목록 모달 관련 상태 추가 ---
    const [isLikersModalOpen, setLikersModalOpen] = useState(false);
    const [likersList, setLikersList] = useState([]);
    const [currentPostId, setCurrentPostId] = useState(null);
    const [isLikersLoading, setIsLikersLoading] = useState(false);

    // ✅ [신규] API를 호출하여 일기 목록을 가져오는 함수 (LikeList와 동일)
    const fetchJournals = useCallback(async (isNewSort) => {
        if (loading) return;
        setLoading(true);

        // ✅ [수정] 조회 대상 userId 결정. URL에 userId가 없으면 내 ID를 사용합니다.
        const targetUserId = userId || currentUser?.id;
        if (!targetUserId) { // 조회할 ID가 없으면 중단
            setLoading(false);
            setHasMore(false); // 더 이상 로드할 데이터가 없음을 명시
            return;
        }

        const currentPage = isNewSort ? 0 : page;

        try {
            const response = await getPagedJournals({
                userId: targetUserId,
                sortBy: sortBy,
                page: currentPage,
                size: 10
            });


            const newJournals = response.data.content;
            setJournals(prev => isNewSort ? newJournals : [...prev, ...newJournals]);
            setHasMore(!response.data.last);
            if (!response.data.last) {
                setPage(currentPage + 1);
            }
        } catch (error) {
            console.error("Failed to load journals.", error);
            message.error("Failed to load the list.");
        } finally {
            setLoading(false);
        }
    }, [userId, currentUser, sortBy, page]); // ✅ [수정] 의존성 배열에서 loading을 제거합니다.

    // ✅ [신규] 정렬 기준 변경 시, 데이터 새로고침 (LikeList와 동일)
    useEffect(() => {
        // ✅ [수정] 조회 대상 ID(내 ID 또는 다른 사용자 ID)가 확정되어야만 API를 호출합니다.
        // AuthContext에서 currentUser 정보가 로드될 때까지 기다리는 효과가 있습니다.
        const targetUserId = userId || currentUser?.id;
        if (!targetUserId) {
            return; // ID가 없으면 아무 작업도 하지 않고 종료합니다.
        }

        setJournals([]);
        setPage(0);
        setHasMore(true);
        fetchJournals(true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sortBy, userId, currentUser?.id]); // ✅ [수정] 의존성을 currentUser.id로 명시하고, fetchJournals를 제거합니다.

    // ✅ [신규] 무한 스크롤 트리거 (LikeList와 동일)
    useEffect(() => {
        if (inView && hasMore && !loading) {
            fetchJournals(false);
        }
    }, [inView, hasMore, loading, fetchJournals]);

    // [핵심 수정] AuthContext의 postChangeSignal을 감지하여 일기 목록을 새로고침합니다.
    useEffect(() => {
        // postChangeSignal이 0보다 클 때만 (초기 렌더링 방지) 실행합니다.
        if (postChangeSignal > 0) {
            // 현재 JournalList가 보여주는 사용자의 목록만 갱신합니다.
            const targetUserId = userId || currentUser?.id;
            if (targetUserId) fetchJournals(true);
        }
        // postChangeSignal이 바뀔 때마다 fetchJournals 함수를 실행합니다.
    }, [postChangeSignal, fetchJournals]);

    // ✅ [수정] 'journal:updated' 전역 이벤트를 감지하여, 목록 전체를 다시 불러오는 대신 수정된 항목만 교체합니다.
    useEffect(() => {
        const handleJournalUpdate = (event) => {
            const {updatedJournal} = event.detail;
            if (updatedJournal) {
                setJournals(prevJournals =>
                    prevJournals.map(j =>
                        j.id === updatedJournal.id ? updatedJournal : j
                    )
                );
            }
        };

        window.addEventListener('journal:updated', handleJournalUpdate);
        // 컴포넌트가 언마운트될 때 이벤트 리스너를 정리합니다.
        return () => window.removeEventListener('journal:updated', handleJournalUpdate);
    }, []); // 의존성 배열을 비워서 컴포넌트 마운트/언마운트 시에만 리스너를 등록/해제합니다.

    // ✅ [수정] handleDelete 함수를 useCallback으로 감싸 불필요한 재생성을 방지합니다.
    const handleDelete = useCallback(async (journalId, journalDate) => {
        // 사용자가 정말 삭제할 것인지 확인
        if (window.confirm("Are you sure you want to delete this journal?")) {
            try {
                // 1. Context의 새 함수를 호출하여 서버에서 삭제합니다.
                await deleteJournalEntryForList(journalId);
                alert("Journal deleted successfully.");
                // 2. [핵심] 삭제 성공 후, 전역 신호를 발생시킵니다.
                triggerPostChange();
            } catch (error) {
                console.error("Error deleting journal", error);
                alert("Failed to delete the journal.");
            }
        }
    }, [deleteJournalEntryForList, triggerPostChange]); // [수정] 의존성 배열을 새 함수에 맞게 변경합니다.

    // ✅ [추가] 프로필 클릭 핸들러
    const handleProfileClick = useCallback((writerId) => {
        if (writerId) {
            navigate(`/mypage/${writerId}`);
        }
    }, [navigate]);

    // ✅ [추가] 수정 버튼 클릭 핸들러
    const handleEdit = useCallback((journalToEdit) => {
        navigate('/i-log/write', {
            state: {
                journalToEdit: journalToEdit, // 수정할 일기 데이터를 전달합니다.
                backgroundLocation: location, // 모달 뒤에 현재 페이지를 배경으로 유지합니다.
            }
        });
    }, [navigate, location]);

    // ✅ [추가] 이미지 클릭 시 모달을 여는 함수
    const handleImageClick = useCallback((imageUrl) => {
        setSelectedImageUrl(imageUrl);
        setIsImageModalOpen(true);
    }, []);

    // ✅ [추가] 좋아요 개수 클릭 시 모달을 여는 함수
    const handleLikeCountClick = useCallback(async (postId) => {
        if (!postId) return;
        setCurrentPostId(postId);
        setLikersModalOpen(true);
        setIsLikersLoading(true);

        try {
            const response = await getPostLikers(postId);
            setLikersList(response.data);
        } catch (error) {
            console.error("Failed to load the list of likers.", error);
            message.error("Failed to load the list of likers.");
            setLikersModalOpen(false);
        } finally {
            setIsLikersLoading(false);
        }
    }, []);

    // ✅ [추가] 모달 내에서 팔로우/언팔로우 시 목록을 새로고침하는 함수
    const refreshLikersList = useCallback(() => {
        if (currentPostId) {
            handleLikeCountClick(currentPostId);
        }
    }, [currentPostId, handleLikeCountClick]);

    // ✅ [추가] PostList와 동일한 '좋아요' 클릭 핸들러
    const handleLikeClick = useCallback(async (postId) => {
        // 1. 낙관적 업데이트
        setJournals(currentJournals =>
            currentJournals.map(j => {
                if (j.id === postId) {
                    const newIsLiked = !j.liked;
                    const newLikeCount = newIsLiked ? j.likeCount + 1 : j.likeCount - 1;
                    return {...j, liked: newIsLiked, likeCount: newLikeCount};
                }
                return j;
            })
        );

        try {
            // 2. 서버에 API 요청
            await toggleLike(postId, currentUser?.id);
        } catch (error) {
            console.error("Error processing like:", error);
            message.error("Failed to process like.");
            // 3. 실패 시 UI 롤백
            setJournals(currentJournals =>
                currentJournals.map(j => {
                    if (j.id === postId) {
                        // isLiked 상태와 likeCount를 원래대로 되돌립니다.
                        const originalIsLiked = !j.liked;
                        const originalLikeCount = originalIsLiked ? j.likeCount + 1 : j.likeCount - 1;
                        return {...j, liked: originalIsLiked, likeCount: originalLikeCount};
                    }
                    return j;
                })
            );
        }
    }, [currentUser?.id, setJournals]);

    // ✅ [추가] PostList와 동일한 댓글 개수 변경 핸들러
    const handleCommentCountChange = useCallback((postId, changeAmount) => {
        setJournals(currentJournals =>
            currentJournals.map(j =>
                j.id === postId ? {...j, commentCount: j.commentCount + changeAmount} : j
            )
        );
    }, [setJournals]);


    return (
        <div>
            {/* ✅ [신규] 정렬 탭 (LikeList와 동일) */}
            <SortOptionsContainer>
                <SortButton $active={sortBy === 'latest'} onClick={() => setSortBy('latest')}>Newest</SortButton>
                <SortButton $active={sortBy === 'popular'} onClick={() => setSortBy('popular')}>Popular</SortButton>
                <SortButton $active={sortBy === 'oldest'} onClick={() => setSortBy('oldest')}>Oldest</SortButton>
            </SortOptionsContainer>

            {/* ✅ [수정] 로딩 및 데이터 상태에 따라 다른 컨텐츠를 렌더링합니다. */}
            {loading && journals.length === 0 ? (
                // 1. 초기 로딩 시: 중앙 스피너
                <div style={{textAlign: 'center', padding: '40px'}}><Spin size="large"/></div>
            ) : !loading && journals.length === 0 ? (
                // 2. 로딩 완료 후 데이터가 없을 시: '일기 없음' 화면
                <EmptyFeedContainer>
                    <RiQuillPenAiLine size={64}/>
                    <h2>Nothing here yet...</h2>
                    <EmptyFeedText>
                        Be the first to share your story today!
                    </EmptyFeedText>
                    <WriteJournalButton onClick={() => navigate('/i-log/write', {
                        state: {backgroundLocation: location}
                    })}>
                        Write Now
                    </WriteJournalButton>
                </EmptyFeedContainer>
            ) : (
                // 3. 데이터가 있을 시: 일기 목록
                <>
                    <FeedContainer>
                        {journals.map((journal, index) => {
                            const isLastElement = journals.length === index + 1;
                            return (
                                <JournalItem
                                    key={journal.id}
                                    journal={journal}
                                    lastJournalElementRef={isLastElement ? ref : null}
                                    onDelete={handleDelete}
                                    onEdit={handleEdit}
                                    onImageClick={handleImageClick}
                                    onLikeCountClick={handleLikeCountClick}
                                    user={currentUser}
                                    handleLikeClick={handleLikeClick}
                                    onProfileClick={handleProfileClick}
                                    onCommentCountChange={(amount) => handleCommentCountChange(journal.id, amount)}
                                />
                            );
                        })}
                    </FeedContainer>
                    {loading && <div style={{textAlign: 'center', padding: '20px'}}><Spin/></div>}
                </>
            )}

            {/* ✅ [추가] 이미지 원본 보기 모달 */}
            <Modal
                open={isImageModalOpen}
                onCancel={() => setIsImageModalOpen(false)}
                footer={null}
                centered
                width="auto"
                styles={{body: {padding: 0, background: 'none'}}}
            >
                <OriginalImage src={selectedImageUrl} alt="Original post image"/>
            </Modal>

            {/* ✅ [추가] 좋아요 목록 모달 렌더링 */}
            <PostLikersModal
                open={isLikersModalOpen}
                onClose={() => setLikersModalOpen(false)}
                users={likersList}
                loading={isLikersLoading}
                onUpdate={refreshLikersList}
            />
        </div>
    );
};

export default JournalList;