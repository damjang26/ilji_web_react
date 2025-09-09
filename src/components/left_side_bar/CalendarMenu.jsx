import React, { useState, useEffect, useMemo, useRef } from "react";
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
import { PlusOutlined, DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { useTags } from "../../contexts/TagContext.jsx";
import { useSchedule } from "../../contexts/ScheduleContext.jsx";
import * as S from "../../styled_components/left_side_bar/CalendarMenuStyled.jsx";
import { getFollowingList } from "../../api.js";
import { useAuth } from "../../AuthContext.jsx";

const CalendarMenu = () => {
  const { user } = useAuth();
  const { tags, addTag, deleteTag, updateTag, loading, addFriendTags, removeFriendTags } = useTags();
  const { fetchSchedulesByTags } = useSchedule();

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
    if(user) fetchFriends();
  }, [user]);

  const myTags = useMemo(() => tags.filter(tag => tag.owner.userId === user?.id), [tags, user?.id]);

  useEffect(() => {
    if (myTags.length > 0 && isInitialTagLoad) {
      const allMyTagIds = myTags.map((tag) => tag.id);
      setSelectedTagIds(allMyTagIds);
      setIsInitialTagLoad(false);
    }
  }, [myTags, isInitialTagLoad]);

  useEffect(() => {
    if (!isInitialTagLoad) {
      fetchSchedulesByTags(selectedTagIds, { showLoading: true });
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
        acc[ownerKey] = { ownerName: tag.owner.name, tags: [] };
      }
      acc[ownerKey].tags.push(tag);
      return acc;
    }, {});
  }, [tags]);

  const TagGroupContent = ({ group, isMyTags = false }) => {
    const allTagIdsInGroup = group.tags.map(t => t.id);
    const areAllSelectedInGroup = allTagIdsInGroup.every(id => selectedTagIds.includes(id));

    const handleSelectAll = () => {
      if (areAllSelectedInGroup) {
        setSelectedTagIds(prev => prev.filter(id => !allTagIdsInGroup.includes(id)));
      } else {
        setSelectedTagIds(prev => [...new Set([...prev, ...allTagIdsInGroup])]);
      }
    };

    const menuItems = (tag) => [
      {
        key: "edit",
        label: "수정",
        icon: <EditOutlined />,
        onClick: () => showEditModal(tag),
      },
      {
        key: "delete",
        label: "삭제",
        icon: <DeleteOutlined />,
        onClick: () => deleteTag(tag.id),
      },
    ];

    return (
      <S.TagScrollWrapper>
        {isMyTags && (
          <S.TagItem>
            <input type="checkbox" checked={areAllSelectedInGroup} onChange={handleSelectAll} style={{ marginRight: '8px' }} />
            <S.ColorSquare color={"#8c8c8c"} />
            <S.TagLabel>전체 선택</S.TagLabel>
            <PlusOutlined onClick={showAddModal} style={{ marginLeft: 'auto' }} />
          </S.TagItem>
        )}
        {group.tags.map((tag) => (
          <Dropdown key={tag.id} menu={{ items: menuItems(tag) }} trigger={["contextMenu"]}>
            <S.TagItem>
              <input type="checkbox" checked={selectedTagIds.includes(tag.id)} onChange={() => handleTagClick(tag.id)} style={{ marginRight: '8px' }} />
              <S.ColorSquare color={tag.color} />
              <S.TagLabel>{tag.label}</S.TagLabel>
            </S.TagItem>
          </Dropdown>
        ))}
      </S.TagScrollWrapper>
    );
  };

  const myTagsGroup = user ? groupedTags[user.id] : null;
  const friendTagGroups = Object.entries(groupedTags).filter(([ownerId]) => ownerId != (user?.id));
  const friendOptions = followingList.map(friend => ({ value: friend.userId, label: friend.name }));

  return (
    <S.MenuContainer>
      <S.TagListContainer>
        {loading && tags.length === 0 ? (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}><Spin /></div>
        ) : (
          <>
            {myTagsGroup && (
              <Collapse defaultActiveKey={user.id} ghost>
                <Collapse.Panel header={myTagsGroup.ownerName} key={user.id}>
                  <TagGroupContent group={myTagsGroup} isMyTags={true} />
                </Collapse.Panel>
              </Collapse>
            )}

            <S.FriendSelectContainer>
              <Select
                mode="multiple"
                allowClear
                style={{ width: '100%' }}
                placeholder="친구 캘린더 보기"
                onChange={handleFriendSelectionChange}
                options={friendOptions}
                value={selectedFriends}
              />
            </S.FriendSelectContainer>

            {friendTagGroups.length > 0 && <Divider style={{ margin: '8px 0' }}/>}
            
            <Collapse ghost>
              {friendTagGroups.map(([ownerId, group]) => (
                <Collapse.Panel header={group.ownerName} key={ownerId}>
                  <TagGroupContent group={group} />
                </Collapse.Panel>
              ))}
            </Collapse>
          </>
        )}
      </S.TagListContainer>

      <Modal 
        title={modalMode === 'add' ? '새 태그 추가' : '태그 수정'}
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <Form form={form} layout="vertical" name="form_in_modal">
          <Form.Item name="label" label="태그 이름" rules={[{ required: true, message: "태그 이름을 입력해주세요!" }]}>
            <Input />
          </Form.Item>
          <Form.Item name="color" label="색상" rules={[{ required: true, message: "색상을 선택해주세요!" }]} initialValue="#ffadad">
            <ColorPicker showText />
          </Form.Item>
          <Form.Item name="scope" label="공개 범위" initialValue="PRIVATE" rules={[{ required: true, message: "공개 범위를 선택해주세요!" }]}>
            <Select options={[{ value: 'PRIVATE', label: '비공개 (나만 보기)' }, { value: 'MUTUAL_FRIENDS', label: '맞팔로우에게만 공개' }, { value: 'PUBLIC', label: '전체 공개' }]} />
          </Form.Item>
        </Form>
      </Modal>
    </S.MenuContainer>
  );
};

export default CalendarMenu;