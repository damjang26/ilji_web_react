import {Route, Routes} from "react-router-dom";
import PostList from "./PostList.jsx";
import {useCallback, useEffect, useState} from "react";
import {useAuth} from "../../../AuthContext.jsx";
import {getFeed} from "../../../api.js"; // ✅ [개선] 중앙 API 함수 사용
import {useInView} from 'react-intersection-observer'; // ✅ [핵심] useInView 훅 임포트

const Post = () => {
    const [posts, setPosts] = useState([])
    const [page, setPage] = useState(0);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);  // 더 불러올 데이터가 있는지 여부
    const {user} = useAuth();

    // ✅ [핵심] useInView 훅으로 IntersectionObserver 로직 대체
    const {ref, inView} = useInView({
        threshold: 0, // 요소가 1px이라도 보이면 inView는 true가 됨
    });

    const fetchPosts = useCallback(async (fetchPage) => {
        // 로딩 중이거나, 더 불러올 데이터가 없거나, 사용자가 없으면 중단
        if (loading || !user) return;
        setLoading(true);

        try {
            const response = await getFeed({page: fetchPage, size: 10});
            const data = response.data;
            console.log("데이터", data); // 디버깅 후 주석 처리 또는 삭제

            // ✅ [개선] 중복 데이터 처리 로직 개선
            setPosts(prevPosts => {
                const postMap = new Map();
                // 기존 게시물을 Map에 추가
                // 첫 페이지 로딩 시에는 기존 게시물이 없음
                if (fetchPage > 0) {
                    prevPosts.forEach(post => postMap.set(post.id, post));
                }
                // 새로운 게시물을 Map에 추가 (중복되면 덮어씀)
                data.content.forEach(post => postMap.set(post.id, post));
                // Map의 값들을 배열로 변환하여 반환
                return Array.from(postMap.values());
            });

            setHasMore(!data.last);
        } catch (error) {
            console.error(`피드 로딩 실패 (페이지: ${fetchPage}):`, error);
        } finally {
            setLoading(false);
        }
    }, [user, loading]);

    useEffect(() => {
        // 사용자가 변경되면(로그인/로그아웃) 모든 상태를 초기화합니다.
        setPosts([]);
        setPage(0);
        setHasMore(true);
    }, [user]);

    // ✅ [추가] 첫 페이지(page=0) 데이터를 로드하는 로직
    useEffect(() => {
        if (user) {
            setPage(0); // 페이지 상태를 0으로 설정하여 로딩 시작
            fetchPosts(0); // 첫 페이지 데이터 로드
        }
    }, [user]); // 사용자가 바뀔 때만 실행

    // ✅ [수정] 무한 스크롤은 page > 0 일 때만 동작하도록 수정
    useEffect(() => {
        // 사용자가 있고, 감지 요소가 보이며, 더 불러올 데이터가 있고, 로딩 중이 아닐 때
        if (inView && hasMore && !loading) {
            const nextPage = page + 1;
            setPage(nextPage);
            fetchPosts(nextPage);
        }
    }, [inView, hasMore, loading]);

    return (<div>
        <Routes>
            <Route path="/" element={<PostList posts={posts} setPosts={setPosts} loading={loading} hasMore={hasMore}
                                               lastPostElementRef={ref}/>}/>
        </Routes>
    </div>);
}

export default Post;