import {
    FeedContainer,
    PostActions,
    PostContainer,
    PostContent,
    PostHeader,
    PostImage,
    ProfileImage,
    UserInfo
} from "../../../styled_components/main/post/PostListStyled.jsx";
import {FaRegHeart, FaRegComment, FaRegShareSquare} from "react-icons/fa";

// 유저 프로필 이미지가 없을 경우를 대비한 기본 이미지
const defaultProfilePic = "https://images.unsplash.com/photo-1511367461989-f85a21fda167?q=80&w=100&auto=format&fit=crop";

const PostList = ({posts, loading, hasMore, lastPostElementRef}) => {

    // 초기 로딩 중이거나, 게시글이 아직 하나도 없을 때의 UI를 처리합니다.
    if (posts.length === 0) {
        if (loading) {
            return <div>피드를 불러오는 중...</div>; // 여기에 로딩 스피너 컴포넌트를 넣으면 더 좋습니다.
        }
        return <div>표시할 일기가 없습니다. 친구를 팔로우 해보세요!</div>;
    }

    return (
        <>
            <h1>Journal List</h1>
            <FeedContainer>
                {posts.map((post, index) => {
                    // 마지막 게시글인지 확인하여 ref를 연결합니다.
                    const isLastElement = posts.length === index + 1;
                    // 백엔드에서 받은 이미지 배열의 첫 번째 이미지를 사용합니다.
                    const postImage = post.images && post.images.length > 0 ? post.images[0] : null;

                    return (
                        <PostContainer key={post.id} ref={isLastElement ? lastPostElementRef : null}>
                            <PostHeader>
                                <ProfileImage
                                    src={post.writerProfileImage || defaultProfilePic}
                                    alt={`${post.writerNickname} profile`}/>
                                <UserInfo>
                                    <span className="username">{post.writerNickname}</span>
                                    {/* 날짜 형식을 보기 좋게 변경합니다. */}
                                    <span className="date">{new Date(post.createdAt).toLocaleDateString()}</span>
                                </UserInfo>
                            </PostHeader>

                            {/* 이미지가 있을 경우에만 이미지 태그를 보여줍니다. */}
                            {postImage && <PostImage src={postImage} alt="Post image"/>}

                            <PostContent>{post.content}</PostContent>

                            <PostActions>
                                <button><FaRegHeart/></button>
                                <button><FaRegComment/></button>
                                <button><FaRegShareSquare/></button>
                            </PostActions>
                        </PostContainer>
                    );
                })}
                {/* 데이터 로딩 중일 때 스피너를 보여줍니다. */}
                {loading && <div>로딩 중...</div>}
                {/* 더 이상 불러올 데이터가 없을 때 메시지를 보여줍니다. */}
                {!loading && !hasMore && <div>더 이상 불러올 일기가 없습니다.</div>}
            </FeedContainer>
        </>
    );
};

export default PostList;