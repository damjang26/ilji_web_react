import React, {useCallback, useState, useEffect, useMemo} from 'react';
import {
    FeedContainer,
    PostActions,
    PostContainer,
    PostContent,
    PostHeader,
    ProfileImage,
    UserInfo,
    EmptyFeedContainer,
    EmptyFeedText,
    ActionItem,
    EndOfFeed,
    JournalItemWrapper,
    JournalItemLayoutContainer,
    ImageSliderContainer,
    ImageSlide,
    SliderArrow,
    JournalItemContentContainer,
    JournalEntryDate,
    IndexTabsContainer,
    IndexTabActions,
    CommentPlaceholder,
    LikeCountSpan
} from "../../../styled_components/main/post/PostListStyled.jsx";
import {FaRegHeart, FaHeart, FaChevronLeft, FaChevronRight} from "react-icons/fa";
import {formatRelativeTime} from '../../../utils/timeFormatter.js';
import {TbNotebook} from "react-icons/tb";
import {useAuth} from "../../../AuthContext.jsx";
import {toggleLike, getPostLikers} from "../../../api.js"; // getPostLikers 임포트
import {HiPencilAlt} from "react-icons/hi";
import {MdDeleteForever} from "react-icons/md";
import {useNavigate, useLocation} from "react-router-dom";
import {useJournal} from "../../../contexts/JournalContext.jsx";
import {BiSolidShareAlt} from "react-icons/bi";
import PostComment from "./PostComment.jsx";
import PostLikersModal from "./PostLikersModal.jsx"; // 좋아요 목록 모달 임포트
import {message} from "antd"; // antd 메시지 임포트

const JournalItem = ({
                         journal,
                         lastJournalElementRef,
                         onDelete,
                         handleEdit,
                         user,
                         handleLikeClick,
                         onLikeCountClick,
                         onCommentCountChange
                     }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    // ✅ [추가] 이미지가 가로로 긴지 여부를 저장하는 상태
    const [isLandscape, setIsLandscape] = useState(false);
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
        return new Date(journal.logDate).toLocaleDateString('en-US', {
            month: 'short',
            day: '2-digit',
            year: 'numeric'
        });
    }, [journal.logDate]);

    const handleNextImage = useCallback((e) => {
        e.stopPropagation(); // 이벤트 버블링 방지
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % imageUrls.length);
    }, [imageUrls.length]);

    const handlePrevImage = useCallback((e) => {
        e.stopPropagation(); // 이벤트 버블링 방지
        setCurrentImageIndex((prevIndex) => (prevIndex - 1 + imageUrls.length) % imageUrls.length);
    }, [imageUrls.length]);

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

    // ✅ [추가] 댓글 창을 토글하는 함수
    const toggleCommentView = useCallback((e) => {
        e?.stopPropagation(); // 이벤트 버블링 방지
        setIsCommentOpen(prev => !prev);
    }, []);

    // 이미지가 있는 경우: 2단 레이아웃 (슬라이더 포함)
    if (hasImages) {
        return (
            <JournalItemWrapper>
                <PostContainer
                    ref={lastJournalElementRef}
                    isCommentOpen={isCommentOpen}
                    className="has-image"
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
                                            {journal.likeCount > 0 && (
                                                <LikeCountSpan onClick={(e) => {
                                                    e.stopPropagation();
                                                    onLikeCountClick(journal.id);
                                                }}>
                                                    {journal.likeCount}
                                                </LikeCountSpan>
                                            )}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation(); // 이벤트 버블링 중단
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
                                <h3>{formattedDate}</h3>
                            </JournalEntryDate>
                            <PostContent>
                                {journal.content}
                            </PostContent>
                            <PostActions>
                            </PostActions>
                        </JournalItemContentContainer>
                    </JournalItemLayoutContainer>
                    <CommentPlaceholder/>
                    <PostComment journal={journal} isOpen={isCommentOpen} onToggle={toggleCommentView}
                                 onCommentCountChange={onCommentCountChange}/>
                </PostContainer>
                <IndexTabsContainer>
                    {/* ✅ [수정] onClick 핸들러에서 불필요한 화살표 함수를 제거하고, handleShare를 직접 호출하도록 변경합니다. */}
                    <IndexTabActions type="share" onClick={handleShare}>
                        <button data-tooltip="공유"><BiSolidShareAlt/></button>
                    </IndexTabActions>
                    {user?.id === journal.writerId && (
                        <>
                            <IndexTabActions type="edit" onClick={() => handleEdit(journal)}>
                                <button data-tooltip="수정"><HiPencilAlt/></button>
                            </IndexTabActions>
                            <IndexTabActions type="delete"
                                             onClick={() => onDelete(journal.id, journal.logDate.split('T')[0])}>
                                <button data-tooltip="삭제">
                                    <MdDeleteForever/></button>
                            </IndexTabActions>
                        </>
                    )}
                </IndexTabsContainer>
            </JournalItemWrapper>
        );
    }

    // 이미지가 없는 경우: 기존 레이아웃
    return (
        <JournalItemWrapper>
            <PostContainer ref={lastJournalElementRef} $isCommentOpen={isCommentOpen} className="not-has-image">
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
                                {journal.likeCount > 0 && (
                                    <LikeCountSpan onClick={(e) => {
                                        e.stopPropagation();
                                        onLikeCountClick(journal.id);
                                    }}>
                                        {journal.likeCount}
                                    </LikeCountSpan>
                                )}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation(); // 이벤트 버블링 중단
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
                    <h3>{formattedDate}</h3>
                </JournalEntryDate>
                <PostContent>
                    {journal.content}
                </PostContent>
                <CommentPlaceholder/>
                <PostComment journal={journal} isOpen={isCommentOpen} onToggle={toggleCommentView}
                             onCommentCountChange={onCommentCountChange}/>
            </PostContainer>
            <IndexTabsContainer>
                {/* ✅ [수정] onClick 핸들러에서 불필요한 화살표 함수를 제거하고, handleShare를 직접 호출하도록 변경합니다. */}
                <IndexTabActions type="share" onClick={handleShare}>
                    <button data-tooltip="공유"><BiSolidShareAlt/></button>
                </IndexTabActions>
                {user?.id === journal.writerId && (
                    <>
                        <IndexTabActions type="edit" onClick={() => handleEdit(journal)}>
                            <button data-tooltip="수정"><HiPencilAlt/></button>
                        </IndexTabActions>
                        <IndexTabActions type="delete"
                                         onClick={() => onDelete(journal.id, journal.logDate.split('T')[0])}>
                            <button data-tooltip="삭제">
                                <MdDeleteForever/></button>
                        </IndexTabActions>
                    </>
                )}
            </IndexTabsContainer>
        </JournalItemWrapper>
    );
};

const PostList = ({posts, setPosts, loading, hasMore, lastPostElementRef}) => {
    const {user} = useAuth();
    const navigate = useNavigate();
    const location = useLocation(); // ✅ [추가] useLocation 훅을 호출하여 location 객체를 가져옵니다.
    const {deleteJournal} = useJournal();


    // --- 좋아요 목록 모달 관련 상태 추가 ---
    const [isLikersModalOpen, setLikersModalOpen] = useState(false);
    const [likersList, setLikersList] = useState([]);
    const [currentPostId, setCurrentPostId] = useState(null);
    const [isLikersLoading, setIsLikersLoading] = useState(false); // ✅ [추가] 좋아요 목록 로딩 상태
    // ------------------------------------

    const getUniquePosts = (posts) => {
        if (!Array.isArray(posts)) return [];
        const seen = new Set();
        return posts.filter(post => {
            const duplicate = seen.has(post.id);
            if (!duplicate) {
                seen.add(post.id);
            }
            return !duplicate;
        });
    };

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

    const handleEdit = useCallback((journalToEdit) => {
        console.log("✏️ 수정할 일기 객체:", journalToEdit);
        navigate('/journal/write', {
            state: {
                journalToEdit: journalToEdit, // 수정할 일기 데이터를 전달합니다.
                backgroundLocation: location, // 모달 뒤에 현재 페이지를 배경으로 유지합니다.
            }
        });
    }, [navigate, location]); // navigate와 location이 변경될 때만 함수를 재생성합니다.
    // ✅ [수정] 좋아요 버튼 클릭 핸들러 (API 연동)
    const handleLikeClick = useCallback(async (postId) => {
        // 1. 낙관적 업데이트: 서버 응답을 기다리지 않고 UI를 즉시 변경합니다.
        setPosts(currentPosts =>
            currentPosts.map(p => {
                if (p.id === postId) {
                    const newIsLiked = !p.liked;
                    const newLikeCount = newIsLiked ? p.likeCount + 1 : p.likeCount - 1;
                    return {...p, liked: newIsLiked, likeCount: newLikeCount};
                }
                return p;
            })
        );

        try {
            // 2. 서버에 API 요청을 보냅니다.
            await toggleLike(postId, user?.id);
            // 성공 시: 이미 UI가 변경되었으므로 아무것도 하지 않습니다.
        } catch (error) {
            console.error("좋아요 처리 중 오류 발생:", error);
            // 3. 실패 시: UI를 원래 상태로 되돌립니다.
            message.error("좋아요 처리에 실패했습니다.");
            setPosts(currentPosts =>
                currentPosts.map(p => {
                    if (p.id === postId) {
                        // isLiked 상태와 likeCount를 원래대로 되돌립니다.
                        const originalIsLiked = !p.liked;
                        const originalLikeCount = originalIsLiked ? p.likeCount + 1 : p.likeCount - 1;
                        return {...p, liked: originalIsLiked, likeCount: originalLikeCount};
                    }
                    return p;
                })
            );
        }
    }, [user?.id, setPosts]);

    // --- 좋아요 목록 관련 함수 추가 ---
    const handleLikeCountClick = useCallback(async (postId) => {
        if (!postId) return;
        setCurrentPostId(postId); // 모달 내에서 목록 갱신을 위해 현재 포스트 ID 저장
        setLikersModalOpen(true); // ✅ [수정] 모달을 즉시 엽니다.
        setIsLikersLoading(true); // ✅ [추가] 로딩 상태를 true로 설정합니다.

        try {
            const response = await getPostLikers(postId);
            // ✅ [수정] console.log에서 쉼표(,)를 사용하거나 response.data를 직접 확인합니다.
            console.log("좋아요 목록 응답 객체:", response);
            console.log("좋아요 목록 데이터 (배열):", response.data);
            setLikersList(response.data);
        } catch (error) {
            console.error("좋아요 목록을 불러오는 데 실패했습니다.", error);
            message.error("좋아요 목록을 불러오는 데 실패했습니다.");
            setLikersModalOpen(false); // ✅ [추가] 에러 발생 시 모달을 닫습니다.
        } finally {
            setIsLikersLoading(false); // ✅ [추가] 성공/실패 여부와 관계없이 로딩 상태를 해제합니다.
        }
    }, []); // 의존성 배열이 비어있으므로 컴포넌트가 처음 렌더링될 때 한 번만 생성됩니다.

    // 모달 내에서 팔로우/언팔로우 시 목록을 새로고침하는 함수
    const refreshLikersList = useCallback(() => {
        if (currentPostId) handleLikeCountClick(currentPostId);
    }, [currentPostId, handleLikeCountClick]);
    // ------------------------------------

    // --- 댓글 개수 변경 관련 함수 추가 ---
    const handleCommentCountChange = useCallback((postId, newCount) => {
        setPosts(currentPosts =>
            currentPosts.map(p =>
                p.id === postId ? {...p, commentCount: newCount} : p
            )
        );
    }, [setPosts]);
    // ------------------------------------

    // 초기 로딩 중이거나, 게시글이 아직 하나도 없을 때의 UI를 처리합니다.
    if (!loading && posts.length === 0) {
        return (
            <EmptyFeedContainer>
                <TbNotebook size={64}/>
                <h2>새로운 이야기를 찾아보세요</h2>
                <EmptyFeedText>
                    📖 아직 보여드릴 일기가 없어요.<br/>
                    새로운 친구를 팔로우하고 함께 일상을 나눠 보세요!
                </EmptyFeedText>
            </EmptyFeedContainer>
        );
    }

    return (<div>
            <FeedContainer>
                {/* ✅ [수정] 렌더링 시점에 중복된 게시물을 제거합니다. */}
                {getUniquePosts(posts).map((post, index) => {
                    // 현재 렌더링하는 요소가 마지막 요소인지 확인
                    const isLastElement = posts.length === index + 1 && hasMore;
                    return (
                        <JournalItem
                            key={post.id}
                            journal={post}
                            lastJournalElementRef={isLastElement ? lastPostElementRef : null}
                            onDelete={handleDelete}
                            handleEdit={handleEdit}
                            user={user}
                            handleLikeClick={handleLikeClick}
                            onLikeCountClick={handleLikeCountClick}
                            onCommentCountChange={(newCount) => handleCommentCountChange(post.id, newCount)}
                        />
                    );
                })}
                {/* 데이터 로딩 중일 때 스피너를 보여줍니다. */}
                {loading && <div>로딩 중...</div>}
                {/* 더 이상 불러올 데이터가 없을 때 메시지를 보여줍니다. */}
                {!loading && !hasMore && posts.length > 0 && (
                    <EndOfFeed>
                        일기장을 끝까지 펼쳐봤네요! 🌿<br/>
                        새로운 친구를 팔로우해서 이야기를 이어가 보세요
                    </EndOfFeed>
                )}
            </FeedContainer>

            {/* 좋아요 목록 모달 렌더링 */}
            <PostLikersModal
                open={isLikersModalOpen}
                onClose={() => setLikersModalOpen(false)}
                users={likersList}
                loading={isLikersLoading} // ✅ [추가] 로딩 상태를 모달에 전달합니다.
                onUpdate={refreshLikersList}
            />
        </div>
    );
};

export default PostList;