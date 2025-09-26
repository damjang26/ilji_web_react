import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';
import { useAuth } from '../AuthContext';
import { followUser, unfollowUser } from '../api';

/**
 * 사용자 관련 액션(팔로우, 언팔로우, 프로필 이동)을 처리하는 커스텀 훅입니다.
 * @param {function} [onActionComplete] - 팔로우/언팔로우 액션이 성공적으로 완료된 후 실행될 콜백 함수. (예: 목록 새로고침)
 * @returns {{handleFollow: function, handleUnfollow: function, handleProfileClick: function}}
 */
export const useUserActions = (onActionComplete) => {
    const navigate = useNavigate();
    const { fetchMyFollowing } = useAuth();

    /**
     * 사용자를 팔로우하는 함수
     */
    const handleFollow = useCallback(async (targetUserId) => {
        try {
            await followUser(targetUserId);
            message.success("Followed successfully.");
            await fetchMyFollowing(); // 내 팔로잉 목록 갱신
            onActionComplete?.(); // 콜백 함수가 있으면 실행
        } catch (error) {
            console.error("Follow failed:", error);
            message.error("Failed to follow.");
        }
    }, [fetchMyFollowing, onActionComplete]);

    /**
     * 사용자를 언팔로우하는 함수
     */
    const handleUnfollow = useCallback(async (targetUserId) => {
        try {
            await unfollowUser(targetUserId);
            message.success("Unfollowed successfully.");
            await fetchMyFollowing(); // 내 팔로잉 목록 갱신
            onActionComplete?.(); // 콜백 함수가 있으면 실행
        } catch (error) {
            console.error("Unfollow failed:", error);
            message.error("Failed to unfollow.");
        }
    }, [fetchMyFollowing, onActionComplete]);

    /**
     * 사용자 프로필 페이지로 이동하는 함수
     * @param {number} userId - 이동할 사용자의 ID
     * @param {function} [onBeforeNavigate] - 페이지 이동 전에 실행할 함수 (예: 모달 닫기)
     */
    const handleProfileClick = useCallback((userId, onBeforeNavigate) => {
        onBeforeNavigate?.();
        navigate(`/mypage/${userId}`);
    }, [navigate]);

    return { handleFollow, handleUnfollow, handleProfileClick };
};