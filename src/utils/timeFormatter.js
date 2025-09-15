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

    // ✅ [수정] 영어권 표현으로 변경 및 단/복수 처리
    if (diffInSeconds < 60) {
        return "Just now";
    } else if (diffInMinutes < 60) {
        return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    } else if (diffInHours < 24) {
        return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else {
        // 24시간이 지나면 'Month Day' 형식으로 표시 (예: August 25)
        return postDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
    }
};