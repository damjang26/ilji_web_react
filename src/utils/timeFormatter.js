/**
 * 날짜/시간 문자열을 "방금 전", "N분 전", "N시간 전", "M월 D일" 형식으로 변환합니다.
 * @param {string} dateString - 변환할 날짜/시간 문자열 (e.g., "2024-08-25T10:00:00")
 * @returns {string} 변환된 상대 시간 문자열
 */
export const formatRelativeTime = (dateString) => {
    const now = new Date();
    const postDate = new Date(dateString);

    const diffInMs = now.getTime() - postDate.getTime();
    const diffInSeconds = Math.floor(diffInMs / 1000);
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);

    if (diffInSeconds < 60) {
        return "방금 전";
    } else if (diffInMinutes < 60) {
        return `${diffInMinutes}분 전`;
    } else if (diffInHours < 24) {
        return `${diffInHours}시간 전`;
    } else {
        // 24시간이 지나면 'M월 D일' 형식으로 표시
        return postDate.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' });
    }
};