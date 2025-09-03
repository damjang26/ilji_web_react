import axios from "axios";

export const api = axios.create({
    // baseURL: "/", // Vite 프록시를 사용하므로 baseURL은 여기서 설정하지 않아도 됩니다.
    withCredentials: false,           // 세션/쿠키 쓰면 true
});

// 1. 요청 인터셉터(Request Interceptor) 설정
api.interceptors.request.use(
    (config) => {
        // 요청을 보내기 전에 수행할 작업
        // localStorage에서 토큰을 가져옵니다.
        const token = localStorage.getItem('token');

        // 토큰이 존재하면 Authorization 헤더를 추가합니다.
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        // 요청 에러 처리
        return Promise.reject(error);
    }
);