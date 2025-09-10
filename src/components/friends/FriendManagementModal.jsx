import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Modal, Tabs, List, Avatar, Button, message, Input } from "antd";
import {
  getFollowingList,
  getFollowersList,
  followUser,
  unfollowUser,
  searchUsers,
} from "../../api";
import { useDebounce } from "../../hooks/useDebounce";

const { TabPane } = Tabs;
const { Search } = Input;

const FriendManagementModal = ({ open, onClose, initialTab = "following" }) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [following, setFollowing] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [loading, setLoading] = useState(false);

  // 검색 관련 상태
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const fetchFollowing = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getFollowingList();
      setFollowing(response.data);
    } catch (error) {
      message.error("팔로잉 목록을 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchFollowers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getFollowersList();
      setFollowers(response.data);
    } catch (error) {
      message.error("팔로워 목록을 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      setActiveTab(initialTab);
      if (initialTab === "following") {
        fetchFollowing();
        fetchFollowers(); // 버튼 상태를 위해 둘 다 호출
      } else {
        fetchFollowers();
        fetchFollowing(); // 버튼 상태를 위해 둘 다 호출
      }
    }
  }, [open, initialTab, fetchFollowing, fetchFollowers]);

  const handleTabChange = (key) => {
    setActiveTab(key);
    if (key === "following") {
      fetchFollowing();
    } else if (key === "followers") {
      fetchFollowers();
    }
  };

  useEffect(() => {
    if (debouncedSearchQuery) {
      const performSearch = async () => {
        setIsSearching(true);
        try {
          const response = await searchUsers(debouncedSearchQuery);
          setSearchResults(response.data);
        } catch (error) {
          message.error("사용자 검색에 실패했습니다.");
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
      if (action === "follow") {
        await followUser(targetUser.userId);
        message.success(`${targetUser.name}님을 팔로우 했습니다.`);
      } else {
        await unfollowUser(targetUser.userId);
        message.success(`${targetUser.name}님을 언팔로우 했습니다.`);
      }
      // 목록 새로고침
      fetchFollowing();
      fetchFollowers();
    } catch (error) {
      message.error("요청에 실패했습니다.");
    }
  };

  const handleProfileClick = (userId) => {
    onClose(); // 모달을 닫습니다.
    navigate(`/mypage/${userId}`); // 해당 유저의 마이페이지로 이동합니다.
  };

  const renderUserList = (users, type) => (
    // const renderUserList = (users) => (
    <List
      loading={loading || isSearching}
      itemLayout="horizontal"
      dataSource={users}
      renderItem={(user) => {
        const isFollowing = following.some((f) => f.userId === user.userId);
        return (
          <List.Item
            actions={[
              <Button
                key={`button-${user.userId}`}
                onClick={() =>
                  handleFollowUnfollow(
                    user,
                    isFollowing ? "unfollow" : "follow"
                  )
                }
              >
                {isFollowing ? "언팔로우" : "팔로우"}
              </Button>,
            ]}
          >
            <List.Item.Meta
              // 프로필 영역을 클릭 가능하게 만듭니다.
              style={{ cursor: "pointer" }}
              onClick={() => handleProfileClick(user.userId)}
              avatar={<Avatar src={user.picture} />} // antd Avatar 컴포넌트 사용
              title={user.name} // antd List.Item.Meta의 title prop 사용
            />
          </List.Item>
        );
      }}
    />
  );

  const items = [
    {
      key: "following",
      label: "팔로잉",
      children: renderUserList(following),
    },
    {
      key: "followers",
      label: "팔로워",
      children: renderUserList(followers),
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
        renderUserList(searchResults)
      ) : (
        <Tabs activeKey={activeTab} onChange={handleTabChange} items={items} />
      )}
    </Modal>
  );
};

export default FriendManagementModal;
