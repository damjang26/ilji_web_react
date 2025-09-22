import React, {useState, useEffect, useCallback} from "react";
import {useNavigate} from "react-router-dom";
import {Modal, Tabs, List, Avatar, Button, message, Input} from "antd";
import {
    getFollowingList,
    getFollowersList,
    followUser,
    unfollowUser,
    searchUsers,
} from "../../api";
import {useAuth} from "../../AuthContext";
import {useDebounce} from "../../hooks/useDebounce";
import {useUserActions} from "../../hooks/useUserActions.js"; // ✅ [추가] 커스텀 훅 임포트

const {Search} = Input;

export default function FriendManagementModal({open, onClose, initialTab, targetUserId}) {
    const navigate = useNavigate();
    const {user: loggedInUser, following: myFollowing, fetchMyFollowing} = useAuth();

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
    // const { handleFollow, handleUnfollow, handleProfileClick } = useUserActions(() => fetchLists(targetUserId));

    const handleFollow = async (userToFollowId) => {
        try {
            await followUser(userToFollowId);
            message.success("팔로우했습니다.");
            // Refresh the list for the currently viewed user (from props)
            fetchLists(targetUserId);
            fetchMyFollowing();
        } catch (error) {
            console.error("Follow failed:", error);
            message.error("팔로우에 실패했습니다.");
        }
    };

    const handleUnfollow = async (userToUnfollowId) => {
        try {
            await unfollowUser(userToUnfollowId);
            message.success("언팔로우했습니다.");
            // Refresh the list for the currently viewed user (from props)
            fetchLists(targetUserId);
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


    const getUniqueUsers = (users) => {
        if (!Array.isArray(users)) return [];
        const seen = new Set();
        return users.filter(user => {
            const duplicate = seen.has(user.userId);
            seen.add(user.userId);
            return !duplicate;
        });
    };

    const renderUserList = (users) => (
        <List
            loading={loading || isSearching}
            itemLayout="horizontal"
            dataSource={getUniqueUsers(users)}
            locale={{emptyText: "표시할 사용자가 없습니다."}}
            renderItem={(item) => {
                // Add a safeguard to prevent runtime errors if myFollowing is not yet an array
                const isFollowing = Array.isArray(myFollowing)
                    ? myFollowing.some((f) => f.userId === item.userId)
                    : false;

                if (loggedInUser && item.userId === loggedInUser.id) {
                    return (
                        <List.Item key={item.userId}>
                            <List.Item.Meta
                                avatar={<Avatar
                                    src={item.picture || `https://api.dicebear.com/7.x/miniavs/svg?seed=${item.userId}`}
                                    onClick={() => handleProfileClick(item.userId, onClose)}
                                    style={{cursor: 'pointer'}}/>
                                }
                                title={<a onClick={() => handleProfileClick(item.userId, onClose)}
                                          style={{cursor: 'pointer'}}>{item.name} (나)</a>}
                                description={item.email}
                            />
                        </List.Item>
                    );
                }

                return (
                    <List.Item
                        key={item.userId}
                        actions={[
                            isFollowing ? (
                                <Button onClick={() => handleUnfollow(item.userId)}>언팔로우</Button>
                            ) : (
                                <Button type="primary" onClick={() => handleFollow(item.userId)}>팔로우</Button>
                            ),
                        ]}
                    >
                        <List.Item.Meta
                            avatar={<Avatar
                                src={item.picture || `https://api.dicebear.com/7.x/miniavs/svg?seed=${item.userId}`}
                                onClick={() => handleProfileClick(item.userId, onClose)} style={{cursor: 'pointer'}}/>
                            }
                            title={<a onClick={() => handleProfileClick(item.userId, onClose)}
                                      style={{cursor: 'pointer'}}>{item.name}</a>}
                            description={item.email}
                        />
                    </List.Item>
                );
            }}
        />
    );

    const tabItems = [
        {
            key: 'search',
            label: '새 친구 찾기',
            children: (
                <>
                    <Search
                        placeholder="닉네임 또는 이메일로 검색"
                        onSearch={(value) => setSearchTerm(value)}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{marginBottom: 20}}
                        enterButton
                        loading={isSearching}
                    />
                    {renderUserList(searchResults)}
                </>
            ),
        },
        {
            key: 'following',
            label: `팔로잉 ${followingList.length}`,
            children: renderUserList(followingList),
        },
        {
            key: 'followers',
            label: `팔로워 ${followerList.length}`,
            children: renderUserList(followerList),
        },
    ];

    return (
        <Modal
            title="친구 목록"
            open={open}
            onCancel={onClose}
            footer={null}
            width={400}
        >
            <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} centered/>
        </Modal>
    );
}
