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
import { useAuth } from "../../AuthContext";
import { useDebounce } from "../../hooks/useDebounce";

const { TabPane } = Tabs;
const { Search } = Input;

export default function FriendManagementModal({ open, onClose, initialTab }) {
    const navigate = useNavigate();
    const { user: loggedInUser, following: myFollowing, fetchMyFollowing } = useAuth();

    const [activeTab, setActiveTab] = useState(initialTab);
    const [followingList, setFollowingList] = useState([]);
    const [followerList, setFollowerList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    const fetchLists = useCallback(async () => {
        setLoading(true);
        try {
            const [followingRes, followersRes] = await Promise.all([
                getFollowingList(),
                getFollowersList(),
            ]);
            setFollowingList(followingRes.data);
            setFollowerList(followersRes.data);
        } catch (error) {
            console.error("Failed to fetch friend lists:", error);
            message.error("목록을 불러오는 데 실패했습니다.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (open) {
            fetchLists();
            fetchMyFollowing();
        }
    }, [open, fetchLists, fetchMyFollowing]);

    useEffect(() => {
        setActiveTab(initialTab);
    }, [initialTab]);

    useEffect(() => {
        if (debouncedSearchTerm) {
            const performSearch = async () => {
                setIsSearching(true);
                try {
                    const response = await searchUsers(debouncedSearchTerm);
                    setSearchResults(response.data);
                } catch (error) {
                    console.error("Search failed:", error);
                    message.error("사용자 검색에 실패했습니다.");
                } finally {
                    setIsSearching(false);
                }
            };
            performSearch();
        } else {
            setSearchResults([]);
        }
    }, [debouncedSearchTerm]);

    const handleFollow = async (targetUserId) => {
        try {
            await followUser(targetUserId);
            message.success("팔로우했습니다.");
            fetchLists();
            fetchMyFollowing();
        } catch (error) {
            console.error("Follow failed:", error);
            message.error("팔로우에 실패했습니다.");
        }
    };

    const handleUnfollow = async (targetUserId) => {
        try {
            await unfollowUser(targetUserId);
            message.success("언팔로우했습니다.");
            fetchLists();
            fetchMyFollowing();
        } catch (error) {
            console.error("Unfollow failed:", error);
            message.error("언팔로우에 실패했습니다.");
        }
    };

    const handleProfileClick = (userId) => {
        onClose(); // 모달을 닫는 함수 호출
        navigate(`/mypage/${userId}`);
    };

    const renderUserList = (users) => (
        <List
            loading={loading || isSearching}
            itemLayout="horizontal"
            dataSource={users}
            renderItem={(item) => {
                const isFollowing = myFollowing.some((f) => f.userId === item.userId);

                if (loggedInUser && item.userId === loggedInUser.id) {
                    return (
                        <List.Item>
                            <List.Item.Meta
                                avatar={<Avatar src={item.picture || `https://api.dicebear.com/7.x/miniavs/svg?seed=${item.userId}`} />}
                                title={<a onClick={() => handleProfileClick(item.userId)}>{item.name} (나)</a>}
                                description={item.email}
                            />
                        </List.Item>
                    );
                }

                return (
                    <List.Item
                        actions={[
                            isFollowing ? (
                                <Button onClick={() => handleUnfollow(item.userId)}>언팔로우</Button>
                            ) : (
                                <Button type="primary" onClick={() => handleFollow(item.userId)}>팔로우</Button>
                            ),
                        ]}
                    >
                        <List.Item.Meta
                            avatar={<Avatar src={item.picture || `https://api.dicebear.com/7.x/miniavs/svg?seed=${item.userId}`} />}
                            title={<a onClick={() => handleProfileClick(item.userId)}>{item.name}</a>}
                            description={item.email}
                        />
                    </List.Item>
                );
            }}
        />
    );

    return (
        <Modal
            title="친구 목록"
            open={open}  // open 상태에 따라 모달이 열리고 닫힙니다.
            onCancel={onClose}  // X 버튼 클릭시 모달 닫기
            footer={null}
            width={400}
        >
            <Tabs activeKey={activeTab} onChange={setActiveTab} centered>
                <TabPane tab="새 친구 찾기" key="search">
                    <Search
                        placeholder="닉네임 또는 이메일로 검색"
                        onSearch={(value) => setSearchTerm(value)}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ marginBottom: 20 }}
                        enterButton
                        loading={isSearching}
                    />
                    {renderUserList(searchResults)}
                </TabPane>
                <TabPane tab={`팔로잉 ${followingList.length}`} key="following">
                    {renderUserList(followingList)}
                </TabPane>
                <TabPane tab={`팔로워 ${followerList.length}`} key="followers">
                    {renderUserList(followerList)}
                </TabPane>
            </Tabs>
        </Modal>
    );
}
