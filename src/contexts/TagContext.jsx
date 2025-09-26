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
            message.error('Failed to load my tags.');
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
            message.success('New tag added successfully.');
        } catch (error) {
            console.error("Failed to create tag:", error);
            const errorMessage = error.response?.data?.message || 'Failed to create tag.';
            message.error(errorMessage);
            throw error;
        }
    };

    const deleteTag = async (tagIdToDelete) => {
        if (tagIdToDelete === NO_TAG_ID) {
            message.error(`The 'No Tags' tag cannot be deleted.`);
            return;
        }
        const tagToDelete = tags.find(tag => tag.id === tagIdToDelete);
        if (tagToDelete && tagToDelete.owner.userId !== user.id) {
            message.error('You can only delete tags you created.');
            return;
        }
        try {
            await api.delete(`/api/tags/${tagIdToDelete}`);
            fetchMyTags();
            message.success('Tag deleted successfully.');
        } catch (error) {
            console.error("Failed to delete tag:", error);
            message.error('Failed to delete tag.');
        }
    };

    const updateTag = async (tagId, payload) => {
        const tagToUpdate = tags.find(tag => tag.id === tagId);
        if (tagId === NO_TAG_ID) {
            message.error(`The 'No Tags' tag cannot be updated.`);
            return;
        }
        if (tagToUpdate && tagToUpdate.owner.userId !== user.id) {
            message.error('You can only update tags you created.');
            return;
        }
        try {
            await api.put(`/api/tags/${tagId}`, payload);
            fetchMyTags();
            message.success('Tag updated successfully.');
        } catch (error) {
            console.error("Failed to update tag:", error);
            const errorMessage = error.response?.data?.message || 'Failed to update tag.';
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
            message.error(`Failed to load tags for ${friend.name}.`);
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
