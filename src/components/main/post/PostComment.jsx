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
    const [isLikersLoading, setIsLikersLoading] = useState(false);
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

    // ✅ [수정] 대댓글 작성을 위해 parentId 파라미터를 받도록 수정
    const handleCommentSubmit = useCallback(async (content, parentId = null) => {
        if (!content) return;

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
            isLiked: false,
            likeCount: 0,
            replies: [],
        };

        // 1. 낙관적 업데이트: UI에 새 댓글을 즉시 추가
        if (parentId) {
            // 답글인 경우: 부모 댓글의 replies 배열에 추가
            setComments(prev => prev.map(c =>
                c.commentId === parentId
                    ? {...c, replies: [newCommentObj, ...(c.replies || [])]}
                    : c
            ));
        } else {
            // 최상위 댓글인 경우: 댓글 목록의 맨 앞에 추가
            setComments(prev => [newCommentObj, ...prev]);
            setNewComment(''); // 최상위 댓글 입력창만 비우기
        }

        try {
            // 2. 서버에 API 요청 (✅ parent_comment_id를 명확하게 전달)
            const response = await addComment(journal.id, {
                content,
                parentCommentId: parentId,
            });
            // 3. 서버 응답으로 받은 실제 데이터로 교체
            const realComment = response.data;
            // ✅ [수정] API 호출 성공 후 댓글 개수 업데이트
            // [안전장치] onCommentCountChange가 함수일 때만 호출합니다.
            if (typeof onCommentCountChange === 'function') {
                onCommentCountChange(1);
            }
            // 임시 댓글(tempId)을 서버에서 받은 실제 댓글(realComment)로 교체
            setComments(prev => prev.map(c => {
                if (c.commentId === parentId) { // 대댓글의 부모를 찾아서
                    return {...c, replies: c.replies.map(r => r.commentId === tempId ? realComment : r)};
                }
                if (c.commentId === tempId) { // 최상위 댓글을 찾아서
                    return realComment;
                }
                return c;
            }));
        } catch (error) {
            console.error("댓글 등록에 실패했습니다.", error);
            message.error("댓글 등록에 실패했습니다.");
            // 4. 실패 시 롤백: 추가했던 임시 댓글을 제거
            setComments(prev => prev
                .map(c => ({...c, replies: c.replies?.filter(r => r.commentId !== tempId)})) // 답글 롤백
                .filter(c => c.commentId !== tempId)); // 최상위 댓글 롤백
        }
    }, [journal.id, user, onCommentCountChange]); // newComment 의존성 제거

    const handleCommentLike = useCallback(async (commentId) => {
        // ✅ [추가] 댓글 트리(답글 포함)를 순회하며 특정 댓글을 업데이트하는 헬퍼 함수
        const updateCommentInTree = (comments, targetId, updateFn) => {
            return comments.map(comment => {
                if (comment.commentId === targetId) {
                    return updateFn(comment);
                }
                if (comment.replies && comment.replies.length > 0) {
                    return {...comment, replies: updateCommentInTree(comment.replies, targetId, updateFn)};
                }
                return comment;
            });
        };

        // 1. 낙관적 업데이트
        setComments(currentComments => updateCommentInTree(currentComments, commentId, (c) => {
            const newIsLiked = !c.isLiked;
            const newLikeCount = newIsLiked ? (c.likeCount || 0) + 1 : (c.likeCount || 0) - 1;
            return {...c, isLiked: newIsLiked, likeCount: newLikeCount};
        }));

        try {
            // 2. API 요청
            await toggleCommentLike(commentId);
        } catch (error) {
            console.error("댓글 좋아요 처리에 실패했습니다.", error);
            message.error("좋아요 처리에 실패했습니다.");
            // 3. 실패 시 롤백
            setComments(currentComments => updateCommentInTree(currentComments, commentId, (c) => {
                // isLiked 상태를 다시 반전시켜 원래대로 되돌립니다.
                const originalIsLiked = !c.isLiked;
                const originalLikeCount = originalIsLiked ? (c.likeCount || 0) + 1 : (c.likeCount || 0) - 1;
                return {...c, isLiked: originalIsLiked, likeCount: originalLikeCount};
            }));
        }
    }, []);

    const handleDeleteComment = useCallback(async (commentId) => {
        // ✅ [추가] 댓글 트리(답글 포함)를 순회하며 특정 댓글을 제거하는 헬퍼 함수
        const removeCommentFromTree = (comments, targetId) => {
            // 최상위 댓글에서 제거
            const filtered = comments.filter(c => c.commentId !== targetId);
            if (filtered.length !== comments.length) return filtered;

            // 답글에서 재귀적으로 제거
            return comments.map(c => {
                if (c.replies && c.replies.length > 0) {
                    return {...c, replies: removeCommentFromTree(c.replies, targetId)};
                }
                return c;
            });
        };

        // 1. 낙관적 업데이트: UI에서 댓글을 즉시 제거
        const originalComments = comments;
        setComments(currentComments => removeCommentFromTree(currentComments, commentId));
        // [안전장치] onCommentCountChange가 함수일 때만 호출합니다.
        if (typeof onCommentCountChange === 'function') {
            onCommentCountChange(-1); // -1을 전달하여 댓글이 삭제되었음을 알림
        }

        try {
            // 2. API 요청
            await deleteComment(commentId);
            message.success("댓글이 삭제되었습니다.");
        } catch (error) {
            console.error("댓글 삭제에 실패했습니다.", error);
            message.error("댓글 삭제에 실패했습니다.");
            // 3. 실패 시 롤백
            setComments(originalComments);
            // [안전장치] onCommentCountChange가 함수일 때만 호출합니다.
            if (typeof onCommentCountChange === 'function') {
                onCommentCountChange(1); // +1을 전달하여 롤백을 알림
            }
        }
    }, [comments, onCommentCountChange]);

    // --- 좋아요 목록 관련 함수 ---
    const handleLikeCountClick = useCallback(async (commentId) => {
        if (!commentId) return;
        setCurrentCommentId(commentId);
        setLikersModalOpen(true);
        setIsLikersLoading(true);

        try {
            const response = await getCommentLikers(commentId);
            setLikersList(response.data);
        } catch (error) {
            console.error("좋아요 목록을 불러오는 데 실패했습니다.", error);
            message.error("좋아요 목록을 불러오는 데 실패했습니다.");
            setLikersModalOpen(false);
        } finally {
            setIsLikersLoading(false);
        }
    }, []);

    // 모달 내에서 팔로우/언팔로우 액션 후 목록을 새로고침하는 함수
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
                                            onClick={() => setCommentSortBy('likes')}>Popular</PostSortOption>
                            <PostSortOption active={commentSortBy === 'recent'}
                                            onClick={() => setCommentSortBy('recent')}>New</PostSortOption>
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
                                        onSubmitReply={handleCommentSubmit} // ✅ [추가] 답글 제출 함수 전달
                                    />
                                ))
                                : <EmptyComment>💬 No comments yet. <br/>
                                    Be the first to leave one!</EmptyComment>}
                        </PostCommentList>
                    )}
                    <PostCommentInputContainer>
                        <ProfileImg
                            src={user?.picture || 'https://api.dicebear.com/7.x/miniavs/svg'}
                            alt="내 프로필"
                            referrerPolicy="no-referrer"
                        />
                        <PostCommentForm onSubmit={(e) => {
                            e.preventDefault();
                            handleCommentSubmit(newComment.trim());
                        }}>
                            <input type="text" placeholder="Add a comment..." value={newComment}
                                   onChange={(e) => setNewComment(e.target.value)}/>
                            <button type="submit" disabled={!newComment.trim()}><TbMessageCirclePlus/></button>
                        </PostCommentForm>
                    </PostCommentInputContainer>

                    <PostLikersModal
                        open={isLikersModalOpen}
                        onClose={() => setLikersModalOpen(false)}
                        users={likersList}
                        loading={isLikersLoading}
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