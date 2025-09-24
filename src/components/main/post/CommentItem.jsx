import React, {useState, useEffect, useRef, useCallback} from 'react';
import {useNavigate} from 'react-router-dom';
import {FaThumbsUp, FaRegThumbsUp} from 'react-icons/fa'; // 아이콘 임포트
import {BsThreeDotsVertical} from "react-icons/bs";
import {TbMessageCirclePlus} from "react-icons/tb";
import {useAuth} from '../../../AuthContext';
import {
    CommentItemContainer,
    CommentAvatar,
    CommentBody,
    CommentHeader,
    CommentAuthor,
    CommentTimestamp,
    CommentText,
    CommentActions,
    CommentActionButton,
    CommentLikeCount,
    CommentMenuContainer,
    CommentMenuButton,
    CommentDropdownMenu,
    CommentDropdownItem,
    CommentItemWrapper,
    ReplyToggleContainer,
    ReplyToggleButton, ReplyInputContainer,
    PostCommentForm
} from '../../../styled_components/main/post/PostListStyled';
import {formatRelativeTime} from '../../../utils/timeFormatter';

/**
 * 개별 댓글 항목을 렌더링하는 컴포넌트
 * @param {object} comment - 댓글 데이터 객체
 * @param {boolean} isReply - 이 댓글이 대댓글인지 여부
 * @param {function} onLike - 좋아요 버튼 클릭 시 호출될 함수
 * @param {function} onLikeCountClick - 좋아요 카운트 클릭 시 호출될 함수
 * @param {function} onDelete - 삭제 버튼 클릭 시 호출될 함수
 * @param {function} onSubmitReply - 답글 제출 시 호출될 함수
 */
const CommentItem = ({comment, isReply = false, onLike, onLikeCountClick, onDelete, onSubmitReply}) => {
    const navigate = useNavigate();
    const {user} = useAuth();
    const [isMenuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef(null);
    const [isReplyFormOpen, setReplyFormOpen] = useState(false);
    const [replyContent, setReplyContent] = useState('');
    // ✅ [추가] 답글 목록을 보여줄지 여부를 관리하는 상태
    const [showReplies, setShowReplies] = useState(false);

    const isAuthor = user?.id === comment.writer?.userId;

    // 메뉴 외부 클릭 시 닫기
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleProfileClick = () => {
        if (comment.writer?.userId) { // ✅ [수정] writer 객체 내부의 userId 사용
            navigate(`/mypage/${comment.writer.userId}`);
        }
    };

    const handleDeleteClick = () => {
        if (window.confirm("정말로 이 댓글을 삭제하시겠습니까?")) {
            onDelete(comment.commentId);
        }
        setMenuOpen(false);
    };

    const handleReplySubmit = useCallback((e) => {
        e.preventDefault();
        const content = replyContent.trim();
        if (content) {
            onSubmitReply(content, comment.commentId);
            setReplyContent(''); // 입력창 비우기
            setReplyFormOpen(false); // 폼 닫기
            setShowReplies(true); // ✅ [추가] 답글 작성 후 자동으로 답글 목록 펼치기
        }
    }, [replyContent, comment.commentId, onSubmitReply]);


    return (
        <CommentItemWrapper isReply={isReply}>
            <CommentItemContainer>
                <CommentAvatar
                    src={comment.writer?.profileImage || `https://api.dicebear.com/7.x/miniavs/svg?seed=${comment.writer?.userId}`}
                    alt={`${comment.writer?.nickname} 프로필`}
                    onClick={handleProfileClick}
                />
                <CommentBody>
                    <CommentHeader>
                        <CommentAuthor onClick={handleProfileClick}>{comment.writer?.nickname}</CommentAuthor>
                        <CommentTimestamp>{formatRelativeTime(comment.createdAt)}</CommentTimestamp>
                    </CommentHeader>
                    <CommentText>{comment.content}</CommentText>
                    <CommentActions>
                        <CommentActionButton onClick={() => onLike(comment.commentId)}>
                            {comment.isLiked ? <FaThumbsUp color="#0a66c2"/> : <FaRegThumbsUp/>}
                        </CommentActionButton>
                        {comment.likeCount > 0 && (
                            <CommentLikeCount
                                onClick={() => onLikeCountClick(comment.commentId)}>{comment.likeCount}</CommentLikeCount>
                        )}
                        {!isReply && (
                            <CommentActionButton onClick={() => setReplyFormOpen(prev => !prev)}>
                                reply
                            </CommentActionButton>
                        )}
                    </CommentActions>
                </CommentBody>
                {isAuthor && (
                    <CommentMenuContainer ref={menuRef}>
                        <CommentMenuButton onClick={() => setMenuOpen(!isMenuOpen)}>
                            <BsThreeDotsVertical/>
                        </CommentMenuButton>
                        {isMenuOpen && (
                            <CommentDropdownMenu>
                                <CommentDropdownItem onClick={handleDeleteClick}>delete</CommentDropdownItem>
                            </CommentDropdownMenu>
                        )}
                    </CommentMenuContainer>
                )}
            </CommentItemContainer>

            {/* 답글 입력 폼 */}
            {isReplyFormOpen && (
                <ReplyInputContainer>
                    <CommentAvatar
                        src={user?.picture || `https://api.dicebear.com/7.x/miniavs/svg?seed=${user?.id}`}
                        alt="내 프로필"
                    />
                    <PostCommentForm onSubmit={handleReplySubmit}>
                        <input
                            type="text"
                            placeholder={`${comment.writer.nickname}님에게 답글 남기기...`}
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            autoFocus
                        />
                        <button type="submit" disabled={!replyContent.trim()}><TbMessageCirclePlus/></button>
                    </PostCommentForm>
                </ReplyInputContainer>
            )}

            {/* ✅ [수정] 답글(대댓글) 렌더링 로직 변경 */}
            {comment.replies && comment.replies.length > 0 && (
                <>
                    <ReplyToggleContainer>
                        <ReplyToggleButton onClick={() => setShowReplies(prev => !prev)}>
                            <span className="line"></span>
                            {showReplies ? 'Hide replies' : `View replies (${comment.replies.length})`}
                        </ReplyToggleButton>
                    </ReplyToggleContainer>

                    {showReplies && (
                        <div className="replies-section">
                            {comment.replies.map(reply => (
                                <CommentItem
                                    key={reply.commentId}
                                    comment={reply}
                                    isReply={true}
                                    onLike={onLike}
                                    onLikeCountClick={onLikeCountClick}
                                    onDelete={onDelete}
                                    onSubmitReply={onSubmitReply}
                                />
                            ))}
                        </div>
                    )}
                </>
            )}
        </CommentItemWrapper>
    );
};

export default CommentItem;