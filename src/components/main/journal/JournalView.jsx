import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import {useJournal} from '../../../contexts/JournalContext';
import {message} from "antd";
import {getJournalByDate, getPostLikers} from "../../../api.js";
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
import {LuBookLock, LuBookUser} from "react-icons/lu"; // ✅ [추가] 공개 범위 아이콘
import {MdDeleteForever} from "react-icons/md";
import {ActionItem, LikeCountSpan} from "../../../styled_components/main/post/PostListStyled.jsx";
import {FaChevronLeft, FaChevronRight, FaRegHeart} from "react-icons/fa";
import {useAuth} from "../../../AuthContext.jsx";
import {BiSolidShareAlt} from "react-icons/bi";
import PostLikersModal from "../post/PostLikersModal.jsx";
import PostComment from "../post/PostComment.jsx";
import {shareJournal} from "../../../utils/shareUtils.js"; // ✅ [추가] 공유 부품 임포트

const JournalView = () => {
    const {user} = useAuth();
    const {deleteJournal} = useJournal();
    const navigate = useNavigate(); // ✅ 페이지 이동을 위해 useNavigate 훅을 사용합니다.
    const location = useLocation(); // ✅ 모달 네비게이션의 배경 위치를 위해 추가합니다.

    // ✅ [수정] location.state의 데이터를 useState로 관리하여 업데이트가 가능하도록 합니다.
    const [journal, setJournal] = useState(location.state?.journalData);
    const [isLoading, setIsLoading] = useState(false); // ✅ [추가] 데이터 재로딩 시 사용할 로딩 상태
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const [isCommentOpen, setIsCommentOpen] = useState(false); // ✅ [신규] 댓글 창 열림/닫힘 상태

    // ✅ [신규] openCommentSection 플래그를 확인하여 댓글 창 자동 열기
    useEffect(() => {
        if (journal?.openCommentSection) {
            setIsCommentOpen(true);

            // 플래그 사용 후 location.state에서 제거하여 재실행 방지
            const {openCommentSection, ...restJournalData} = journal;
            navigate(location.pathname, {
                state: {
                    ...location.state,
                    journalData: restJournalData,
                },
                replace: true,
            });
        }
    }, [journal, navigate, location]);

    // ✅ [핵심 수정] '수정 후 복귀' 시에만 최신 데이터를 다시 불러옵니다.
    useEffect(() => {
        // 1. sessionStorage에서 '수정 후 복귀' 플래그를 확인합니다.
        const needsRefresh = sessionStorage.getItem('journal-needs-refresh');

        // 2. 플래그가 없으면 아무것도 하지 않고 종료합니다. (성능 최적화)
        if (!needsRefresh || !journal?.logDate) {
            return;
        }

        // 3. 플래그가 있으면, 사용했으므로 즉시 제거합니다. (무한 재조회 방지)
        sessionStorage.removeItem('journal-needs-refresh');

        const fetchLatestJournal = async () => {
            setIsLoading(true);
            try {
                // 날짜를 'YYYY-MM-DD' 형식으로 변환합니다.
                const dateStr = new Date(journal.logDate).toISOString().split('T')[0];
                const response = await getJournalByDate(dateStr);
                // 상태를 최신 데이터로 업데이트합니다.
                setJournal(response.data);
                message.success('일기 내용이 업데이트되었습니다.');
            } catch (error) {
                console.error("Failed to refresh journal data:", error);
                message.error("최신 일기 정보를 불러오는 데 실패했습니다.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchLatestJournal();

    }, [journal?.logDate, navigate]); // journal 데이터가 처음 설정될 때 이 로직을 실행합니다.


    // --- 좋아요 목록 모달 관련 상태 추가 ---
    const [isLikersModalOpen, setLikersModalOpen] = useState(false);
    const [likersList, setLikersList] = useState([]);
    const [currentPostId, setCurrentPostId] = useState(null);
    const [isLikersLoading, setIsLikersLoading] = useState(false);

    const spring = "/images/spring_binder.png";

    // ✅ [추가] 'journal:updated' 이벤트를 감지하여 현재 뷰의 데이터를 업데이트합니다.
    useEffect(() => {
        const handleJournalUpdate = (event) => {
            const {updatedJournal} = event.detail;
            // 수정된 일기가 현재 보고 있는 일기와 동일한 경우에만 상태를 업데이트합니다.
            if (updatedJournal && journal && updatedJournal.id === journal.id) {
                // 기존 journal 데이터에 수정된 데이터를 덮어씁니다.
                setJournal(prevJournal => ({...prevJournal, ...updatedJournal}));
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
    }, [journal?.logDate]);

    const imageUrls = useMemo(() => {
        if (journal && Array.isArray(journal.images)) {
            return journal.images;
        }
        return [];
    }, [journal]);

    const handleDelete = async (journalId, pageDate) => {
        // 사용자가 정말 삭제할 것인지 확인
        if (window.confirm("Are you sure you want to delete this journal?")) {
            try {
                // Context의 deleteJournal 함수 호출
                await deleteJournal(journalId, pageDate);
                alert("Journal deleted successfully.");
                // ✅ 삭제 성공 후, 이전 페이지(일기 목록)로 이동시킵니다.
                navigate(-1);
            } catch (error) {
                alert("An error occurred while deleting the journal.");
            }
        }
    };

    // ✅ [추가] 수정 버튼 클릭 핸들러
    const handleEdit = useCallback((journalToEdit) => {
        // ✅ [핵심 추가] 수정 페이지로 이동하기 직전, '수정 후 복귀' 플래그를 남깁니다.
        sessionStorage.setItem('journal-needs-refresh', 'true');

        navigate('/i-log/write', {
            state: {
                journalToEdit: journalToEdit,
                // ✅ [수정] 현재 location이 아닌, 이전 페이지에서 전달받은 backgroundLocation을 다시 전달합니다.
                backgroundLocation: location.state?.backgroundLocation,
            }
        });
    }, [navigate, location.state?.backgroundLocation]);

    // ✅ [수정] 공유 로직을 외부 유틸리티 함수로 대체
    const handleShare = useCallback(() => {
        shareJournal(journal);
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

    // ✅ [수정] 로딩 중이거나 journal 데이터가 없을 때의 UI 처리
    if (isLoading) {
        // 로딩 스피너 컴포넌트를 사용하거나 간단한 텍스트를 보여줍니다.
        return <ViewContainer>Loading...</ViewContainer>;
    }

    if (!journal) { // 로딩이 끝났는데도 데이터가 없으면 에러 메시지 표시
        return <ViewContainer className="no-image"><p>Could not load journal information. Please try again from the
            list.</p>
        </ViewContainer>
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
                                <AuthorName>{journal?.writerNickname || 'User'}</AuthorName>
                            </AuthorInfo>
                            {journal.visibility === "PRIVATE" && <LuBookLock style={{marginRight: '4px'}}/>}
                            {journal.visibility === "FRIENDS_ONLY" && <LuBookUser style={{marginRight: '4px'}}/>}
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
                        <button data-tooltip="share"><BiSolidShareAlt/></button>
                    </SideActionTab>
                    {user?.id === journal.writerId && (
                        <>
                            <SideActionTab type="edit" onClick={() => handleEdit(journal)}>
                                <button data-tooltip="edit"><HiPencilAlt/></button>
                            </SideActionTab>
                            <SideActionTab type="delete"
                                           onClick={() => handleDelete(journal.id, journal.logDate.split('T')[0])}>
                                <button data-tooltip="delete"><MdDeleteForever/></button>
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
                                    <AuthorName>{journal?.writerNickname || 'User'}</AuthorName>
                                </AuthorInfo>
                                {journal.visibility === "PRIVATE" && <LuBookLock style={{marginRight: '4px'}}/>}
                                {journal.visibility === "FRIENDS_ONLY" &&
                                    <LuBookUser style={{marginRight: '4px'}}/>}
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
                    <button data-tooltip="share"><BiSolidShareAlt/></button>
                </SideActionTab>
                {user?.id === journal.writerId && (
                    <>
                        <SideActionTab type="edit" onClick={() => handleEdit(journal)}>
                            <button data-tooltip="edit"><HiPencilAlt/></button>
                        </SideActionTab>
                        <SideActionTab type="delete"
                                       onClick={() => handleDelete(journal.id, journal.logDate.split('T')[0])}>
                            <button data-tooltip="delete"><MdDeleteForever/></button>
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