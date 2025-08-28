import React, { createContext, useState, useEffect, useContext } from 'react';
import { message } from 'antd'; // message 컴포넌트 import
import { api } from '../api';

const TagContext = createContext();

export const useTags = () => {
  return useContext(TagContext);
};

export const TagProvider = ({ children }) => {
  const [tags, setTags] = useState([]);

  const fetchTags = async () => {
    try {
      const response = await api.get('/api/tags');
      setTags(response.data);
    } catch (error) {
      console.error("Failed to fetch tags:", error);
      message.error('태그 목록을 불러오는데 실패했습니다.');
    }
  };



  const addTag = async (newTagPayload) => {
    try {
      console.log('Sending to backend:', newTagPayload); // 데이터 확인용 로그
      await api.post('/api/tags', newTagPayload);
      fetchTags();
      message.success('새로운 태그가 추가되었습니다.'); // 성공 메시지 추가
    } catch (error) {
      console.error("Failed to create tag:", error);
      // 서버에서 보낸 에러 메시지가 있다면 그것을 사용하고, 없다면 일반적인 메시지를 띄웁니다.
      const errorMessage = error.response?.data?.message || '이미 존재하는 태그이거나, 잘못된 요청입니다.';
      message.error(errorMessage);
      throw error;
    }
  };

  const deleteTag = async (tagIdToDelete) => {
    try {
      await api.delete(`/api/tags/${tagIdToDelete}`);
      fetchTags();
      message.success('태그가 삭제되었습니다.'); // 성공 메시지 추가
    } catch (error) {
      console.error("Failed to delete tag:", error);
      message.error('태그 삭제에 실패했습니다.');
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  const value = {
    tags,
    fetchTags,
    addTag,
    deleteTag,
  };

  return <TagContext.Provider value={value}>{children}</TagContext.Provider>;
};
