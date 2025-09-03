import React, { useState, useEffect } from "react";
import {
  Collapse,
  Select,
  Modal,
  Form,
  Input,
  Dropdown,
  ColorPicker,
  Spin,
} from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import { useTags } from "../../contexts/TagContext.jsx";
import { useSchedule } from "../../contexts/ScheduleContext.jsx"; // ScheduleContext 훅 import
import * as S from "../../styled_components/left_side_bar/CalendarMenuStyled.jsx";

const sampleGroups = [
  { id: "g1", name: "프로젝트 A팀" },
  { id: "g2", name: "스터디 그룹" },
  { id: "g3", name: "가족" },
];

const groupOptions = [
  { value: "", label: "모든 그룹" },
  ...sampleGroups.map((group) => ({
    value: group.id,
    label: group.name,
  })),
];

// --- Component ---

const CalendarMenu = () => {
  const { tags, addTag, deleteTag, loading } = useTags();
  const { fetchSchedulesByTags, restoreCachedEvents } = useSchedule();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTagIds, setSelectedTagIds] = useState([]);
  const [isInitialTagLoad, setIsInitialTagLoad] = useState(true);
  const [form] = Form.useForm();

  // 1. 태그 목록 첫 로드 시, 모든 태그를 선택하고 일정을 가져옵니다.
  useEffect(() => {
    if (tags.length > 0 && isInitialTagLoad && fetchSchedulesByTags) {
      const allTagIds = tags.map((tag) => tag.id);
      setSelectedTagIds(allTagIds);
      fetchSchedulesByTags(allTagIds, { showLoading: true }); // 초기 로드는 로딩 표시
      setIsInitialTagLoad(false);
    }
  }, [tags, isInitialTagLoad, fetchSchedulesByTags]);

  // 2. '전체 선택' 체크박스의 상태를 파생합니다.
  const isAllSelected = tags.length > 0 && selectedTagIds.length === tags.length;

  // 3. '전체 선택' 클릭 핸들러를 수정합니다.
  const handleSelectAllClick = () => {
    if (isAllSelected) {
      // 전체 선택 해제: UI를 즉시 업데이트하고, 서버에 변경 사항을 알립니다.
      setSelectedTagIds([]);
      fetchSchedulesByTags([], { showLoading: true }); // 빈 배열로 호출하여 일정을 지웁니다.
    } else {
      // 전체 선택 (옵티미스틱 업데이트):
      // 1. 캐시된 데이터로 UI를 즉시 복원합니다.
      restoreCachedEvents();
      // 2. 체크박스 상태를 업데이트합니다.
      const allTagIds = tags.map((tag) => tag.id);
      setSelectedTagIds(allTagIds);
      // 3. 백그라운드에서 최신 데이터를 조용히 가져옵니다.
      fetchSchedulesByTags(allTagIds, { showLoading: false });
    }
  };

  // 4. 개별 태그 클릭 핸들러를 수정합니다.
  const handleTagClick = (tagId) => {
    const newSelectedIds = selectedTagIds.includes(tagId)
      ? selectedTagIds.filter((id) => id !== tagId)
      : [...selectedTagIds, tagId];

    setSelectedTagIds(newSelectedIds);
    fetchSchedulesByTags(newSelectedIds, { showLoading: true }); // 개별 변경은 로딩 표시
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
        const colorValue =
          typeof values.color === "object" && values.color !== null
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
      .catch((info) => {
        console.log("Validate Failed:", info);
      });
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  // --- 삭제 메뉴 아이템 ---
  const menuItems = [
    {
      key: "delete",
      label: "삭제",
      icon: <DeleteOutlined />,
    },
  ];

  // --- Collapse 패널 아이템 정의 ---
  const items = [
    {
      key: "1",
      label: (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
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
          {loading ? (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100%",
              }}
            >
              <Spin />
            </div>
          ) : (
            <>
              {/* '전체 선택' 체크박스 */}
              <S.TagItem>
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={handleSelectAllClick}
                  style={{ marginRight: '8px' }}
                />
                <S.ColorSquare color={"#8c8c8c"} />
                <S.TagLabel>전체 선택</S.TagLabel>
              </S.TagItem>

              {/* 개별 태그 체크박스 */}
              {tags.map((tag) => (
                <Dropdown
                  key={tag.id}
                  menu={{
                    items: menuItems,
                    onClick: ({ key }) => {
                      if (key === "delete") {
                        deleteTag(tag.id);
                      }
                    },
                  }}
                  trigger={["contextMenu"]}
                >
                  <S.TagItem>
                    <input
                      type="checkbox"
                      checked={selectedTagIds.includes(tag.id)}
                      onChange={() => handleTagClick(tag.id)}
                      style={{ marginRight: '8px' }}
                    />
                    <S.ColorSquare color={tag.color} />
                    <S.TagLabel>{tag.label}</S.TagLabel>
                  </S.TagItem>
                </Dropdown>
              ))}
            </>
          )}
        </S.TagListContainer>
      ),
    },
    {
      key: "2",
      label: "그룹별 보기",
      children: (
        <Select
          defaultValue=""
          style={{ width: "100%" }}
          onChange={handleGroupChange}
          options={groupOptions}
        />
      ),
    },
  ];

  return (
    <>
      <S.MenuContainer>
        <Collapse items={items} defaultActiveKey={["1"]} ghost />
      </S.MenuContainer>

      <Modal
        title="새 태그 추가"
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <Form form={form} layout="vertical" name="form_in_modal">
          <Form.Item
            name="label"
            label="태그 이름"
            rules={[{ required: true, message: "태그 이름을 입력해주세요!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="color"
            label="색상"
            rules={[{ required: true, message: "색상을 선택해주세요!" }]}
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
