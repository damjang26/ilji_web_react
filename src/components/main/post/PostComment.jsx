import React, {useState, useCallback} from 'react';
import {useAuth} from "../../../AuthContext.jsx";
import {TbMessageCirclePlus} from "react-icons/tb";
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
    PostCommentForm
} from "../../../styled_components/main/post/PostListStyled.jsx";

/**
 * JournalList(피드)에서 사용되는 댓글 섹션 컴포넌트.
 * @param {object} journal - 댓글이 달릴 일기(포스트) 데이터.
 *   * @param {boolean} isOpen - 댓글 창의 열림/닫힘 상태.
 *   * @param {function} onToggle - 댓글 창의 상태를 토글하는 함수.
 */
const PostComment = ({journal, isOpen, onToggle}) => {
    const {user} = useAuth();
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [commentSortBy, setCommentSortBy] = useState('likes');

    const handleCommentSubmit = useCallback((e) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        console.log('새 댓글:', newComment);
        // TODO: API 호출 로직 추가
        setNewComment('');
    }, [newComment]);

    return (
        <PostCommentContainer isOpen={isOpen}
                              onClick={!isOpen ? onToggle : undefined}>
            {isOpen ? (
                <PostCommentContentWrapper>
                    <PostCommentHeader>
                        <PostCommentTitleContainer>
                            <PostCommentTitle>comments({comments.length})</PostCommentTitle>
                            <PostSortOption active={commentSortBy === 'likes'}
                                            onClick={() => setCommentSortBy('likes')}>인기순</PostSortOption>
                            <PostSortOption active={commentSortBy === 'recent'}
                                            onClick={() => setCommentSortBy('recent')}>최신순</PostSortOption>
                        </PostCommentTitleContainer>
                        <PostHideButton onClick={onToggle}>Hide</PostHideButton>
                    </PostCommentHeader>
                    <PostCommentList>
                        {comments.length > 0 ?
                            comments.map(comment => <div
                                key={comment.commentId}>{comment.content}</div>)
                            : <p>아직 댓글이 없습니다.</p>}
                    </PostCommentList>
                    <PostCommentInputContainer>
                        <ProfileImg
                            src={user?.profileImage || 'https://via.placeholder.com/40'}
                            alt="내 프로필"
                            referrerPolicy="no-referrer"
                        />
                        <PostCommentForm onSubmit={handleCommentSubmit}>
                            <input type="text" placeholder="Add a comment..." value={newComment}
                                   onChange={(e) => setNewComment(e.target.value)}/>
                            <button type="submit" disabled={!newComment.trim()}><TbMessageCirclePlus/></button>
                        </PostCommentForm>
                    </PostCommentInputContainer>
                </PostCommentContentWrapper>
            ) : (
                <span>Comments ({journal.commentCount || 0})</span>
            )}
        </PostCommentContainer>
    );
};

export default PostComment;