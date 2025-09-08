import React, { useState, useEffect, useCallback } from 'react';
import { Modal, Tabs, List, Avatar, Button, message, Input } from 'antd';
import { getFollowingList, getFollowersList, followUser, unfollowUser, searchUsers } from '../../api';
import { useDebounce } from '../../hooks/useDebounce';

const { Search } = Input;

const FriendManagementModal = ({ open, onClose }) => {
  const [activeTab, setActiveTab] = useState('following');
  const [following, setFollowing] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [loading, setLoading] = useState(false);

  // 검색 관련 상태
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const fetchFollowing = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getFollowingList();
      setFollowing(response.data);
    } catch (error) {
      message.error('팔로잉 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchFollowers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getFollowersList();
      setFollowers(response.data);
    } catch (error) {
      message.error('팔로워 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      fetchFollowing();
      fetchFollowers();
    }
  }, [open, fetchFollowing, fetchFollowers]);

  useEffect(() => {
    if (debouncedSearchQuery) {
      const performSearch = async () => {
        setIsSearching(true);
        try {
          const response = await searchUsers(debouncedSearchQuery);
          setSearchResults(response.data);
        } catch (error) {
          message.error('사용자 검색에 실패했습니다.');
        } finally {
          setIsSearching(false);
        }
      };
      performSearch();
    } else {
      setSearchResults([]);
    }
  }, [debouncedSearchQuery]);

  const handleFollowUnfollow = async (targetUser, action) => {
    try {
      if (action === 'follow') {
        await followUser(targetUser.userId);
        message.success(`${targetUser.name}님을 팔로우 했습니다.`);
      } else {
        await unfollowUser(targetUser.userId);
        message.success(`${targetUser.name}님을 언팔로우 했습니다.`);
      }
      fetchFollowing();
    } catch (error) {
      message.error('요청에 실패했습니다.');
    }
  };

  const renderUserList = (users, type) => (
    <List
      loading={loading || (type === 'search' && isSearching)}
      itemLayout="horizontal"
      dataSource={users}
      renderItem={(user) => {
        const isFollowing = following.some(f => f.userId === user.userId);
        return (
          <List.Item
            actions={[
              <Button
                key={`button-${user.userId}`}
                onClick={() => handleFollowUnfollow(user, isFollowing ? 'unfollow' : 'follow')}
              >
                {isFollowing ? '언팔로우' : '팔로우'}
              </Button>
            ]}
          >
            <List.Item.Meta
              avatar={<Avatar src={user.picture} />}
              title={user.name}
            />
          </List.Item>
        );
      }}
    />
  );

  const tabItems = [
    {
      key: 'following',
      label: '팔로잉',
      children: renderUserList(following, 'following'),
    },
    {
      key: 'followers',
      label: '팔로워',
      children: renderUserList(followers, 'followers'),
    },
  ];

  return (
    <Modal
      title="친구 관리"
      open={open}
      onCancel={onClose}
      footer={null}
      width={400}
    >
      <Search
        placeholder="이메일 또는 닉네임으로 검색"
        onChange={(e) => setSearchQuery(e.target.value)}
        style={{ marginBottom: 20 }}
        loading={isSearching}
      />
      {searchQuery ? (
        renderUserList(searchResults, 'search')
      ) : (
        <Tabs defaultActiveKey="following" items={tabItems} onChange={setActiveTab} />
      )}
    </Modal>
  );
};

export default FriendManagementModal;
