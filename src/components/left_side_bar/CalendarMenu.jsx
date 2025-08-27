import React, { useState, useEffect } from 'react';
import { Collapse, Select, Modal, Form, Input, Dropdown, ColorPicker } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { useTags } from '../../contexts/TagContext.jsx';
import { useSchedule } from '../../contexts/ScheduleContext.jsx'; // ScheduleContext 훅 import
import * as S from '../../styled_components/left_side_bar/CalendarMenuStyled';

const sampleGroups = [
  { id: 'g1', name: '프로젝트 A팀' },
  { id: 'g2', name: '스터디 그룹' },
  { id: 'g3', name: '가족' },
];

const groupOptions = [
    { value: '', label: '모든 그룹' },
    ...sampleGroups.map(group => ({
        value: group.id,
        label: group.name,
    }))
];

// --- Component ---

const CalendarMenu = () => {
  const { tags, addTag, deleteTag } = useTags();
  // ToDo: fetchSchedulesByTags 함수는 다음 단계에서 ScheduleContext에 구현 예정
  const { fetchSchedulesByTags } = useSchedule(); 
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTagIds, setSelectedTagIds] = useState([]); // 선택된 태그 ID 목록 state
  const [form] = Form.useForm();

  // --- 태그 필터링 로직 ---
  // selectedTagIds 상태가 변경될 때마다 실행됩니다.
  useEffect(() => {
    // ToDo: fetchSchedulesByTags가 정의되면 아래 주석을 해제합니다.
    if (fetchSchedulesByTags) {
       fetchSchedulesByTags(selectedTagIds);
    }
  }, [selectedTagIds, fetchSchedulesByTags]);

  // --- 태그 관련 핸들러 ---
  const handleTagClick = (tagId) => {
    // 클릭된 태그 ID가 이미 목록에 있는지 확인
    setSelectedTagIds(prevIds => 
      prevIds.includes(tagId)
        ? prevIds.filter(id => id !== tagId) // 있으면 제거 (선택 해제)
        : [...prevIds, tagId] // 없으면 추가 (선택)
    );
  };

  // --- 그룹 변경 핸들러 ---
  const handleGroupChange = (value) => {
    console.log(`Group selected:`, value);
  };

  // --- 모달 관련 핸들러 ---
  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    form
      .validateFields()
      .then(async (values) => {
        // color 값이 객체인지 문자열인지 확인하여 처리합니다.
        const colorValue = typeof values.color === 'object' && values.color !== null
          ? values.color.toHexString()
          : values.color;

        const newTagPayload = {
          label: values.label,
          color: colorValue,
        };
        await addTag(newTagPayload);
        form.resetFields();
        setIsModalOpen(false);
      })
      .catch(info => {
        console.log('Validate Failed:', info);
      });
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  // --- 삭제 메뉴 아이템 ---
  const menuItems = [
    {
      key: 'delete',
      label: '삭제',
      icon: <DeleteOutlined />,
    }
  ];

  // --- Collapse 패널 아이템 정의 ---
  const items = [
    {
      key: '1',
      label: (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>태그별 보기</span>
          <PlusOutlined 
            onClick={(e) => {
              e.stopPropagation();
              showModal();
            }}
          />
        </div>
      ),
      children: (
        <S.TagListContainer>
          {tags.map(tag => (
            <Dropdown 
              key={tag.id} 
              menu={{ 
                items: menuItems, 
                onClick: ({ key }) => {
                  if (key === 'delete') {
                    deleteTag(tag.id);
                  }
                }
              }}
              trigger={['contextMenu']}
            >
              {/* isSelected prop을 전달하여 선택 상태에 따라 다른 스타일을 적용 */}
              <S.TagItem 
                onClick={() => handleTagClick(tag.id)}
                $isSelected={selectedTagIds.includes(tag.id)}
              >
                <S.ColorSquare color={tag.color} />
                <S.TagLabel>{tag.label}</S.TagLabel>
              </S.TagItem>
            </Dropdown>
          ))}
        </S.TagListContainer>
      ),
    },
    {
      key: '2',
      label: '그룹별 보기',
      children: (
        <Select
            defaultValue=""
            style={{ width: '100%' }}
            onChange={handleGroupChange}
            options={groupOptions}
        />
      ),
    },
  ];

  return (
    <>
      <S.MenuContainer>
        <Collapse items={items} defaultActiveKey={['1']} ghost />
      </S.MenuContainer>

      <Modal title="새 태그 추가" open={isModalOpen} onOk={handleOk} onCancel={handleCancel}>
        <Form form={form} layout="vertical" name="form_in_modal">
          <Form.Item
            name="label"
            label="태그 이름"
            rules={[{ required: true, message: '태그 이름을 입력해주세요!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="color"
            label="색상"
            rules={[{ required: true, message: '색상을 선택해주세요!' }]}
            initialValue="#ffadad"
          >
            <ColorPicker showText />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default CalendarMenu;