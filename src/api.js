import axios from "axios";

export const api = axios.create({
    baseURL: "http://localhost:8090", // 백엔드 주소
    withCredentials: false,           // 세션/쿠키 쓰면 true
});