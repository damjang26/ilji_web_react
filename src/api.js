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
/**
 * [추가] 특정 사용자의 모든 일기(i-log)를 조회합니다.
 * @param {number} userId - 조회할 사용자의 ID
 * @returns {Promise<axios.AxiosResponse<any>>}
 */
export const getUserJournals = (userId) => api.get(`/api/i-log/user/${userId}`);
