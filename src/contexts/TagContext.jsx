import React, {createContext, useState, useEffect, useContext, useCallback, useMemo} from 'react';
import {message} from 'antd';
import {api} from '../api';
import {useAuth} from '../AuthContext';

const TagContext = createContext();

export const NO_TAG_ID = 'no-tag';

export const useTags = () => {
    return useContext(TagContext);
};

export const TagProvider = ({children}) => {
    const {user} = useAuth();
    const [tags, setTags] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchMyTags = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        try {
            const response = await api.get('/api/tags');
            const myTagsWithOwner = response.data.map(tag => ({...tag, owner: {userId: user.id, name: user.name}}));
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
            fetchMyTags();
            message.success('새로운 태그가 추가되었습니다.');
        } catch (error) {
            console.error("Failed to create tag:", error);
            const errorMessage = error.response?.data?.message || '태그 생성에 실패했습니다.';
            message.error(errorMessage);
            throw error;
        }
    };

    const deleteTag = async (tagIdToDelete) => {
        if (tagIdToDelete === NO_TAG_ID) {
            message.error(`'태그 없음' 태그는 삭제할 수 없습니다.`);
            return;
        }
        const tagToDelete = tags.find(tag => tag.id === tagIdToDelete);
        if (tagToDelete && tagToDelete.owner.userId !== user.id) {
            message.error('자신이 생성한 태그만 삭제할 수 있습니다.');
            return;
        }
        try {
            await api.delete(`/api/tags/${tagIdToDelete}`);
            fetchMyTags();
            message.success('태그가 삭제되었습니다.');
        } catch (error) {
            console.error("Failed to delete tag:", error);
            message.error('태그 삭제에 실패했습니다.');
        }
    };

    const updateTag = async (tagId, payload) => {
        if (tagId === NO_TAG_ID) {
            message.error(`'태그 없음' 태그는 수정할 수 없습니다.`);
            return;
        }
        const tagToUpdate = tags.find(tag => tag.id === tagId);
        if (tagToUpdate && tagToUpdate.owner.userId !== user.id) {
            message.error('자신이 생성한 태그만 수정할 수 있습니다.');
            return;
        }
        try {
            await api.put(`/api/tags/${tagId}`, payload);
            fetchMyTags();
            message.success('태그가 성공적으로 수정되었습니다.');
        } catch (error) {
            console.error("Failed to update tag:", error);
            const errorMessage = error.response?.data?.message || '태그 수정에 실패했습니다.';
            message.error(errorMessage);
            throw error;
        }
    };

    const addFriendTags = async (friend) => {
        try {
            const response = await api.get(`/api/tags?userId=${friend.userId}`);
            const friendTagsWithOwner = response.data.map(tag => ({
                ...tag,
                owner: {userId: friend.userId, name: friend.name}
            }));
            setTags(prevTags => [...prevTags, ...friendTagsWithOwner]);
        } catch (error) {
            console.error(`Failed to fetch tags for ${friend.name}:`, error);
            message.error(`${friend.name}님의 태그를 불러오는데 실패했습니다.`);
        }
    };

    const removeFriendTags = (friendId) => {
        setTags(prevTags => prevTags.filter(tag => tag.owner.userId !== friendId));
    };

    const value = useMemo(() => {
        const NO_TAG = {
            id: NO_TAG_ID,
            label: 'No Tags', // name -> label로 수정
            owner: {userId: user?.id, name: user?.name || 'System'}
        };

        return {
            tags: [NO_TAG, ...tags],
            loading,
            fetchTags: fetchMyTags,
            addTag,
            deleteTag,
            updateTag,
            addFriendTags,
            removeFriendTags,
            NO_TAG_ID
        }
    }, [tags, loading, user, fetchMyTags, addTag, deleteTag, updateTag, addFriendTags, removeFriendTags]);

    return <TagContext.Provider value={value}>{children}</TagContext.Provider>;
};
