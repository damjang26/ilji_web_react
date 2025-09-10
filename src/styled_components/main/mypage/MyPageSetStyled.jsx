import styled, { css } from 'styled-components';

// 설정 페이지의 제목 스타일 (예: "프로필 수정")
export const SettingsTitle = styled.h2`
   margin-bottom: 16px;
 `;


// 프로필 수정 폼 전체를 감싸는 메인 컨테이너
export const SettingsForm = styled.form`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 600px; /* 폼의 최대 너비를 제한하여 가독성 향상 */
  padding: 20px;
  gap: 24px; /* 각 입력 필드 그룹 사이의 간격 */
`;

// 라벨과 입력 필드를 하나의 단위로 묶는 그룹
export const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px; /* 라벨과 입력 필드 사이의 간격 */
`;

// 각 입력 필드의 제목 역할을 하는 라벨
export const FormLabel = styled.label`
  font-size: 0.95rem;
  font-weight: 600;
  color: #495057;
`;

// 모든 input, textarea, select에 적용될 공통 스타일 (재사용을 위해 분리)
const inputBaseStyles = css`
  padding: 10px 12px;
  font-size: 1rem;
  border: 1px solid #ced4da;
  border-radius: 6px;
  background-color: #fff;
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;

  &:focus {
    border-color: #86b7fe;
    outline: 0;
    box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
  }

  &:disabled {
    background-color: #e9ecef;
    opacity: 1;
  }
`;

// 일반적인 텍스트, 날짜, 숫자 등을 입력하는 <input> 필드
export const FormInput = styled.input`
  ${inputBaseStyles};
`;

// 자기소개 등 여러 줄의 텍스트를 입력하는 <textarea>
export const FormTextarea = styled.textarea`
  ${inputBaseStyles};
  resize: vertical; /* 사용자가 세로 크기만 조절할 수 있도록 설정 */
  min-height: 100px;
`;

// 성별, 지역 등 정해진 옵션 중 하나를 선택하는 <select> 드롭다운
export const FormSelect = styled.select`
  ${inputBaseStyles};
`;

// '계정 비공개'와 같은 체크박스와 라벨을 가로로 정렬하기 위한 그룹
export const CheckboxGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;

  /* 라벨이 input 뒤에 오도록 순서 변경 */
  & > label {
    order: 2;
    cursor: pointer;
    font-weight: 500; /* 일반 라벨보다 얇게 */
  }
  & > input {
    order: 1;
  }
`;

// 체크박스(<input type="checkbox">) 자체의 스타일
export const FormCheckbox = styled.input`
  width: 1.15em;
  height: 1.15em;
  cursor: pointer;
`;

export const UserName = styled.h1`
    font-size: 1.5rem;
    font-weight: 700;
    margin: 0;
`;

export const UserIntroduction = styled.p`
    font-size: 1rem;
    color: #6c757d;
    margin: 4px 0 0 0;
`;

export const EditButton = styled.button`
     padding: 8px 16px;
     font-size: 0.9rem;
     font-weight: 600;
     color: #495057;
     background-color: #f1f3f5;
     border: 1px solid #dee2e6;
     border-radius: 6px;
     cursor: pointer;
     transition: background-color 0.2s;
 
     &:hover {
         background-color: #e9ecef;
     }
 `;


// '저장', '취소' 등 여러 버튼을 묶어서 정렬하는 컨테이너
export const ButtonGroup = styled.div`
   display: flex;
   justify-content: flex-end; /* 버튼들을 오른쪽으로 정렬 */
   gap: 12px; /* 버튼 사이의 간격 */
   margin-top: 24px; /* 폼의 마지막 요소와 간격 확보 */
   width: 100%;
 `;

// 폼 제출을 위한 '저장' 버튼
export const SubmitButton = styled.button`
  padding: 12px 24px;
  font-size: 1.05rem;
  font-weight: 600;
  color: #fff;
  background-color: #0d6efd;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  /* margin-top: 16px; */ /* 다른 필드와 간격을 둠 - 현재는 ButtonGroup에서 관리 */
  transition: background-color 0.2s ease-in-out;

  flex: 1; /* 버튼 그룹 내에서 유연하게 공간을 차지하도록 설정 */
  &:hover {
    background-color: #0b5ed7;
  }
`;

// 작업을 취소하고 이전 페이지로 돌아가는 '취소' 버튼
export const CancelButton = styled(SubmitButton)`
   background-color: #6c757d; /* 눈에 덜 띄는 회색 계열 색상 */
 
   &:hover {
     background-color: #5c636a;
   }
 `;