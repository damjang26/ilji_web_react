import React, {useState, useCallback, useEffect} from 'react';
import {useAuth} from "../../../AuthContext.jsx";
import {TbMessageCirclePlus} from "react-icons/tb";
import {addComment, getComments, toggleCommentLike, getCommentLikers, deleteComment} from "../../../api.js"; // API 함수 임포트
import {message, Spin} from "antd"; // antd 컴포넌트 임포트
import CommentItem from "./CommentItem.jsx"; // ✅ [추가] 댓글 아이템 컴포넌트 임포트
import PostLikersModal from "./PostLikersModal.jsx"; // ✅ [추가] 좋아요 목록 모달 임포트
import {
    PostCommentContainer,
    PostCommentContentWrapper,
    PostCommentHeader,
    PostCommentTitleContainer,
    PostCommentTitle,
    PostSortOption,
    PostHideButton,
    PostCommentList,
    PostCommentInputContainer,
    ProfileImg,
    PostCommentForm,
    EmptyComment
} from "../../../styled_components/main/post/PostListStyled.jsx";

/**
 * JournalList(피드)에서 사용되는 댓글 섹션 컴포넌트.
 * @param {object} journal - 댓글이 달릴 일기(포스트) 데이터.
 *   * @param {boolean} isOpen - 댓글 창의 열림/닫힘 상태.
 * @param {function} onToggle - 댓글 창의 상태를 토글하는 함수.
 * @param {function} onCommentCountChange - 댓글 개수 변경 시 부모에게 알리는 함수
 */
const PostComment = ({journal, isOpen, onToggle, onCommentCountChange}) => {
    const {user} = useAuth();
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [commentSortBy, setCommentSortBy] = useState('likes');
    const [loading, setLoading] = useState(false);

    // --- 좋아요 목록 모달 관련 상태 ---
    const [isLikersModalOpen, setLikersModalOpen] = useState(false);
    const [likersList, setLikersList] = useState([]);
    const [currentCommentId, setCurrentCommentId] = useState(null);
    // --------------------------------

    // 댓글 창이 열리거나 정렬 순서가 바뀔 때 댓글 목록을 불러옵니다.
    useEffect(() => {
        if (isOpen) {
            const fetchComments = async () => {
                setLoading(true);
                try {
                    const response = await getComments(journal.id, {sortBy: commentSortBy});
                    setComments(response.data);
                } catch (error) {
                    console.error("댓글을 불러오는 데 실패했습니다.", error);
                    message.error("댓글을 불러오는 데 실패했습니다.");
                } finally {
                    setLoading(false);
                }
            };
            fetchComments();
        }
    }, [isOpen, journal.id, commentSortBy]);

    const handleCommentSubmit = useCallback(async (e) => {
        e.preventDefault();
        const content = newComment.trim();
        if (!content) return;

        // 1. 낙관적 업데이트: 서버 응답을 기다리지 않고 UI에 새 댓글을 즉시 추가
        const tempId = Date.now(); // 임시 key로 사용
        const newCommentObj = {
            commentId: tempId,
            content: content,
            writer: {
                userId: user.id,
                nickname: user.nickname,
                profileImage: user.picture,
            },
            createdAt: new Date().toISOString(),
            isLiked: false, // ✅ [핵심] '좋아요' 상태 초기값 설정
            likeCount: 0,   // ✅ [핵심] '좋아요' 개수 초기값 설정
            replies: [],
        };
        setComments(prev => [newCommentObj, ...prev]);
        setNewComment(''); // 입력창 비우기
        // ✅ [개선] 함수형 업데이트로 안정성 향상
        onCommentCountChange(prevCount => prevCount + 1);

        try {
            // 2. 서버에 API 요청
            const response = await addComment(journal.id, {content});
            // 3. 서버 응답으로 받은 실제 데이터로 교체
            setComments(prev => prev.map(c => c.commentId === tempId ? response.data : c));
        } catch (error) {
            console.error("댓글 등록에 실패했습니다.", error);
            message.error("댓글 등록에 실패했습니다.");
            // 4. 실패 시 롤백
            setComments(prev => prev.filter(c => c.commentId !== tempId));
            onCommentCountChange(prevCount => prevCount - 1);
        }
    }, [newComment, journal.id, user, onCommentCountChange]); // 의존성 배열 최적화

    const handleCommentLike = useCallback(async (commentId) => {
        // 1. 낙관적 업데이트
        setComments(currentComments =>
            currentComments.map(c => {
                if (c.commentId === commentId) {
                    const newIsLiked = !c.isLiked;
                    const newLikeCount = newIsLiked ? (c.likeCount || 0) + 1 : (c.likeCount || 0) - 1;
                    return {...c, isLiked: newIsLiked, likeCount: newLikeCount};
                }
                return c;
            })
        );

        try {
            // 2. API 요청
            await toggleCommentLike(commentId);
        } catch (error) {
            console.error("댓글 좋아요 처리에 실패했습니다.", error);
            message.error("좋아요 처리에 실패했습니다.");
            // 3. 실패 시 롤백
            setComments(currentComments =>
                currentComments.map(c => {
                    if (c.commentId === commentId) {
                        const originalIsLiked = !c.isLiked;
                        const originalLikeCount = originalIsLiked ? (c.likeCount || 0) + 1 : (c.likeCount || 0) - 1;
                        return {...c, isLiked: originalIsLiked, likeCount: originalLikeCount};
                    }
                    return c;
                })
            );
        }
    }, []);

    const handleDeleteComment = useCallback(async (commentId) => {
        // 1. 낙관적 업데이트: UI에서 댓글을 즉시 제거
        const originalComments = comments;
        setComments(currentComments => currentComments.filter(c => c.commentId !== commentId));
        onCommentCountChange(prevCount => prevCount - 1); // 댓글 수 감소

        try {
            // 2. API 요청
            await deleteComment(commentId);
            message.success("댓글이 삭제되었습니다.");
        } catch (error) {
            console.error("댓글 삭제에 실패했습니다.", error);
            message.error("댓글 삭제에 실패했습니다.");
            // 3. 실패 시 롤백
            setComments(originalComments);
            onCommentCountChange(prevCount => prevCount + 1); // 댓글 수 원상 복구
        }
    }, [comments, onCommentCountChange]);

    // --- 좋아요 목록 관련 함수 ---
    const handleLikeCountClick = useCallback(async (commentId) => {
        if (!commentId) return;
        setCurrentCommentId(commentId);
        try {
            const response = await getCommentLikers(commentId);
            setLikersList(response.data);
            setLikersModalOpen(true);
        } catch (error) {
            console.error("좋아요 목록을 불러오는 데 실패했습니다.", error);
            message.error("좋아요 목록을 불러오는 데 실패했습니다.");
        }
    }, []);

    const refreshLikersList = useCallback(() => {
        if (currentCommentId) {
            handleLikeCountClick(currentCommentId);
        }
    }, [currentCommentId, handleLikeCountClick]);
    // ---------------------------

    return (
        <PostCommentContainer isOpen={isOpen}
                              onClick={!isOpen ? onToggle : undefined}>
            {isOpen ? (
                <PostCommentContentWrapper>
                    <PostCommentHeader>
                        <PostCommentTitleContainer>
                            <PostCommentTitle>comments({journal.commentCount || comments.length})</PostCommentTitle>
                            <PostSortOption active={commentSortBy === 'likes'}
                                            onClick={() => setCommentSortBy('likes')}>인기순</PostSortOption>
                            <PostSortOption active={commentSortBy === 'recent'}
                                            onClick={() => setCommentSortBy('recent')}>최신순</PostSortOption>
                        </PostCommentTitleContainer>
                        <PostHideButton onClick={onToggle}>Hide</PostHideButton>
                    </PostCommentHeader>
                    {loading ? (
                        <div style={{textAlign: 'center', padding: '20px'}}><Spin/></div>
                    ) : (
                        <PostCommentList>
                            {comments.length > 0 ?
                                comments.map(comment => (
                                    <CommentItem
                                        key={comment.commentId}
                                        comment={comment}
                                        onLike={handleCommentLike}
                                        onLikeCountClick={handleLikeCountClick}
                                        onDelete={handleDeleteComment}
                                    />
                                ))
                                : <EmptyComment>아직 댓글이 없습니다. 첫 댓글을 남겨보세요!</EmptyComment>}
                        </PostCommentList>
                    )}
                    <PostCommentInputContainer>
                        <ProfileImg
                            src={user?.picture || 'https://api.dicebear.com/7.x/miniavs/svg'}
                            alt="내 프로필"
                            referrerPolicy="no-referrer"
                        />
                        <PostCommentForm onSubmit={handleCommentSubmit}>
                            <input type="text" placeholder="Add a comment..." value={newComment}
                                   onChange={(e) => setNewComment(e.target.value)}/>
                            <button type="submit" disabled={!newComment.trim()}><TbMessageCirclePlus/></button>
                        </PostCommentForm>
                    </PostCommentInputContainer>

                    <PostLikersModal
                        open={isLikersModalOpen}
                        onClose={() => setLikersModalOpen(false)}
                        users={likersList}
                        onUpdate={refreshLikersList}
                        title="댓글을 좋아한 사람"
                    />
                </PostCommentContentWrapper>
            ) : (
                <span>Comments ({journal.commentCount || 0})</span>
            )}
        </PostCommentContainer>
    );
};

export default PostComment;