import {Route, Routes} from "react-router-dom";
import PostList from "./PostList.jsx";
import {useCallback, useEffect, useRef, useState} from "react";
import {useAuth} from "../../../AuthContext.jsx";
import {api} from "../../../api.js";

const Post = () => {
    const [posts, setPosts] = useState([])
    const [page, setPage] = useState(0);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);  // 더 불러올 데이터가 있는지 여부
    const {user} = useAuth();

    const fetchPosts = useCallback(async () => {
        if (!user) {
            setPosts([]);
            return;
        }
        if (loading || !hasMore) return; // 로딩 중이거나 더 이상 데이터가 없으면 중단
        setLoading(true);

        const currentPage = page;

        try {
            const response = await api.get(`/api/i-log/feed?page=${currentPage}&size=10`);
            const data = response.data;
            // console.log("데이터 : ", data);

            setPosts(prevPosts => [...prevPosts, ...data.content]);
            setPage(prevPage => prevPage + 1);
            setHasMore(!data.last);
        } catch (error) {
            console.error(`피드 로딩 실패 (페이지: ${currentPage}):`, error);
        }
        setLoading(false);
    }, [user, loading, hasMore, page]); // 'page'를 다시 추가하여 currentPage를 참조하도록 합니다.

    // Intersection Observer를 위한 로직 (스크롤이 바닥에 닿았는지 감지)
    const observer = useRef();
    const lastPostElementRef = useCallback(node => {
        if (loading) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                fetchPosts(); // 화면에 보이면 다음 페이지 로드
            }
        });
        if (node) observer.current.observe(node);
    }, [loading, hasMore, fetchPosts]);

    useEffect(() => {
        setPosts([]);
        setPage(0);
        setHasMore(true);
    }, [user]);

    // 2. 'page' 상태가 0으로 초기화되면, 첫 페이지 데이터를 불러옵니다.
    useEffect(() => {
        if (user && page === 0 && hasMore) {
            fetchPosts();
        }
    }, [user, page, hasMore, fetchPosts]); // fetchPosts를 의존성에 추가하여 최신 함수를 사용하도록 보장합니다.

    return (<div>
        <Routes>
            <Route path="/" element={<PostList posts={posts} loading={loading} hasMore={hasMore}
                                               lastPostElementRef={lastPostElementRef}/>}/>
        </Routes>
    </div>);
}

export default Post;