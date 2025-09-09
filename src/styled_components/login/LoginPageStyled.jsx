import styled from "styled-components";

// 전체 로그인 페이지 컨테이너: 화면 중앙에 로그인 폼을 배치합니다.
export const LoginPageContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100vw;
  background-color: #f0f2f5;
`;

// 로그인 폼 자체의 스타일: 배경, 그림자, 정렬 등을 정의합니다.
export const LoginForm = styled.div`
  padding: 40px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 360px;
`;

// 로고 이미지의 스타일: 크기와 하단 여백을 설정합니다.
export const LogoImage = styled.img`
  width: 150px;
  margin-bottom: 30px;
`;

// 입력 필드(예: 이메일)의 스타일: 너비, 패딩, 테두리 등을 정의합니다.
export const Input = styled.input`
  width: 100%;
  padding: 12px;
  margin-bottom: 15px;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
  font-size: 1rem;
`;

// 일반 버튼(예: 이메일로 회원가입하기)의 스타일: 배경색, 글자색, 호버 효과 등을 정의합니다.
export const Button = styled.button`
  width: 100%;
  padding: 12px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;

  &:hover {
    background-color: #0056b3;
  }
`;

// 구분선("또는")의 스타일: 양쪽에 선을 추가하여 시각적으로 분리합니다.
export const Separator = styled.div`
  display: flex;
  align-items: center;
  text-align: center;
  width: 100%;
  margin: 25px 0;

  &::before,
  &::after {
    content: '';
    flex: 1;
    border-bottom: 1px solid #ccc;
  }

  &:not(:empty)::before {
    margin-right: .25em;
  }

  &:not(:empty)::after {
    margin-left: .25em;
  }
`;
