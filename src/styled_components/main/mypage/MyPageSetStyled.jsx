import styled, {css} from 'styled-components';

// 설정 페이지의 제목 스타일 (예: "프로필 수정")
export const SettingsTitle = styled.h2`
    font-size: 1.8rem;
    font-weight: 700;
    margin-bottom: 40px;
    text-align: center; /* 제목도 중앙 정렬 */
    color: #343a40;
`;


// 프로필 수정 폼 전체를 감싸는 메인 컨테이너
export const SettingsForm = styled.form`
    display: flex;
    flex-direction: column;
    width: 100%;
    max-width: 600px; /* 폼의 최대 너비 지정 */
    margin: 0 auto; /* 폼을 중앙에 배치 */
`;

// 라벨과 입력 필드를 하나의 단위로 묶는 그룹
export const FormGroup = styled.div`
    display: flex;
    flex-direction: row; /* ✅ [요청] 라벨과 입력을 가로로 배치 */
    align-items: flex-start; /* 라벨과 입력창 상단 정렬 (textarea 대응) */
    gap: 16px; /* 라벨과 입력창 사이 간격 */
    margin-bottom: 24px; /* 그룹 간 간격 조정 */
    width: 100%;
`;

// 각 입력 필드의 제목 역할을 하는 라벨
export const FormLabel = styled.label`
    flex-basis: 120px; /* ✅ [추가] 라벨의 너비를 120px로 고정 */
    flex-shrink: 0; /* 라벨 너비가 줄어들지 않도록 설정 */
    font-size: 0.9rem;
    font-weight: 600;
    color: #4a5568; /* 약간 부드러운 검정색 */
    padding-top: 12px; /* ✅ [추가] 입력창과 수직 중앙 정렬을 위한 패딩 */
`;

// 모든 input, textarea, select에 적용될 공통 스타일 (재사용을 위해 분리)
const commonInputStyles = css`
    width: 100%;
    height: 44px; /* 높이 통일 */
    padding: 0 16px;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    background-color: #fdfdff;
    font-size: 1rem;
    color: #2d3748;
    transition: all 0.2s ease-in-out;

    &:focus {
        border-color: #7b5fff;
        box-shadow: 0 0 0 3px rgba(123, 95, 255, 0.15);
        outline: none;
    }

    &::placeholder {
        color: #a0aec0;
    }

    &:disabled {
        background-color: #f7fafc;
        color: #718096;
        cursor: not-allowed;
    }
`;

// 일반적인 텍스트, 날짜, 숫자 등을 입력하는 <input> 필드
export const FormInput = styled.input`
    ${commonInputStyles}
`;

// 자기소개 등 여러 줄의 텍스트를 입력하는 <textarea>
export const FormTextarea = styled.textarea`
    ${commonInputStyles}
    height: auto; /* textarea는 자동 높이 */
    min-height: 120px;
    padding: 12px 16px; /* 상하 여백 추가 */
    resize: vertical;
`;

// 성별, 지역 등 정해진 옵션 중 하나를 선택하는 <select> 드롭다운
export const FormSelect = styled.select`
    ${commonInputStyles}
`;

// '계정 비공개'와 같은 체크박스와 라벨을 가로로 정렬하기 위한 그룹
export const CheckboxGroup = styled.div`
    display: flex;
    align-items: center;
`;

// 체크박스(<input type="checkbox">) 자체의 스타일
export const FormCheckbox = styled.input`
    margin-right: 8px;
`;

// '저장', '취소' 등 여러 버튼을 묶어서 정렬하는 컨테이너
export const ButtonGroup = styled.div` // 취소, 저장 버튼 그룹
    display: flex;
    justify-content: center; /* 버튼들을 중앙으로 */
    gap: 16px;
    margin-top: 40px;
    width: 100%;
`;

// ✅ [수정] 공통 버튼 스타일 정의
const BaseButton = styled.button`
    padding: 12px 28px;
    font-size: 1rem;
    font-weight: 600;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease-in-out;
    min-width: 120px;

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
`;

// 폼 제출을 위한 '저장' 버튼
export const SubmitButton = styled(BaseButton)`
    color: white;
    /* ✅ [적용] 요청하신 3색 그라데이션 배경 */
    background: linear-gradient(45deg, #97c0ff, #7b5fff, #ff7eb9);
    box-shadow: 0 4px 15px rgba(123, 95, 255, 0.3);

    &:hover:not(:disabled) {
        box-shadow: 0 6px 20px rgba(123, 95, 255, 0.4);
    }
`;

// 작업을 취소하고 이전 페이지로 돌아가는 '취소' 버튼
export const CancelButton = styled(BaseButton)`
    background-color: #e2e8f0;
    color: #4a5568;

    &:hover:not(:disabled) {
        background-color: #cbd5e0;
    }
`;

// 중복 확인 버튼
export const CheckButton = styled.button`
    /* ✅ [수정] 디자인 개선 */
    height: 44px;
    padding: 0 16px;
    border: 1px solid #7b5fff;
    background-color: #f0edff;
    color: #7b5fff;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease-in-out;
    color: white;
    flex-shrink: 0; /* 찌그러지지 않게 */

    &:hover:not(:disabled) {
        background-color: #7b5fff;
        color: white;
    }

    &:disabled {
        background-color: #e2e8f0;
        border-color: #e2e8f0;
        color: #a0aec0;
        cursor: not-allowed;
    }
`;
