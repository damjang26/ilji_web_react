import React, {useState, useEffect, useMemo, useCallback} from 'react';
import {useJournal} from "../../../../contexts/JournalContext.jsx";
import {useAuth} from "../../../../AuthContext.jsx";
import {message, Modal, Spin} from "antd";
import {getPostLikers, getPagedJournals} from "../../../../api.js";
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
    ImageSlide, SliderArrow, JournalEntryDate, CommentPlaceholder, SpringBinder, SpringBinder2,
} from "../../../../styled_components/main/post/PostListStyled.jsx";
import {SortOptionsContainer, SortButton} from '../../../../styled_components/main/mypage/MyPageStyled';
import {FaChevronLeft, FaChevronRight, FaRegHeart} from "react-icons/fa"; // ✅ [추가] 화살표 아이콘
import {HiPencilAlt} from "react-icons/hi";
import {MdDeleteForever} from "react-icons/md";
import {RiQuillPenAiLine} from "react-icons/ri";
import {formatRelativeTime} from "../../../../utils/timeFormatter.js";
import {BiSolidShareAlt} from "react-icons/bi";
import PostLikersModal from "../../post/PostLikersModal.jsx";
import PostComment from "../../post/PostComment.jsx";

// ✅ [신규] 각 일기 항목을 렌더링하는 컴포넌트
// 각 아이템이 독립적인 이미지 슬라이더 상태를 갖도록 분리합니다.
const JournalItem = ({journal, lastJournalElementRef, onDelete, onEdit, onImageClick, onLikeCountClick}) => {
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
                                            {journal.likeCount > 0 && (
                                                <LikeCountSpan onClick={(e) => {
                                                    e.stopPropagation();
                                                    onLikeCountClick(journal.id);
                                                }}>
                                                    {journal.likeCount}
                                                </LikeCountSpan>
                                            )}
                                            <button><FaRegHeart size={24}/></button>
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
            <SpringBinder src={spring} alt="Spring binder"/>
            <SpringBinder2 src={spring} alt="Spring binder"/>
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
                                {journal.likeCount > 0 && (
                                    <LikeCountSpan onClick={(e) => {
                                        e.stopPropagation();
                                        onLikeCountClick(journal.id);
                                    }}>
                                        {journal.likeCount}
                                    </LikeCountSpan>
                                )}
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

// [수정] 부모 컴포넌트로부터 onPostChange 함수를 props로 받습니다.
const JournalList = ({ onPostChange }) => {
    // ✅ [수정] Context에서는 '수정/삭제' 기능만 가져옵니다. 데이터는 직접 관리합니다.
    const {deleteJournal} = useJournal();
    const {user: currentUser} = useAuth(); // 현재 로그인한 사용자 정보
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
        if (!targetUserId) return; // 조회할 ID가 없으면 중단

        const currentPage = isNewSort ? 0 : page;
        console.log("마이페이지 일기")

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
            console.error("일기 목록을 불러오는 데 실패했습니다.", error);
            message.error("목록을 불러오는 데 실패했습니다.");
        } finally {
            setLoading(false);
        }
    }, [userId, currentUser, sortBy, page, loading]); // ✅ [수정] 의존성 배열 변경

    // ✅ [신규] 정렬 기준 변경 시, 데이터 새로고침 (LikeList와 동일)
    useEffect(() => {
        // ✅ [수정] 조회 대상 ID가 확정되면 데이터를 불러옵니다.
        const targetUserId = userId || currentUser?.id;
        if (targetUserId) {
            setJournals([]);
            setPage(0);
            setHasMore(true);
            fetchJournals(true);
        }
    }, [sortBy, userId, currentUser]); // ✅ [수정] 의존성 배열 변경

    // ✅ [신규] 무한 스크롤 트리거 (LikeList와 동일)
    useEffect(() => {
        if (inView && hasMore && !loading) {
            fetchJournals(false);
        }
    }, [inView, hasMore, loading, fetchJournals]);

    // ✅ [수정] 'journal:updated' 전역 이벤트를 감지하여, 목록 전체를 다시 불러오는 대신 수정된 항목만 교체합니다.
    useEffect(() => {
        const handleJournalUpdate = (event) => {
            const { updatedJournal } = event.detail;
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
        if (window.confirm("정말로 이 일기를 삭제하시겠습니까?")) {
            // ✅ [수정] 삭제 성공 시 실행될 콜백 함수 정의
            const onUpdate = (deletedId) => {
                setJournals(prev => prev.filter(j => j.id !== deletedId));
                alert("일기가 삭제되었습니다.");

                // [핵심 수정] 삭제가 성공했음을 부모 컴포넌트(MyPage)에 알립니다.
                if (onPostChange) {
                    onPostChange();
                }
            };

            try {
                // ✅ [수정] Context의 deleteJournal 함수에 콜백 전달
                await deleteJournal(journalId, journalDate, onUpdate);
            } catch (error) {
                alert("일기 삭제 중 오류가 발생했습니다.");
            }
        }
    }, [deleteJournal, onPostChange]); // [수정] 의존성 배열에 onPostChange를 추가합니다.

    // ✅ [추가] 수정 버튼 클릭 핸들러
    const handleEdit = useCallback((journalToEdit) => {
        navigate('/journal/write', {
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
            console.error("좋아요 목록을 불러오는 데 실패했습니다.", error);
            message.error("좋아요 목록을 불러오는 데 실패했습니다.");
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


    // 초기 로딩 중이거나, 작성된 일기가 없을 때의 UI 처리
    if (loading && journals.length === 0 && !hasMore) { // hasMore가 false가 되어야 최종적으로 없다고 판단
        return <div>일기를 불러오는 중...</div>;
    }
    if (!loading && journals.length === 0) {
        return (
            <EmptyFeedContainer>
                <RiQuillPenAiLine size={64}/>
                <h2>Nothing here yet...</h2>
                <EmptyFeedText>
                    Be the first to share your story today!
                </EmptyFeedText>
                <WriteJournalButton onClick={() => navigate('/journal/write', {
                    state: {backgroundLocation: location}
                })}>
                    Write Now
                </WriteJournalButton>
            </EmptyFeedContainer>
        );
    }

    return (
        <div>
            {/* ✅ [신규] 정렬 탭 (LikeList와 동일) */}
            <SortOptionsContainer>
                <SortButton $active={sortBy === 'latest'} onClick={() => setSortBy('latest')}>최신순</SortButton>
                <SortButton $active={sortBy === 'popular'} onClick={() => setSortBy('popular')}>인기순</SortButton>
                <SortButton $active={sortBy === 'oldest'} onClick={() => setSortBy('oldest')}>오래된순</SortButton>
            </SortOptionsContainer>

            <FeedContainer>
                {journals.map((journal, index) => {
                    // 현재 렌더링하는 요소가 마지막 요소인지 확인
                    const isLastElement = journals.length === index + 1;
                    return (
                        <JournalItem
                            key={journal.id}
                            journal={journal}
                            lastJournalElementRef={isLastElement ? ref : null} // ✅ [수정] useInView의 ref 전달
                            onDelete={handleDelete}
                            onEdit={handleEdit}
                            onImageClick={handleImageClick}
                            onLikeCountClick={handleLikeCountClick}
                        />
                    );
                })}
            </FeedContainer>

            {loading && <div style={{textAlign: 'center', padding: '20px'}}><Spin/></div>}

            {/* ✅ [추가] 이미지 원본 보기 모달 */}
            <Modal
                open={isImageModalOpen}
                onCancel={() => setIsImageModalOpen(false)}
                footer={null}
                centered
                width="auto"
                styles={{ body: { padding: 0, background: 'none' } }}
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