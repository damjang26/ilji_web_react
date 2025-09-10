import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { message } from 'antd';
import { api } from '../api';
import { useAuth } from '../AuthContext';

const TagContext = createContext();

export const useTags = () => {
  return useContext(TagContext);
};

export const TagProvider = ({ children }) => {
  const { user } = useAuth();
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(false);

  // 내 태그만 불러오는 함수
  const fetchMyTags = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const response = await api.get('/api/tags');
      // 내 태그에는 owner 정보 추가
      const myTagsWithOwner = response.data.map(tag => ({ ...tag, owner: { userId: user.id, name: user.name } }));
      // 친구 태그는 유지하고 내 태그만 업데이트
      setTags(prevTags => [
        ...prevTags.filter(tag => tag.owner.userId !== user.id),
        ...myTagsWithOwner,
      ]);
    } catch (error) {
      console.error("Failed to fetch my tags:", error);
      message.error('내 태그 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchMyTags();
    } else {
      setTags([]);
    }
  }, [user, fetchMyTags]);

  const addTag = async (newTagPayload) => {
    try {
      await api.post('/api/tags', newTagPayload);
      fetchMyTags(); // 내 태그 다시 불러오기
      message.success('새로운 태그가 추가되었습니다.');
    } catch (error) {
      console.error("Failed to create tag:", error);
      const errorMessage = error.response?.data?.message || '태그 생성에 실패했습니다.';
      message.error(errorMessage);
      throw error;
    }
  };

  const deleteTag = async (tagIdToDelete) => {
    try {
      await api.delete(`/api/tags/${tagIdToDelete}`);
      fetchMyTags(); // 내 태그 다시 불러오기
      message.success('태그가 삭제되었습니다.');
    } catch (error) {
      console.error("Failed to delete tag:", error);
      message.error('태그 삭제에 실패했습니다.');
    }
  };

  const updateTag = async (tagId, payload) => {
    try {
      await api.put(`/api/tags/${tagId}`, payload);
      fetchMyTags(); // 내 태그 다시 불러오기
      message.success('태그가 성공적으로 수정되었습니다.');
    } catch (error) {
      console.error("Failed to update tag:", error);
      const errorMessage = error.response?.data?.message || '태그 수정에 실패했습니다.';
      message.error(errorMessage);
      throw error;
    }
  };

  // 친구 태그 추가 함수
  const addFriendTags = async (friend) => {
    console.log('[DEBUG] Fetching tags for friend:', friend); // 디버깅 로그 추가
    try {
      const response = await api.get(`/api/tags?userId=${friend.userId}`);
      console.log('[DEBUG] Received friend tags:', response.data); // 디버깅 로그 추가
      const friendTagsWithOwner = response.data.map(tag => ({ ...tag, owner: { userId: friend.userId, name: friend.name } }));
      setTags(prevTags => [...prevTags, ...friendTagsWithOwner]);
    } catch (error) {
      console.error(`Failed to fetch tags for ${friend.name}:`, error);
      message.error(`${friend.name}님의 태그를 불러오는데 실패했습니다.`);
    }
  };

  // 친구 태그 제거 함수
  const removeFriendTags = (friendId) => {
    setTags(prevTags => prevTags.filter(tag => tag.owner.userId !== friendId));
  };

  const value = {
    tags,
    loading,
    fetchTags: fetchMyTags, // 기존 fetchTags는 이제 내 태그만 불러옴
    addTag,
    deleteTag,
    updateTag, // 추가
    addFriendTags,
    removeFriendTags,
  };

  return <TagContext.Provider value={value}>{children}</TagContext.Provider>;
};
