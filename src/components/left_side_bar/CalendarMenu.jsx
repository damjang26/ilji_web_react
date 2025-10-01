import React, {useState, useEffect, useMemo, useRef} from "react";
import {
    Collapse,
    Select,
    Modal,
    Form,
    Input,
    Dropdown,
    ColorPicker,
    Spin,
    Divider,
} from "antd";
import {PlusOutlined, DeleteOutlined, EditOutlined, MoreOutlined} from "@ant-design/icons";
import {useTags, NO_TAG_ID} from "../../contexts/TagContext.jsx";
import {useSchedule} from "../../contexts/ScheduleContext.jsx";
import * as S from "../../styled_components/left_side_bar/CalendarMenuStyled.jsx";
import {getFollowingList} from "../../api.js";
import {useAuth} from "../../AuthContext.jsx";

const CalendarMenu = () => {
    const {user} = useAuth();
    const {tags, addTag, deleteTag, updateTag, loading, addFriendTags, removeFriendTags} = useTags();
    const {fetchSchedulesByTags} = useSchedule();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [editingTag, setEditingTag] = useState(null);
    const [selectedTagIds, setSelectedTagIds] = useState([]);
    const [isInitialTagLoad, setIsInitialTagLoad] = useState(true);
    const [followingList, setFollowingList] = useState([]);
    const [selectedFriends, setSelectedFriends] = useState([]);
    const [form] = Form.useForm();

    useEffect(() => {
        const fetchFriends = async () => {
            try {
                const response = await getFollowingList();
                setFollowingList(response.data);
            } catch (error) {
                console.error("Failed to fetch following list:", error);
            }
        };
        if (user) fetchFriends();
    }, [user]);

    const myTags = useMemo(() => tags.filter(tag => tag.owner.userId === user?.id), [tags, user?.id]);
    const prevLoading = useRef(loading);

    useEffect(() => {
        const wasLoading = prevLoading.current;
        // 데이터 로딩이 완료되고(true -> false), 초기 설정이 아직 실행되지 않았을 때 한 번만 실행
        if (isInitialTagLoad && wasLoading && !loading) {
            const allMyTagIds = tags
                .filter(tag => tag.owner.userId === user?.id)
                .map((tag) => tag.id);

            if (allMyTagIds.length > 0) {
                setSelectedTagIds(allMyTagIds);
                setIsInitialTagLoad(false);
            }
        }
        prevLoading.current = loading;
    }, [loading, tags, user, isInitialTagLoad]);

    useEffect(() => {
        if (!isInitialTagLoad) {
            fetchSchedulesByTags(selectedTagIds, {showLoading: true});
        }
    }, [selectedTagIds, isInitialTagLoad, fetchSchedulesByTags]);

    const handleTagClick = (tagId) => {
        setSelectedTagIds(prev =>
            prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]
        );
    };

    const handleFriendSelectionChange = (selectedFriendIds) => {
        const newlySelected = selectedFriendIds.filter(id => !selectedFriends.includes(id));
        const newlyDeselected = selectedFriends.filter(id => !selectedFriendIds.includes(id));

        newlySelected.forEach(friendId => {
            const friend = followingList.find(f => f.userId === friendId);
            if (friend) addFriendTags(friend);
        });

        newlyDeselected.forEach(friendId => {
            removeFriendTags(friendId);
            const friendTagsToRemove = tags.filter(tag => tag.owner.userId === friendId).map(t => t.id);
            setSelectedTagIds(prev => prev.filter(id => !friendTagsToRemove.includes(id)));
        });

        setSelectedFriends(selectedFriendIds);
    };

    const showAddModal = () => {
        setModalMode('add');
        setEditingTag(null);
        form.resetFields();
        setIsModalOpen(true);
    };

    const showEditModal = (tag) => {
        setModalMode('edit');
        setEditingTag(tag);
        form.setFieldsValue({
            label: tag.label,
            color: tag.color,
            scope: tag.visibility,
        });
        setIsModalOpen(true);
    };

    const handleOk = () => {
        form.validateFields().then(async (values) => {
            const colorValue = typeof values.color === 'object' && values.color !== null ? values.color.toHexString() : values.color;
            const payload = {
                label: values.label,
                color: colorValue,
                visibility: values.scope,
            };

            if (modalMode === 'add') {
                await addTag(payload);
            } else {
                await updateTag(editingTag.id, payload);
            }

            setIsModalOpen(false);
            form.resetFields();
        }).catch(info => console.log("Validate Failed:", info));
    };

    const handleCancel = () => setIsModalOpen(false);

    const groupedTags = useMemo(() => {
        return tags.reduce((acc, tag) => {
            const ownerKey = tag.owner.userId;
            if (!acc[ownerKey]) {
                acc[ownerKey] = {ownerName: tag.owner.name, tags: []};
            }
            acc[ownerKey].tags.push(tag);
            return acc;
        }, {});
    }, [tags]);

    const TagGroupContent = ({group, isMyTags = false}) => {
        const allTagIdsInGroup = group.tags.map(t => t.id);
        const areAllSelectedInGroup = allTagIdsInGroup.every(id => selectedTagIds.includes(id));

        const handleSelectAll = () => {
            if (areAllSelectedInGroup) {
                setSelectedTagIds(prev => prev.filter(id => !allTagIdsInGroup.includes(id)));
            } else {
                setSelectedTagIds(prev => [...new Set([...prev, ...allTagIdsInGroup])]);
            }
        };

        const menuItems = (tag) => {
            if (!isMyTags) return [];
            return [
                {
                    key: "edit",
                    label: "edit",
                    icon: <EditOutlined/>,
                    onClick: () => showEditModal(tag),
                },
                {
                    key: "delete",
                    label: "delete",
                    icon: <DeleteOutlined/>,
                    onClick: () => deleteTag(tag.id),
                },
            ];
        }

        return (
            <>
                {isMyTags && (
                    // ✅ [수정] '전체 선택'과 '태그 추가' 아이콘을 한 줄에 배치합니다.
                    <S.TagItem style={{ justifyContent: 'space-between' }}>
                        <div>
                            <S.TagCheckbox checked={areAllSelectedInGroup} onChange={handleSelectAll}/>
                            <S.TagLabel>Select All Tags</S.TagLabel>
                        </div>
                    </S.TagItem>
                )}
                {group.tags.map((tag) => (
                    <S.TagItem key={tag.id} onClick={() => handleTagClick(tag.id)}>
                        <S.TagCheckbox checked={selectedTagIds.includes(tag.id)} readOnly/>
                        {tag.color && <S.ColorSquare color={tag.color}/>}
                        <S.TagLabel>{tag.label}</S.TagLabel>
                        {isMyTags && tag.id !== NO_TAG_ID && (
                            <S.MenuButton onClick={(e) => e.stopPropagation()}>
                                <Dropdown menu={{items: menuItems(tag)}} trigger={["click"]}>
                                    <MoreOutlined style={{padding: '4px', cursor: 'pointer'}}/>
                                </Dropdown>
                            </S.MenuButton>
                        )}
                    </S.TagItem>
                ))}
            </>
        );
    };

    const myTagsGroup = user ? groupedTags[user.id] : null;
    const friendTagGroups = Object.entries(groupedTags).filter(([ownerId]) => ownerId != (user?.id));
    const friendOptions = followingList.map(friend => ({value: friend.userId, label: friend.name}));

    return (
        <S.MenuContainer>
            <S.TagListContainer>
                {loading && tags.length === 0 ? (
                    <div style={{display: "flex", justifyContent: "center", alignItems: "center", height: "100%"}}>
                        <Spin/></div>
                ) : (
                    <>
                        {myTagsGroup && (
                            <Collapse defaultActiveKey={user.id} ghost>
                                {/* ✅ [수정] extra prop을 사용하여 헤더 오른쪽에 '태그 추가' 아이콘을 배치합니다. */}
                                <Collapse.Panel
                                    header={myTagsGroup.ownerName}
                                    key={user.id}
                                    extra={
                                        <PlusOutlined
                                            onClick={(e) => { e.stopPropagation(); showAddModal(); }}
                                        />
                                    }
                                >
                                    <TagGroupContent group={myTagsGroup} isMyTags={true}/>
                                </Collapse.Panel>
                            </Collapse>
                        )}

                        <S.FriendSelectContainer>
                            <Select
                                mode="multiple"
                                allowClear
                                style={{width: '100%'}}
                                placeholder="View Friend’s Calendar"
                                onChange={handleFriendSelectionChange}
                                options={friendOptions}
                                value={selectedFriends}
                            />
                        </S.FriendSelectContainer>

                        {friendTagGroups.length > 0 && <Divider style={{margin: '8px 0'}}/>}

                        <Collapse ghost>
                            {friendTagGroups.map(([ownerId, group]) => (
                                <Collapse.Panel header={group.ownerName} key={ownerId}>
                                    <TagGroupContent group={group}/>
                                </Collapse.Panel>
                            ))}
                        </Collapse>
                    </>
                )}
            </S.TagListContainer>

            <Modal
                title={modalMode === 'add' ? 'Add a new tag' : 'Edit tag'}
                open={isModalOpen}
                onOk={handleOk}
                onCancel={handleCancel}
            >
                <Form form={form} layout="vertical" name="form_in_modal">
                    <Form.Item name="label" label="tag name" rules={[{required: true, message: "Please enter your tag name!"}]}>
                        <Input/>
                    </Form.Item>
                    <Form.Item name="color" label="color" rules={[{required: true, message: "Please choose a color!"}]}
                               initialValue="#ffadad">
                        <ColorPicker showText/>
                    </Form.Item>
                    <Form.Item name="scope" label="disclosure range" initialValue="PRIVATE"
                               rules={[{required: true, message: "Please select a disclosure range!"}]}>
                        <Select options={[{value: 'PRIVATE', label:'Private (only visible to me)'}, {
                            value: 'MUTUAL_FRIENDS',
                            label: 'Revealed only to a follower'
                        }, {value: 'PUBLIC', label: 'full disclosure'}]}/>
                    </Form.Item>
                </Form>
            </Modal>
        </S.MenuContainer>
    );
};

export default CalendarMenu;