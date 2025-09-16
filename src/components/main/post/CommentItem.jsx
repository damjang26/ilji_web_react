import React, {useState, useEffect, useRef} from 'react';
import {useNavigate} from 'react-router-dom';
import {FaThumbsUp, FaRegThumbsUp} from 'react-icons/fa'; // 아이콘 임포트
import {BsThreeDotsVertical} from "react-icons/bs";
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
} from '../../../styled_components/main/post/PostListStyled';
import {formatRelativeTime} from '../../../utils/timeFormatter';

/**
 * 개별 댓글 항목을 렌더링하는 컴포넌트
 * @param {object} comment - 댓글 데이터 객체
 * @param {function} onLike - 좋아요 버튼 클릭 시 호출될 함수
 * @param {function} onLikeCountClick - 좋아요 카운트 클릭 시 호출될 함수
 */
const CommentItem = ({comment, onLike, onLikeCountClick, onDelete}) => {
    const navigate = useNavigate();
    const {user} = useAuth();
    const [isMenuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef(null);

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


    return (
        <CommentItemContainer>
            <CommentAvatar
                src={comment.writer?.profileImage || `https://api.dicebear.com/7.x/miniavs/svg?seed=${comment.writer?.userId}`} // ✅ [수정]
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
                </CommentActions>
            </CommentBody>
            {isAuthor && (
                <CommentMenuContainer ref={menuRef}>
                    <CommentMenuButton onClick={() => setMenuOpen(!isMenuOpen)}>
                        <BsThreeDotsVertical/>
                    </CommentMenuButton>
                    {isMenuOpen && (
                        <CommentDropdownMenu>
                            <CommentDropdownItem onClick={handleDeleteClick}>삭제</CommentDropdownItem>
                        </CommentDropdownMenu>
                    )}
                </CommentMenuContainer>
            )}
        </CommentItemContainer>
    );
};

export default CommentItem;