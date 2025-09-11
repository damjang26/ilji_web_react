import React, {useCallback, useState, useEffect} from 'react';
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
    ImageGrid,
    ImageWrapper,
    ActionItem,
    EndOfFeed
} from "../../../styled_components/main/post/PostListStyled.jsx";
import {FaRegHeart, FaRegComment, FaRegShareSquare, FaHeart} from "react-icons/fa";
import {useNavigate, useLocation} from "react-router-dom";
import {formatRelativeTime} from '../../../utils/timeFormatter.js';
import {TbNotebook} from "react-icons/tb";
import {useAuth} from "../../../AuthContext.jsx";
import {toggleLike} from "../../../api.js"; // ✅ 중앙 API 파일에서 좋아요 함수 임포트

// 유저 프로필 이미지가 없을 경우를 대비한 기본 이미지
const defaultProfilePic = "https://images.unsplash.com/photo-1511367461989-f85a21fda167?q=80&w=100&auto=format&fit=crop";

const PostList = ({posts, loading, hasMore, lastPostElementRef}) => {
    const {user} = useAuth();
    const [localPosts, setLocalPosts] = useState([]);

    const navigate = useNavigate();
    const location = useLocation();

    // 게시물 클릭 시 상세 페이지로 이동하는 핸들러
    const handlePostClick = useCallback((e, post) => {
        // 이벤트 버블링 방지: 카드 내의 버튼(좋아요 등) 클릭 시에는 이동하지 않음
        if (e.target.closest('button')) {
            return;
        }

        navigate(`/posts/${post.id}`, {
            state: {
                backgroundLocation: location,
                journalData: post
            }
        });
    }, [navigate, location]);

    useEffect(() => {
        // 부모로부터 받은 posts 데이터가 변경될 때마다 localPosts를 업데이트합니다.
        setLocalPosts(posts);
        console.log(posts)
    }, [posts]);

    // ✅ [수정] 좋아요 버튼 클릭 핸들러 (API 연동)
    const handleLikeClick = useCallback(async (postId) => {
        // 1. 낙관적 업데이트: 서버 응답을 기다리지 않고 UI를 즉시 변경합니다.
        setLocalPosts(currentPosts =>
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
            alert("좋아요 처리에 실패했습니다. 다시 시도해주세요.");
            setLocalPosts(currentPosts =>
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
    }, []); // 의존성 배열은 비워두어 최초 렌더링 시에만 함수가 생성되도록 합니다.

    // 초기 로딩 중이거나, 게시글이 아직 하나도 없을 때의 UI를 처리합니다.
    if (posts.length === 0) {
        if (loading) {
            return <div>피드를 불러오는 중...</div>; // 여기에 로딩 스피너 컴포넌트를 넣으면 더 좋습니다.
        }
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

    return (
        <>
            <FeedContainer>
                {localPosts.map((post, index) => {
                    // 마지막 게시글인지 확인하여 ref를 연결합니다.
                    const isLastElement = posts.length === index + 1;

                    return (
                        <PostContainer
                            key={`${post.id}-${index}`}
                            ref={isLastElement ? lastPostElementRef : null}
                            onClick={(e) => handlePostClick(e, post)}
                        >
                            <PostHeader>
                                <ProfileImage
                                    src={post.writerProfileImage || defaultProfilePic}
                                    alt={`${post.writerNickname} profile`}/>
                                <UserInfo>
                                    <span className="username">{post.writerNickname}</span>
                                    <span className="date">{formatRelativeTime(post.createdAt)}</span>
                                </UserInfo>
                            </PostHeader>
                            <PostContent>
                                {post.content.length > 150 ? (
                                    <>
                                        {`${post.content.substring(0, 150)}... `}
                                        <span className="more-text">더보기</span>
                                    </>
                                ) : (
                                    post.content
                                )}
                            </PostContent>

                            {post.images && post.images.length > 0 && (
                                <ImageGrid count={post.images.length}>
                                    {post.images.slice(0, 4).map((imgSrc, imgIndex) => (
                                        <ImageWrapper key={imgIndex} count={post.images.length}>
                                            <img src={imgSrc} alt={`post image ${imgIndex + 1}`}/>
                                        </ImageWrapper>
                                    ))}
                                </ImageGrid>
                            )}
                            <PostActions>
                                <ActionItem>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation(); // 이벤트 버블링 중단
                                            handleLikeClick(post.id);
                                        }}
                                        disabled={post.writerId === user?.id}
                                        aria-label={post.liked ? 'Unlike' : 'Like'}
                                    >
                                        {post.liked + ""}
                                        {post.liked ? <FaHeart color="red"/> : <FaRegHeart/>}
                                    </button>
                                    {post.likeCount > 0 && <span>{post.likeCount}</span>}
                                </ActionItem>
                                <ActionItem>
                                    <button onClick={(e) => e.stopPropagation()}><FaRegComment/></button>
                                    {post.commentCount > 0 && <span>{post.commentCount}</span>}
                                </ActionItem>
                                <ActionItem>
                                    <button onClick={(e) => e.stopPropagation()}><FaRegShareSquare/></button>
                                </ActionItem>
                            </PostActions>
                        </PostContainer>
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
        </>
    );
};

export default PostList;