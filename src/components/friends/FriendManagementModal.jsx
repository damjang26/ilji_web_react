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
import { useUserActions } from "../../hooks/useUserActions.js"; // ✅ [추가] 커스텀 훅 임포트

const { TabPane } = Tabs;
const { Search } = Input;

export default function FriendManagementModal({ open, onClose, initialTab, targetUserId }) {
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

    const fetchLists = useCallback(async (userId) => {
        setLoading(true);
        try {
            const [followingRes, followersRes] = await Promise.all([
                getFollowingList(userId),
                getFollowersList(userId),
            ]);
            setFollowingList(followingRes.data);
            setFollowerList(followersRes.data);
        } catch (error) {
            console.error("Failed to fetch friend lists:", error);
            message.error("목록을 불러오는 데 실패했습니다.");
        } finally {
            setLoading(false);
        }
    }, []); // Dependencies are empty as the function now relies on its argument.

    useEffect(() => {
        if (open) {
            // Fetch lists for the specific user (or the logged-in user if targetUserId is null)
            fetchLists(targetUserId);
            fetchMyFollowing(); // Always refresh the logged-in user's following status
        }
    }, [open, targetUserId, fetchLists, fetchMyFollowing]);

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

    // ✅ [수정] 커스텀 훅을 사용하여 액션 함수들을 가져옵니다.
    // 액션 완료 후 `fetchLists`를 호출하여 현재 모달의 목록을 새로고침합니다.
    const { handleFollow, handleUnfollow, handleProfileClick } = useUserActions(() => fetchLists(targetUserId));

    const renderUserList = (users) => (
        <List
            loading={loading || isSearching}
            itemLayout="horizontal"
            dataSource={users}
            locale={{ emptyText: "표시할 사용자가 없습니다." }}
            renderItem={(item) => {
                // Add a safeguard to prevent runtime errors if myFollowing is not yet an array
                const isFollowing = Array.isArray(myFollowing)
                    ? myFollowing.some((f) => f.userId === item.userId)
                    : false;

                if (loggedInUser && item.userId === loggedInUser.id) {
                    return (
                        <List.Item>
                            <List.Item.Meta
                                avatar={<Avatar src={item.picture || `https://api.dicebear.com/7.x/miniavs/svg?seed=${item.userId}`} 
                                                onClick={() => handleProfileClick(item.userId, onClose)} style={{ cursor: 'pointer' }} />
                                }
                                title={<a onClick={() => handleProfileClick(item.userId, onClose)} style={{ cursor: 'pointer' }}>{item.name} (나)</a>}
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
                            avatar={<Avatar src={item.picture || `https://api.dicebear.com/7.x/miniavs/svg?seed=${item.userId}`} 
                                            onClick={() => handleProfileClick(item.userId, onClose)} style={{ cursor: 'pointer' }}/>
                            }
                            title={<a onClick={() => handleProfileClick(item.userId, onClose)} style={{ cursor: 'pointer' }}>{item.name}</a>}
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
            open={open}
            onCancel={onClose}
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
