import React, {useState, useEffect, useCallback} from 'react';
import {useParams} from 'react-router-dom';
import {getLikedPosts} from '../../../../api';
import PostList from '../../post/PostList';
import {Spin, message} from 'antd';
import {useInView} from 'react-intersection-observer';
import {SortOptionsContainer, SortButton} from '../../../../styled_components/main/mypage/MyPageStyled';

const LikeList = () => {
    const {userId} = useParams(); // URL에서 userId를 가져옵니다.
    const [posts, setPosts] = useState([]);
    const [sortBy, setSortBy] = useState('liked_at'); // 기본 정렬: 좋아요 누른 순
    const [page, setPage] = useState(0);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [ref, inView] = useInView({
        threshold: 0,
    });

    const fetchPosts = useCallback(async (isNewSort) => {
        if (loading) return;
        setLoading(true);

        const currentPage = isNewSort ? 0 : page;

        try {
            const response = await getLikedPosts({
                userId: userId,
                sortBy: sortBy,
                page: currentPage,
                size: 10
            });

            const newPosts = response.data.content;
            setPosts(prev => isNewSort ? newPosts : [...prev, ...newPosts]);
            setHasMore(!response.data.last);
            if (!response.data.last) {
                setPage(currentPage + 1);
            }
        } catch (error) {
            console.error("좋아요 누른 일기 목록을 불러오는 데 실패했습니다.", error);
            message.error("목록을 불러오는 데 실패했습니다.");
        } finally {
            setLoading(false);
        }
    }, [userId, sortBy, page, loading]);

    // 정렬 기준이 변경되면, 페이지를 0으로 초기화하고 데이터를 새로 불러옵니다.
    useEffect(() => {
        setPosts([]);
        setPage(0);
        setHasMore(true);
        fetchPosts(true);
    }, [sortBy, userId]);

    // 사용자가 마지막 요소를 보고 있고, 더 불러올 데이터가 있으면 다음 페이지를 불러옵니다.
    useEffect(() => {
        if (inView && hasMore && !loading) {
            fetchPosts(false);
        }
    }, [inView, hasMore, loading, fetchPosts]);

    return (
        <div>
            <SortOptionsContainer>
                <SortButton $active={sortBy === 'liked_at'} onClick={() => setSortBy('liked_at')}>좋아요 누른 순</SortButton>
                <SortButton $active={sortBy === 'uploaded_at'} onClick={() => setSortBy('uploaded_at')}>일기 작성
                    순</SortButton>
                <SortButton $active={sortBy === 'popular'} onClick={() => setSortBy('popular')}>인기 순</SortButton>
            </SortOptionsContainer>

            {/* ✅ [수정] prop 이름을 journals -> posts로 변경하고, 필요한 모든 props 전달 */}
            <PostList
                posts={posts}
                setPosts={setPosts}
                loading={loading}
                hasMore={hasMore}
                lastPostElementRef={ref}
            />

            {loading && <div style={{textAlign: 'center', padding: '20px'}}><Spin/></div>}
            {/* 무한 스크롤을 위한 감지 요소 */}
            {!loading && hasMore && <div ref={ref} style={{height: '20px'}}/>}
        </div>
    );
};

export default LikeList;