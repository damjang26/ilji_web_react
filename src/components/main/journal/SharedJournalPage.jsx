import React, {useState, useEffect, useCallback} from 'react';
import {useParams, useNavigate} from 'react-router-dom';
import styled from 'styled-components';
import {Spin, Modal, message} from 'antd';
import {useAuth} from '../../../AuthContext';
import {api, getPostLikers, toggleLike} from '../../../api';

// PostList.jsx에서 JournalItem과 필요한 컴포넌트들을 가져옵니다.
// 실제로는 PostList.jsx에서 JournalItem을 별도 파일로 분리하는 것이 더 좋습니다.
// 여기서는 설명을 위해 PostList.jsx에서 직접 가져온다고 가정합니다.
import {JournalItem} from '../post/PostList';
import PostLikersModal from '../post/PostLikersModal';
import {OriginalImage} from '../../../styled_components/main/post/PostListStyled';

const PageContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: flex-start; /* 위쪽 정렬 */
    min-height: 100vh;
    padding-top: 80px; /* 헤더 높이만큼 여백 */
    background-color: #ffffff;
`;

const ContentWrapper = styled.div`
    width: 100%;
    max-width: 550px; /* JournalItem의 최대 너비와 유사하게 설정 */
`;

const LoadingContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 50vh;
`;

const ErrorContainer = styled.div`
    text-align: center;
    padding: 40px 20px;
    font-size: 1.2rem;
    color: #555;
`;

const SharedJournalPage = () => {
    const {shareId} = useParams();
    const navigate = useNavigate();
    const {user} = useAuth();

    const [journal, setJournal] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // PostList에 있던 모달 관련 상태들을 가져옵니다.
    const [isLikersModalOpen, setLikersModalOpen] = useState(false);
    const [likersList, setLikersList] = useState([]);
    const [isLikersLoading, setIsLikersLoading] = useState(false);
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);
    const [selectedImageUrl, setSelectedImageUrl] = useState('');
    const [isCommentOpen, setIsCommentOpen] = useState(false); // ✅ [추가] 댓글 창 상태

    useEffect(() => {
        const fetchSharedJournal = async () => {
            if (!shareId) return;
            setLoading(true);
            try {
                // ✅ 우리가 설계한 새로운 공유 API 호출
                const response = await api.get(`/api/i-log/share/${shareId}`);
                setJournal(response.data);
            } catch (err) {
                console.error("공유 일기 로딩 실패:", err);
                setError(err.response?.data?.message || "일기를 불러올 수 없습니다.");
            } finally {
                setLoading(false);
            }
        };

        fetchSharedJournal();
    }, [shareId]);

    // PostList에 있던 핸들러 함수들을 이 페이지에 맞게 가져옵니다.
    const handleProfileClick = useCallback((writerId) => {
        if (writerId) navigate(`/mypage/${writerId}`);
    }, [navigate]);

    const handleImageClick = useCallback((imageUrl) => {
        setSelectedImageUrl(imageUrl);
        setIsImageModalOpen(true);
    }, []);

    const handleLikeClick = useCallback(async (postId) => {
        if (!journal) return;
        // 낙관적 업데이트
        setJournal(prev => ({
            ...prev,
            liked: !prev.liked,
            likeCount: prev.liked ? prev.likeCount - 1 : prev.likeCount + 1,
        }));

        try {
            await toggleLike(postId, user?.id);
        } catch (error) {
            console.error("좋아요 처리 중 오류 발생:", error);
            message.error("좋아요 처리에 실패했습니다.");
            // 실패 시 롤백
            setJournal(prev => ({
                ...prev,
                liked: !prev.liked,
                likeCount: prev.liked ? prev.likeCount - 1 : prev.likeCount + 1,
            }));
        }
    }, [journal, user?.id]);

    const handleLikeCountClick = useCallback(async (postId) => {
        if (!postId) return;
        setLikersModalOpen(true);
        setIsLikersLoading(true);
        try {
            const response = await getPostLikers(postId);
            setLikersList(response.data);
        } catch (error) {
            message.error("좋아요 목록을 불러오는 데 실패했습니다.");
            setLikersModalOpen(false);
        } finally {
            setIsLikersLoading(false);
        }
    }, []);

    const handleCommentCountChange = useCallback((postId, changeAmount) => {
        setJournal(prev => prev.id === postId ? {...prev, commentCount: prev.commentCount + changeAmount} : prev);
    }, []);

    // ✅ [추가] 댓글 창을 토글하는 함수
    const toggleCommentView = useCallback((e) => {
        e?.stopPropagation(); // 이벤트 버블링 방지
        setIsCommentOpen(prev => !prev);
    }, []);

    if (loading) {
        return <LoadingContainer><Spin size="large"/></LoadingContainer>;
    }

    if (error) {
        return <ErrorContainer>🚫<br/>{error}</ErrorContainer>;
    }

    if (!journal) {
        return null; // 데이터가 없으면 아무것도 렌더링하지 않음
    }

    return (
        <PageContainer>
            <ContentWrapper>
                {/* ✅ JournalItem 재활용! 필요한 props를 모두 전달합니다. */}
                <JournalItem
                    journal={journal}
                    user={user}
                    handleLikeClick={handleLikeClick}
                    onLikeCountClick={handleLikeCountClick}
                    onProfileClick={handleProfileClick}
                    onImageClick={handleImageClick}
                    onCommentCountChange={(amount) => handleCommentCountChange(journal.id, amount)}
                    // ✅ [수정] 빠져있던 onToggle과 isCommentOpen prop을 전달합니다.
                    onToggle={toggleCommentView}
                    isCommentOpen={isCommentOpen}
                    // 공유 페이지에서는 수정/삭제/무한스크롤 기능이 필요 없으므로 비워두거나 더미 함수를 전달합니다.
                    onDelete={() => {
                    }}
                    handleEdit={() => {
                    }}
                    lastJournalElementRef={null}
                />
            </ContentWrapper>

            <PostLikersModal
                open={isLikersModalOpen}
                onClose={() => setLikersModalOpen(false)}
                users={likersList}
                loading={isLikersLoading}
                onUpdate={() => handleLikeCountClick(journal.id)}
            />

            <Modal
                open={isImageModalOpen}
                onCancel={() => setIsImageModalOpen(false)}
                footer={null}
                centered
                width="auto"
                bodyStyle={{padding: 0, background: 'none'}}
            >
                <OriginalImage src={selectedImageUrl} alt="Original post image"/>
            </Modal>
        </PageContainer>
    );
};

export default SharedJournalPage;