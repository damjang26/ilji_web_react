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
import axios from "axios";
import {useState} from "react";

const LoginPage = () => {

    const [file, setFile] = useState(null);
    const onFileChange = (e) => {
        setFile(e.target.files[0]);
    };
    const uploadHandler = async () => {
        if (!file) {
            alert("파일을 선택하세요.");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await axios.post('http://localhost:8090/api/firebase', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            alert("업로드 성공: " + response.data);
        } catch (error) {
            console.error("업로드 실패", error);
            alert("업로드 실패");

        }
        }
  return (
    <LoginPageContainer>
      <LoginForm>
        <LogoImage src={logo} alt="Logo" />
        <Input type="email" placeholder="이메일 주소" />
        <Button>이메일로 회원가입하기</Button>
        <Separator></Separator>
        <SocialLogin />
          <hr/>

          <div>mz-section (firebase file upload)
              <input type="file" onChange={onFileChange} />
              <button onClick={uploadHandler}>upload</button>
          </div>
      </LoginForm>
    </LoginPageContainer>
  );
};

export default LoginPage;
