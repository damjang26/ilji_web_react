import axios from "axios";

export const api = axios.create({
    // baseURL: "/", // Vite 프록시를 사용하므로 baseURL은 여기서 설정하지 않아도 됩니다.
    withCredentials: false, // 세션/쿠키 쓰면 true
});

// 1. 요청 인터셉터(Request Interceptor) 설정
api.interceptors.request.use(
    (config) => {
        // 요청을 보내기 전에 수행할 작업
        // localStorage에서 토큰을 가져옵니다.
        const token = localStorage.getItem("token");

        // 토큰이 존재하면 Authorization 헤더를 추가합니다.
        if (token) {
            config.headers["Authorization"] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        // 요청 에러 처리
        return Promise.reject(error);
    }
);

// =================================
// 친구 관련 API
// =================================

/**
 * 내가 팔로우하는 사용자 목록을 조회합니다.
 * @param {number} [userId] - 특정 사용자의 ID. 없으면 로그인한 사용자의 목록을 조회합니다.
 * @returns {Promise<axios.AxiosResponse<any>>}
 */
export const getFollowingList = (userId) => {
    // userId가 있으면 해당 유저의 목록을, 없으면 내 목록을 요청합니다.
    const endpoint = userId
        ? `/api/friends/following/${userId}`
        : "/api/friends/following";
    return api.get(endpoint);
};

/**
 * 나를 팔로우하는 사용자 목록을 조회합니다.
 * @param {number} [userId] - 특정 사용자의 ID. 없으면 로그인한 사용자의 목록을 조회합니다.
 * @returns {Promise<axios.AxiosResponse<any>>}
 */
export const getFollowersList = (userId) => {
    const endpoint = userId
        ? `/api/friends/followers/${userId}`
        : "/api/friends/followers";
    return api.get(endpoint);
};

/**
 * 다른 사용자를 팔로우합니다.
 * @param {number} followingId - 팔로우할 사용자의 ID
 * @returns {Promise<axios.AxiosResponse<any>>}
 */
export const followUser = (followingId) =>
    api.post(`/api/friends/${followingId}`);

/**
 * 다른 사용자를 언팔로우합니다.
 * @param {number} followingId - 언팔로우할 사용자의 ID
 * @returns {Promise<axios.AxiosResponse<any>>}
 */
export const unfollowUser = (followingId) =>
    api.delete(`/api/friends/${followingId}`);

/**
 * 특정 사용자와 나의 친구 관계 상태를 조회합니다.
 * @param {number} userId - 확인할 사용자의 ID
 * @returns {Promise<axios.AxiosResponse<any>>}
 */
export const getFriendStatus = (userId) =>
    api.get(`/api/friends/${userId}/status`);

/**
 * 이메일 또는 닉네임으로 사용자를 검색합니다.
 * @param {string} query - 검색어
 * @returns {Promise<axios.AxiosResponse<any>>}
 */
export const searchUsers = (query) => api.get(`/api/users/search?q=${query}`);


// =================================
// 알림 관련 API (신규 추가)
// =================================

/**
 * 알림 API 전용 axios 인스턴스.
 * [2025-09-15 Gemini] Bearer 토큰 인증을 사용하도록 수정.
 * To Rollback: Replace the 'apiNoti' instance and its interceptor below with the original 'apiNoti' creation code.
 */
export const apiNoti = axios.create({
    baseURL: "/api",
    withCredentials: false, // Changed from true
});

// [2025-09-15 Gemini] Add request interceptor to apiNoti to set Authorization header.
apiNoti.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers["Authorization"] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);
// =================================
// 일기 관련 API
// =================================

/**
 * 소셜 피드 목록을 조회합니다. (페이징)
 * @param {object} params - 요청 파라미터
 * @param {number} params.page - 페이지 번호
 * @param {number} params.size - 페이지 크기
 * @returns {Promise<axios.AxiosResponse<any>>}
 */
export const getFeed = (params) => api.get('/api/i-log/feed', {params});

/**
 * 특정 일기의 공유 ID를 가져오거나 생성합니다.
 * @param {number} journalId - 일기의 ID
 * @returns {Promise<AxiosResponse<any>>} - { shareId: "..." } 형태의 응답을 포함하는 Promise
 */
export const getOrCreateShareId = (journalId) => {
    return api.post(`/api/i-log/${journalId}/share`);
};

/**
 * [신규] 특정 날짜의 내 일기를 조회합니다.
 * @param {string} date - 조회할 날짜 (YYYY-MM-DD 형식)
 * @returns {Promise<axios.AxiosResponse<any>>}
 */
export const getJournalByDate = (date) => api.get(`/api/i-log/date/${date}`);

// =================================
// 좋아요 관련 API
// =================================

/**
 * 특정 일기에 대한 '좋아요'를 토글(추가/삭제)합니다.
 * @param {number} ilogId - 좋아요를 토글할 일기의 ID
 * @returns {Promise<axios.AxiosResponse<any>>}
 */
export const toggleLike = (ilogId, userId) => api.post(`/api/ilogs/${ilogId}/like`, {userId});

/**
 * 특정 일기에 '좋아요'를 누른 사용자 목록을 조회합니다.
 * @param {number} ilogId - 조회할 일기의 ID
 * @returns {Promise<axios.AxiosResponse<any>>}
 */
export const getPostLikers = (ilogId) => api.get(`/api/ilogs/${ilogId}/like`);
/**
 * [추가] 특정 사용자의 모든 일기(i-log)를 조회합니다.
 * @param {number} userId - 조회할 사용자의 ID
 * @returns {Promise<axios.AxiosResponse<any>>}
 */
export const getUserJournals = (userId) => api.get(`/api/i-log/user/${userId}`);

/**
 * [신규] 특정 사용자의 일기 목록을 페이지네이션과 정렬 옵션을 적용하여 조회합니다.
 * @param {object} params - { userId, page, size, sortBy }
 * @returns {Promise<axios.AxiosResponse<any>>}
 */
export const getPagedJournals = (params) => {
    // 예: /api/i-log/user/123?page=0&size=10&sort=logDate,desc
    const {userId, page, size, sortBy} = params;

    let sortQuery;
    switch (sortBy) {
        case 'popular':
            sortQuery = 'likeCount,desc';
            break;
        case 'oldest':
            sortQuery = 'logDate,asc';
            break;
        case 'latest':
        default:
            sortQuery = 'logDate,desc';
            break;
    }

    return api.get(`/api/i-log/user/${userId}`, {
        params: {
            page,
            size,
            sort: sortQuery,
        },
    });
};

/**
 * 특정 사용자가 '좋아요'를 누른 일기 목록을 조회합니다.
 * @param {object} params - 요청 파라미터
 * @param {number} params.userId - 조회할 사용자의 ID
 * @param {string} params.sortBy - 정렬 기준 ('liked_at', 'uploaded_at', 'popular')
 * @param {number} params.page - 페이지 번호
 * @param {number} params.size - 페이지 크기
 * @returns {Promise<axios.AxiosResponse<any>>}
 */
export const getLikedPosts = (params) => api.get('/api/i-log/liked', {params});

// =================================
// 댓글 관련 API
// =================================

/**
 * 특정 일기(i-log)의 댓글 목록을 조회합니다.
 * @param {number} ilogId - 조회할 일기의 ID
 * @param {object} params - 정렬 옵션 등 쿼리 파라미터 (예: { sortBy: 'likes' })
 * @returns {Promise<axios.AxiosResponse<any>>}
 */
export const getComments = (ilogId, params) => api.get(`/api/ilogs/${ilogId}/comments`, {params});

/**
 * 특정 일기(i-log)에 새 댓글을 작성합니다.
 * @param {number} ilogId - 댓글을 작성할 일기의 ID
 * @param {object} data - 댓글 내용 (예: { content: '새 댓글입니다.' })
 * @returns {Promise<axios.AxiosResponse<any>>}
 */
export const addComment = (ilogId, data) => api.post(`/api/ilogs/${ilogId}/comments`, data);

/**
 * 특정 댓글을 삭제합니다.
 * @param {number} commentId - 삭제할 댓글의 ID
 * @returns {Promise<axios.AxiosResponse<any>>}
 */
export const deleteComment = (commentId) => api.delete(`/api/comments/${commentId}`);

// =================================
// 댓글 좋아요 관련 API
// =================================

/**
 * 특정 댓글에 대한 '좋아요'를 토글(추가/삭제)합니다.
 * @param {number} commentId - 좋아요를 토글할 댓글의 ID
 * @returns {Promise<axios.AxiosResponse<any>>}
 */
export const toggleCommentLike = (commentId) => api.post(`/api/comments/${commentId}/like`);

/**
 * 특정 댓글에 '좋아요'를 누른 사용자 목록을 조회합니다.
 * @param {number} commentId - 조회할 댓글의 ID
 * @returns {Promise<axios.AxiosResponse<any>>}
 */
export const getCommentLikers = (commentId) => api.get(`/api/comments/${commentId}/like`);

// =================================
// 채팅 관련 API
// =================================

/**
 * 채팅방을 나갑니다.
 * @param {string} roomId - 나갈 채팅방의 ID
 * @returns {Promise<axios.AxiosResponse<any>>}
 */
export const leaveChatRoom = (roomId) => {
    return api.post(`/api/chat/${roomId}/leave`);
};

export const createChatRoom = (roomName, userIds) => {
    return api.post("/api/chat/create", {roomName, userIds});
};

// =================================
// AI 관련 API
// =================================

/**
 * 사용자의 채팅 메시지를 백엔드로 보내 AI 태그 추천을 요청하는 함수
 * @param {string} userMessage - 사용자가 입력한 채팅 메시지
 * @returns {Promise<string|null>} - 추천 태그 문자열 또는 null (무시해야 할 경우)
 */
export const getAiTagSuggestion = async (userMessage) => {
    // 메시지가 너무 짧으면 API 호출 자체를 생략 (비용 절약)
    if (!userMessage || userMessage.trim().length < 5) {
        return null;
    }

    try {
        const response = await api.post('/ai', {prompt: userMessage});

        // 응답 본문이 비어있지 않다면 (추천 태그가 있다면) 태그를 반환
        if (response.data) {
            console.log('AI 추천 태그:', response.data);
            return response.data;
        } else {
            // 응답 본문이 비어있다면 (AI가 'IGNORE'한 경우)
            console.log('AI가 일상 대화로 판단하여 무시했습니다.');
            return null;
        }
    } catch (error) {
        console.error('AI 태그 추천 API 호출 중 오류 발생:', error);
        // 2xx가 아닌 상태 코드(5xx 등)는 axios에서 에러로 처리됩니다.
        return null;
    }
};