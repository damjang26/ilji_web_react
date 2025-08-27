import React from 'react';
import { Collapse, Select } from 'antd'; // Select 컴포넌트 import 추가
// 태그 아이템 스타일은 그대로 사용하므로 일부만 가져옵니다.
import * as S from '../../styled_components/left_side_bar/CalendarMenuStyled';

// --- Dummy Data ---
const sampleTags = [
  { id: 1, label: '공부', color: '#ffadad' },
  { id: 2, label: '여가', color: '#ffd6a5' },
  { id: 3, label: '업무', color: '#fdffb6' },
  { id: 4, label: '운동', color: '#caffbf' },
  { id: 5, label: '약속', color: '#9bf6ff' },
  { id: 6, label: '기타', color: '#a0c4ff' },
];

const sampleGroups = [
  { id: 'g1', name: '프로젝트 A팀' },
  { id: 'g2', name: '스터디 그룹' },
  { id: 'g3', name: '가족' },
];

// AntD Select 컴포넌트에 맞는 형식으로 그룹 데이터 가공
const groupOptions = [
    { value: '', label: '모든 그룹' }, // 기본 옵션 추가
    ...sampleGroups.map(group => ({
        value: group.id,
        label: group.name,
    }))
];


// --- Component ---

const CalendarMenu = () => {

  const handleTagClick = (tag) => {
    console.log(`Tag clicked:`, tag);
    // TODO: 여기에 태그 클릭 시 스케줄을 필터링하는 로직을 추가해야 합니다.
  };

  // AntD Select의 onChange는 이벤트(e)가 아닌 값(value)을 직접 전달합니다.
  const handleGroupChange = (value) => {
    console.log(`Group selected:`, value);
    // TODO: 여기에 그룹 변경 시 스케줄을 필터링하는 로직을 추가해야 합니다.
  };

  const items = [
    {
      key: '1',
      label: '태그별 보기',
      children: (
        <S.TagListContainer>
          {sampleTags.map(tag => (
            <S.TagItem key={tag.id} onClick={() => handleTagClick(tag)}>
              <S.ColorSquare color={tag.color} />
              <S.TagLabel>{tag.label}</S.TagLabel>
            </S.TagItem>
          ))}
        </S.TagListContainer>
      ),
    },
    {
      key: '2',
      label: '그룹별 보기',
      children: (
        <Select
            defaultValue="" // 기본값 설정
            style={{ width: '100%' }} // 너비 100% 설정
            onChange={handleGroupChange}
            options={groupOptions} // 가공된 데이터를 옵션으로 전달
        />
      ),
    },
  ];

  return (
      <S.MenuContainer>
        <Collapse items={items} defaultActiveKey={['1']} ghost />
      </S.MenuContainer>
  );
};

export default CalendarMenu;
