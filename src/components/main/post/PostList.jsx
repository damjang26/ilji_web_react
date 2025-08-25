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

const PostList = ({posts}) => {
    // 게시글이 없거나 배열이 아닐 경우를 안전하게 처리합니다.
    if (!posts || posts.length === 0) return <div>게시글이 없습니다.</div>;

    return (
        <>
            <h1>Journal List</h1>
            <FeedContainer>
                {posts.map((post) => (
                    // key는 반복되는 최상위 요소에 있어야 합니다.
                    <PostContainer key={post.p_no}>
                        <PostHeader>
                            {/* post 객체에 유저 사진이 있으면 그걸 쓰고, 없으면 기본 사진을 사용합니다. */}
                            <ProfileImage
                                src={post.p_user_picture || defaultProfilePic}
                                alt={`${post.p_user_id} profile`}/>
                            <UserInfo>
                                <span className="username">{post.p_user_id}</span>
                                {/* 날짜 형식을 보기 좋게 변경합니다. */}
                                <span className="date">{new Date(post.p_create_date).toLocaleDateString()}</span>
                            </UserInfo>
                        </PostHeader>

                        {/* 이미지가 있을 경우에만 이미지 태그를 보여줍니다. */}
                        {post.p_img && <PostImage src={post.p_img} alt="Post image"/>}

                        <PostContent>{post.p_content}</PostContent>

                        <PostActions>
                            <button><FaRegHeart/></button>
                            <button><FaRegComment/></button>
                            <button><FaRegShareSquare/></button>
                        </PostActions>
                    </PostContainer>
                ))}
            </FeedContainer>
        </>
    );
};

export default PostList;