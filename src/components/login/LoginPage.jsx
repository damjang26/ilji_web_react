import styled from "styled-components";
import SocialLogin from "../account/GoogleLogin";
import logo from '../../static/image/logo.png';

const LoginPageContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100vw;
  background-color: #f0f2f5;
`;

const LoginForm = styled.div`
  padding: 40px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 360px;
`;

const LogoImage = styled.img`
  width: 150px;
  margin-bottom: 30px;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  margin-bottom: 15px;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
  font-size: 1rem;
`;

const Button = styled.button`
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

const Separator = styled.div`
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

const LoginPage = () => {
  return (
    <LoginPageContainer>
      <LoginForm>
        <LogoImage src={logo} alt="Logo" />
        <Input type="email" placeholder="이메일 주소" />
        <Button>이메일로 회원가입하기</Button>
        <Separator></Separator>
        <SocialLogin />
      </LoginForm>
    </LoginPageContainer>
  );
};

export default LoginPage;
