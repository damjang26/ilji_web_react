import {Route, Routes} from "react-router-dom";
import PostList from "./PostList.jsx";
import {useState} from "react";

const Post = () => {
    const [posts, setPosts] = useState([
        {
            p_no: 1,
            p_user_id: "사용자1",
            p_calendar_id: "캘린더1",
            p_user_picture: "프로필사진",
            p_content: "첫 번째 게시글 내용 첫 번째 게시글 내용 첫 번째 게시글 내용 첫 번째 게시글 내용 첫 번째 게시글 내용 첫 번째 게시글 내용 첫 번째 게시글 내용 첫 번째 게시글 내용 ",
            p_create_date: "2025-03-24",
            p_img: "1이미지"
        },
        {
            p_no: 2,
            p_user_id: "사용자2",
            p_calendar_id: "캘린더2",
            p_user_picture: "프로필사진",
            p_content: "두 번째 게시글 내용 두 번째 게시글 내용 두 번째 게시글 내용 두 번째 게시글 내용 두 번째 게시글 내용 두 번째 게시글 내용 두 번째 게시글 내용 ",
            p_create_date: "2025-03-24",
            p_img: "2이미지"
        },
        {
            p_no: 3,
            p_user_id: "사용자3",
            p_calendar_id: "캘린더3",
            p_user_picture: "프로필사진",
            p_content: "세 번째 게시글 내용 세 번째 게시글 내용 세 번째 게시글 내용 세 번째 게시글 내용 세 번째 게시글 내용 세 번째 게시글 내용 세 번째 게시글 내용 ",
            p_create_date: "2025-03-24",
            p_img: "3이미지"
        },
        {
            p_no: 4,
            p_user_id: "사용자4",
            p_calendar_id: "캘린더4",
            p_user_picture: "프로필사진",
            p_content: "네 번째 게시글 내용 네 번째 게시글 내용 세 번째 게시글 내용 세 번째 게시글 내용 세 번째 게시글 내용 세 번째 게시글 내용 세 번째 게시글 내용 ",
            p_create_date: "2025-03-24",
            p_img: "4이미지"
        }
    ])


    return (<div>
        <Routes>
            <Route path="/" element={<PostList posts={posts}/>}/>
        </Routes>
    </div>);
}

export default Post;