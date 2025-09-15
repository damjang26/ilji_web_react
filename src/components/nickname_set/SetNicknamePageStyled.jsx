import styled from 'styled-components';

// LoginPage.jsx와 동일한 스타일을 재사용하여 디자인 일관성을 유지합니다.
export const PageWrapper = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    background-color: #f0f2f5;
`;

// 닉네임 입력 폼, 버튼 등을 감싸는 흰색 카드 UI
export const LoginWrapper = styled.div`
    padding: 40px;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    width: 100%;
    max-width: 400px;
    text-align: center;
`;

// 닉네임 유효성 검사 메시지를 위한 스타일 컴포넌트
export const ValidationMessage = styled.div`
    font-size: 0.8rem;
    color: ${props => props.color || 'red'};
    margin-top: 4px;
    height: 1rem; // 메시지가 없을 때도 공간을 차지하여 레이아웃이 밀리는 것을 방지
    text-align: left; // 메시지를 왼쪽 정렬
`;