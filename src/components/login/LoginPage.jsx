import SocialLogin from "../account/GoogleLogin";
import logo from '../../static/image/logo.png';
import {
    LoginPageContainer,
    LoginForm,
    LogoImage,
    Slogan, // ✅ [추가] Slogan 컴포넌트 임포트
} from "../../styled_components/login/LoginPageStyled.jsx";

const LoginPage = () => {
    return (
        <LoginPageContainer>
            <LoginForm>
                <LogoImage src={logo} alt="Logo"/>
                <SocialLogin/>
                <Slogan>
                    Organize your schedule and share life’s moments with the people who matter. asd
                </Slogan>

            </LoginForm>
        </LoginPageContainer>
    );
};

export default LoginPage;
