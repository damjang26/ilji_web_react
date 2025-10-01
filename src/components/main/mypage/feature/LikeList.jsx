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
    const [initialLoadDone, setInitialLoadDone] = useState(false);


    // [수정] fetchPosts가 signal을 인자로 받도록 변경합니다.
    const fetchPosts = useCallback(async (isNewSort, signal) => {
        if (loading) return;
        setLoading(true);

        const currentPage = isNewSort ? 0 : page;

        try {
            // [수정] API 호출 시 signal을 전달합니다.
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
            // [수정] 요청이 취소된 경우(AbortError)는 정상적인 동작이므로 에러를 출력하지 않습니다.
            if (error.name !== 'AbortError' && error.name !== 'CanceledError') {
                console.error("Failed to load the list of diaries you liked.", error);
                message.error("Failed to load list.");
            }
        } finally {
            setLoading(false);
        }
    }, [userId, sortBy, page, loading]);

    // 정렬 기준이 변경되면, 페이지를 0으로 초기화하고 데이터를 새로 불러옵니다.
    useEffect(() => {
        // [핵심 수정] 요청 취소를 위한 AbortController를 생성합니다.
        const controller = new AbortController();

        setPosts([]);
        setPage(0);
        setHasMore(true);
        // [핵심 수정] fetchPosts 호출 시 controller의 signal을 전달합니다.
        fetchPosts(true, controller.signal).then(() => setInitialLoadDone(true));

        // [핵심 수정] 클린업 함수: 컴포넌트가 사라지거나, 정렬 기준이 다시 바뀌면 이전 요청을 취소합니다.
        return () => {
            controller.abort();
        };
    }, [sortBy, userId]); // fetchPosts를 의존성에서 제외하여 무한 루프 가능성을 차단합니다.

    // 사용자가 마지막 요소를 보고 있고, 더 불러올 데이터가 있으면 다음 페이지를 불러옵니다.
    useEffect(() => {
        if (inView && hasMore && !loading && initialLoadDone) {
            fetchPosts(false);
        }
    }, [inView, hasMore, loading, fetchPosts, initialLoadDone]);

    // ✅ [추가] 'journal:updated' 전역 이벤트를 감지하여, 목록의 해당 항목을 즉시 업데이트합니다.
    // 이렇게 하면 전체 목록을 다시 불러오는 API 호출 없이도 수정된 내용이 바로 반영됩니다.
    useEffect(() => {
        const handleJournalUpdate = (event) => {
            const {updatedJournal} = event.detail;
            if (updatedJournal) {
                setPosts(prevPosts =>
                    prevPosts.map(p =>
                        p.id === updatedJournal.id ? updatedJournal : p
                    )
                );
            }
        };

        window.addEventListener('journal:updated', handleJournalUpdate);
        return () => window.removeEventListener('journal:updated', handleJournalUpdate);
    }, []); // 의존성 배열이 비어있으므로, 컴포넌트가 마운트될 때 한 번만 리스너를 등록합니다.

    return (
        <div>
            <SortOptionsContainer>
                <SortButton $active={sortBy === 'liked_at'} onClick={() => setSortBy('liked_at')}>Newest
                    Likes</SortButton>
                <SortButton $active={sortBy === 'uploaded_at'}
                            onClick={() => setSortBy('uploaded_at')}>Newest upload</SortButton>
                <SortButton $active={sortBy === 'popular'} onClick={() => setSortBy('popular')}>Popular</SortButton>
            </SortOptionsContainer>

            {/* ✅ [수정] prop 이름을 journals -> posts로 변경하고, 필요한 모든 props 전달 */}
            <PostList
                posts={posts}
                setPosts={setPosts}
                loading={loading}
                hasMore={hasMore}
                lastPostElementRef={ref}
            />

            {/*{loading && <div style={{textAlign: 'center', padding: '20px'}}><Spin/></div>}*/}
            {/*/!* 무한 스크롤을 위한 감지 요소 *!/*/}
            {/*{!loading && hasMore && <div ref={ref} style={{height: '20px'}}/>}*/}

        </div>
    );
};

export default LikeList;