import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import {useJournal} from '../../../contexts/JournalContext';
import {message} from "antd";
import {getPostLikers} from "../../../api.js";
import {
    JournalViewWrapper,
    ViewContainer,
    ProfileSection,
    ProfilePicture,
    AuthorInfo,
    AuthorName,
    ContentSection,
    BookLayoutContainer,
    ImageSliderContainer,
    ImageSlide,
    SliderArrow,
    ContentContainer, SideActionTabsContainer, SideActionTab, JournalDate
} from '../../../styled_components/main/journal/JournalViewStyled';
import {HiPencilAlt} from "react-icons/hi";
import {MdDeleteForever} from "react-icons/md";
import {ActionItem, LikeCountSpan} from "../../../styled_components/main/post/PostListStyled.jsx";
import {FaChevronLeft, FaChevronRight, FaRegHeart} from "react-icons/fa";
import {useAuth} from "../../../AuthContext.jsx";
import {BiSolidShareAlt} from "react-icons/bi";
import PostLikersModal from "../post/PostLikersModal.jsx";
import PostComment from "../post/PostComment.jsx"; // ✅ [추가] PostComment 컴포넌트 임포트

const JournalView = () => {
    const {user} = useAuth();
    const {deleteJournal} = useJournal();
    const navigate = useNavigate(); // ✅ 페이지 이동을 위해 useNavigate 훅을 사용합니다.
    const location = useLocation(); // ✅ 모달 네비게이션의 배경 위치를 위해 추가합니다.

    // ✅ [수정] location.state의 데이터를 useState로 관리하여 업데이트가 가능하도록 합니다.
    const [journal, setJournal] = useState(location.state?.journalData);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const [isCommentOpen, setIsCommentOpen] = useState(false); // ✅ [신규] 댓글 창 열림/닫힘 상태

    // ✅ [신규] openCommentSection 플래그를 확인하여 댓글 창 자동 열기
    useEffect(() => {
        if (journal?.openCommentSection) {
            setIsCommentOpen(true);

            // 플래그 사용 후 location.state에서 제거하여 재실행 방지
            const { openCommentSection, ...restJournalData } = journal;
            navigate(location.pathname, {
                state: {
                    ...location.state,
                    journalData: restJournalData,
                },
                replace: true,
            });
        }
    }, [journal, navigate, location]);


    // --- 좋아요 목록 모달 관련 상태 추가 ---
    const [isLikersModalOpen, setLikersModalOpen] = useState(false);
    const [likersList, setLikersList] = useState([]);
    const [currentPostId, setCurrentPostId] = useState(null);
    const [isLikersLoading, setIsLikersLoading] = useState(false);

    const spring = "/images/spring_binder.png";

    // ✅ [추가] 'journal:updated' 이벤트를 감지하여 현재 뷰의 데이터를 업데이트합니다.
    useEffect(() => {
        const handleJournalUpdate = (event) => {
            const { updatedJournal } = event.detail;
            // 수정된 일기가 현재 보고 있는 일기와 동일한 경우에만 상태를 업데이트합니다.
            if (updatedJournal && journal && updatedJournal.id === journal.id) {
                // 기존 journal 데이터에 수정된 데이터를 덮어씁니다.
                setJournal(prevJournal => ({ ...prevJournal, ...updatedJournal }));
            }
        };

        window.addEventListener('journal:updated', handleJournalUpdate);
        // 컴포넌트가 언마운트될 때 이벤트 리스너를 정리합니다.
        return () => window.removeEventListener('journal:updated', handleJournalUpdate);
    }, [journal]); // journal이 변경될 때마다 리스너를 재등록하여 최신 journal.id를 참조하도록 합니다.

    // ✅ [신규] 날짜를 'MONTH DAY, YEAR' 형식으로 포맷팅합니다. (예: JAN 01, 2024)
    const formattedDate = useMemo(() => {
        if (!journal?.logDate) return '';
        return new Date(journal.logDate).toLocaleDateString('en-US', {month: 'short', day: '2-digit', year: 'numeric'});
    }, [journal.logDate]);

    const imageUrls = useMemo(() => {
        if (journal && Array.isArray(journal.images)) {
            return journal.images;
        }
        return [];
    }, [journal]);

    const handleDelete = async (journalId, pageDate) => {
        // 사용자가 정말 삭제할 것인지 확인
        if (window.confirm("정말로 이 일기를 삭제하시겠습니까?")) {
            try {
                // Context의 deleteJournal 함수 호출
                await deleteJournal(journalId, pageDate);
                alert("일기가 삭제되었습니다.");
                // ✅ 삭제 성공 후, 이전 페이지(일기 목록)로 이동시킵니다.
                navigate(-1);
            } catch (error) {
                alert("일기 삭제 중 오류가 발생했습니다.");
            }
        }
    };

    // ✅ [추가] 수정 버튼 클릭 핸들러
    const handleEdit = useCallback((journalToEdit) => {
        navigate('/journal/write', {
            state: {
                journalToEdit: journalToEdit,
                // ✅ [수정] 현재 location이 아닌, 이전 페이지에서 전달받은 backgroundLocation을 다시 전달합니다.
                backgroundLocation: location.state?.backgroundLocation,
            }
        });
    }, [navigate, location.state?.backgroundLocation]);

    // ✅ [신규] 공유 버튼 클릭 핸들러
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

    const handleNextImage = useCallback(() => {
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % imageUrls.length);
    }, [imageUrls.length]);

    const handlePrevImage = useCallback(() => {
        setCurrentImageIndex((prevIndex) => (prevIndex - 1 + imageUrls.length) % imageUrls.length);
    }, [imageUrls.length]);

    // ✅ [신규] 댓글 창을 토글하는 함수
    const toggleCommentView = useCallback((e) => {
        e.stopPropagation(); // 이벤트 버블링 방지
        setIsCommentOpen(prev => !prev);
    }, []);

    // ✅ [신규] 댓글 개수가 변경될 때 journal 상태를 업데이트하는 함수
    const handleCommentCountChange = useCallback((changeAmount) => {
        setJournal(prev => ({...prev, commentCount: (prev.commentCount || 0) + changeAmount}));
    }, []);


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

    if (!journal) {
        return <ViewContainer className="no-image"><p>일기 정보를 불러올 수 없습니다. 목록에서 다시 시도해주세요.</p>
        </ViewContainer>;
    }

    // 이미지가 있는지 여부 확인
    const hasImages = imageUrls.length > 0;

    // 이미지가 없는 경우의 UI
    if (!hasImages) {
        return (
            <JournalViewWrapper>
                <ViewContainer className="no-image" isCommentOpen={isCommentOpen}>
                    <ProfileSection>
                        <div>
                            <ProfilePicture
                                src={journal?.writerProfileImage || 'https://via.placeholder.com/48'}
                                alt={`${journal?.writerNickname || 'user'} profile`}
                                referrerPolicy="no-referrer"/>
                            <AuthorInfo>
                                <AuthorName>{journal?.writerNickname || '사용자'}</AuthorName>
                            </AuthorInfo>
                        </div>
                        <ActionItem>
                            {journal.likeCount > 0 && (
                                <LikeCountSpan onClick={(e) => {
                                    e.stopPropagation();
                                    handleLikeCountClick(journal.id);
                                }}>{journal.likeCount}</LikeCountSpan>
                            )}
                            <button><FaRegHeart/></button>
                        </ActionItem>
                    </ProfileSection>
                    <JournalDate>{formattedDate}</JournalDate>
                    <ContentSection>
                        <p>{journal.content}</p>
                    </ContentSection>
                    {/* ✅ [수정] PostComment 컴포넌트를 재사용합니다. */}
                    <PostComment
                        journal={journal}
                        isOpen={isCommentOpen}
                        onToggle={toggleCommentView}
                        onCommentCountChange={handleCommentCountChange}/>
                </ViewContainer>
                {/* ✅ [수정] 컨테이너는 항상 렌더링하고, 내부 탭을 조건부로 보여줍니다. */}
                <SideActionTabsContainer>
                    <SideActionTab type="share" onClick={handleShare}>
                        <button data-tooltip="공유"><BiSolidShareAlt/></button>
                    </SideActionTab>
                    {user?.id === journal.writerId && (
                        <>
                            <SideActionTab type="edit" onClick={() => handleEdit(journal)}>
                                <button data-tooltip="수정"><HiPencilAlt/></button>
                            </SideActionTab>
                            <SideActionTab type="delete"
                                           onClick={() => handleDelete(journal.id, journal.logDate.split('T')[0])}>
                                <button data-tooltip="삭제"><MdDeleteForever/></button>
                            </SideActionTab>
                        </>
                    )}
                </SideActionTabsContainer>

                {/* ✅ [추가] 좋아요 목록 모달 렌더링 */}
                <PostLikersModal
                    open={isLikersModalOpen}
                    onClose={() => setLikersModalOpen(false)}
                    users={likersList}
                    loading={isLikersLoading}
                    onUpdate={refreshLikersList}
                />
            </JournalViewWrapper>
        );
    }

    // 이미지가 있는 경우의 UI (책 레이아웃)
    return (
        <JournalViewWrapper>
            <ViewContainer className="has-image">
                <BookLayoutContainer isCommentOpen={isCommentOpen}>
                    <ImageSliderContainer>
                        <ImageSlide src={imageUrls[currentImageIndex]} alt={`journal image ${currentImageIndex + 1}`}/>
                        {imageUrls.length > 1 && (
                            <>
                                <SliderArrow className="prev" onClick={handlePrevImage}><FaChevronLeft/></SliderArrow>
                                <SliderArrow className="next" onClick={handleNextImage}><FaChevronRight/></SliderArrow>
                            </>
                        )}
                    </ImageSliderContainer>
                    <ContentContainer>
                        <ProfileSection>
                            <div>
                                <ProfilePicture
                                    src={journal?.writerProfileImage || 'https://via.placeholder.com/48'}
                                    alt={`${journal?.writerNickname || 'user'} profile`}
                                    referrerPolicy="no-referrer"/>
                                <AuthorInfo>
                                    <AuthorName>{journal?.writerNickname || '사용자'}</AuthorName>
                                </AuthorInfo>
                            </div>
                            <ActionItem>
                                {journal.likeCount > 0 && (
                                    <LikeCountSpan onClick={(e) => {
                                        e.stopPropagation();
                                        handleLikeCountClick(journal.id);
                                    }}>{journal.likeCount}</LikeCountSpan>
                                )}
                                <button><FaRegHeart/></button>
                            </ActionItem>
                        </ProfileSection>
                        <JournalDate>{formattedDate}</JournalDate>
                        <ContentSection>
                            <p>{journal.content}</p>
                        </ContentSection>
                        {/* ✅ [수정] PostComment 컴포넌트를 재사용합니다. */}
                        <PostComment
                            journal={journal}
                            isOpen={isCommentOpen}
                            onToggle={toggleCommentView}
                            onCommentCountChange={handleCommentCountChange}/>
                    </ContentContainer>
                </BookLayoutContainer>
            </ViewContainer>
            {/* ✅ [수정] 컨테이너는 항상 렌더링하고, 내부 탭을 조건부로 보여줍니다. */}
            <SideActionTabsContainer>
                <SideActionTab type="share" onClick={handleShare}>
                    <button data-tooltip="공유"><BiSolidShareAlt/></button>
                </SideActionTab>
                {user?.id === journal.writerId && (
                    <>
                        <SideActionTab type="edit" onClick={() => handleEdit(journal)}>
                            <button data-tooltip="수정"><HiPencilAlt/></button>
                        </SideActionTab>
                        <SideActionTab type="delete"
                                       onClick={() => handleDelete(journal.id, journal.logDate.split('T')[0])}>
                            <button data-tooltip="삭제"><MdDeleteForever/></button>
                        </SideActionTab>
                    </>
                )}
            </SideActionTabsContainer>

            {/* ✅ [추가] 좋아요 목록 모달 렌더링 */}
            <PostLikersModal
                open={isLikersModalOpen}
                onClose={() => setLikersModalOpen(false)}
                users={likersList}
                loading={isLikersLoading}
                onUpdate={refreshLikersList}
            />
        </JournalViewWrapper>
    );
};

export default JournalView;