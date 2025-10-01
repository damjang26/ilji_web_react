import React, {useState, useEffect, useCallback} from "react";
import {Modal, Tabs, List, Avatar, message, Input, Checkbox} from "antd";
import {
    getFollowingList,
    getFollowersList,
    searchUsers,
    createChatRoom
} from "../../api";
import {useAuth} from "../../AuthContext";
import {useDebounce} from "../../hooks/useDebounce";

const {Search} = Input;

export default function CreateChatRoomModal({open, onClose, onChatRoomCreated}) {
    const {user: loggedInUser} = useAuth();

    const [activeTab, setActiveTab] = useState("following");
    const [followingList, setFollowingList] = useState([]);
    const [followerList, setFollowerList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [roomName, setRoomName] = useState("");

    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    const fetchLists = useCallback(async () => {
        if (!loggedInUser) return;
        setLoading(true);
        try {
            const [followingRes, followersRes] = await Promise.all([
                getFollowingList(loggedInUser.id),
                getFollowersList(loggedInUser.id),
            ]);
            setFollowingList(followingRes.data);
            setFollowerList(followersRes.data);
        } catch (error) {
            console.error("Failed to fetch friend lists:", error);
            message.error("Failed to load list.");
        } finally {
            setLoading(false);
        }
    }, [loggedInUser]);

    useEffect(() => {
        if (open) {
            fetchLists();
            setSelectedUsers([]);
            setRoomName("");
        }
    }, [open, fetchLists]);

    useEffect(() => {
        if (debouncedSearchTerm) {
            const performSearch = async () => {
                setIsSearching(true);
                try {
                    const response = await searchUsers(debouncedSearchTerm);
                    setSearchResults(response.data);
                } catch (error) {
                    console.error("Search failed:", error);
                    message.error("User search failed.");
                } finally {
                    setIsSearching(false);
                }
            };
            performSearch();
        } else {
            setSearchResults([]);
        }
    }, [debouncedSearchTerm]);

    const handleUserSelect = (user, isSelected) => {
        if (isSelected) {
            setSelectedUsers((prev) => [...prev, user]);
        } else {
            setSelectedUsers((prev) => prev.filter((u) => u.userId !== user.userId));
        }
    };

    const handleOk = async () => {
        if (selectedUsers.length === 0) {
            message.warn("You must select at least one user.");
            return;
        }

        const userIds = selectedUsers.map((u) => u.userId);

        try {
            const response = await createChatRoom(roomName, userIds);
            message.success("A chat room has been created.\n");
            onChatRoomCreated(response.data);
            onClose();
        } catch (error) {
            console.error("Failed to create chat room:", error);
            message.error("Failed to create chat room.");
        }
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
            locale={{emptyText:"There are no users to display."}}
            renderItem={(item) => {
                if (loggedInUser && item.userId === loggedInUser.id) {
                    return null;
                }

                const isSelected = selectedUsers.some((u) => u.userId === item.userId);

                return (
                    <List.Item
                        key={item.userId}
                        actions={[
                            <Checkbox
                                checked={isSelected}
                                onChange={(e) => handleUserSelect(item, e.target.checked)}
                            />,
                        ]}
                    >
                        <List.Item.Meta
                            avatar={<Avatar
                                src={item.picture || `https://api.dicebear.com/7.x/miniavs/svg?seed=${item.userId}`}/>}
                            title={item.name}
                            description={item.email}
                        />
                    </List.Item>
                );
            }}
        />
    );

    const tabItems = [
        {
            key: 'following',
            label: 'Following',
            children: renderUserList(followingList),
        },
        {
            key: 'followers',
            label: 'Followers',
            children: renderUserList(followerList),
        },
        {
            key: 'search',
            label: 'Search',
            children: (
                <>
                    <Search
                        placeholder="Search by nickname or email"
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
    ];

    return (
        <Modal
            title="Create a new chat room"
            open={open}
            onCancel={onClose}
            onOk={handleOk}
            okText="Create"
            cancelText="Cancel"
            width={400}
        >
            <Input
                placeholder="Chat Room Name (Select)"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                style={{marginBottom: 20}}
            />
            <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} centered/>
        </Modal>
    );
}
