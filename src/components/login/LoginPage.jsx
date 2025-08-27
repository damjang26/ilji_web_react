import SocialLogin from "../account/GoogleLogin";
import logo from '../../static/image/logo.png';
import {
    LoginPageContainer,
    LoginForm,
    LogoImage,
    Input,
    Button,
    Separator
} from "../../styled_components/login/LoginPageStyled.jsx";

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
