import { GoogleLogin, googleLogout } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { useState } from 'react';
import axios from "axios";
// npm install @react-oauth/google // Google 로그인 버튼 UI와 인증 관련 기능들을 쉽게 사용할 수 있도록 도와주는 메인 라이브러리
// npm install jwt-decode // 로그인 성공 시 돌려받는 암호화된 사용자 정보(JWT)를 우리가 사용할 수 있는 일반적인 객체 형태로 "해독"해주는 라이브러리
const SocialLogin = () => {
    const [user, setUser] = useState(null);

    return (
        <div>
            {user ? (
                <div>
                    <h3>환영합니다, {user.name}님!</h3>
                    <img src={user.picture} alt="프로필" width="50" referrerPolicy="no-referrer" />
                    <button onClick={() => {
                        googleLogout();
                        setUser(null);
                    }}>로그아웃</button>
                </div>
            ) : (
                <GoogleLogin
                    onSuccess={async (res) => {
                        const idToken = res.credential;
                        console.log("Google ID Token:", idToken);

                        try {
                            // 1. axios를 사용해 우리 백엔드 서버로 ID 토큰을 보내서 로그인/회원가입 처리를 요청합니다.
                            const response = await axios.post('/api/auth/google', { // 백엔드 주소는 실제 환경에 맞게 수정해야 합니다.
                                token: idToken
                            });

                            // axios는 자동으로 JSON 응답을 파싱해주므로 response.json() 과정이 필요 없습니다.
                            const { appToken, user } = response.data;

                            // 2. 백엔드로부터 우리 서비스 전용 토큰을 받아서 저장합니다.
                            localStorage.setItem('token', appToken); // 예시: localStorage에 토큰 저장

                            // 3. 로그인 상태를 업데이트합니다.
                            console.log("Login to our service was successful:", user);
                            setUser(user); // 백엔드에서 받은 사용자 정보로 상태 업데이트

                        } catch (error) {
                            // axios 에러는 error.response.data에 서버가 보낸 상세 정보가 담겨있을 수 있습니다.
                            console.error("Error during server authentication:", error.response ? error.response.data : error.message);
                        }
                    }}
                    onError={() => console.log("로그인 실패")}
                />
            )}
        </div>
    );
};

export default SocialLogin;