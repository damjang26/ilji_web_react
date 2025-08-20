import { GoogleLogin, googleLogout } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { useState } from 'react';
// npm install @react-oauth/google // Google 로그인 버튼 UI와 인증 관련 기능들을 쉽게 사용할 수 있도록 도와주는 메인 라이브러리
// npm install jwt-decode // 로그인 성공 시 돌려받는 암호화된 사용자 정보(JWT)를 우리가 사용할 수 있는 일반적인 객체 형태로 "해독"해주는 라이브러리
const SocialLogin = () => {
    const [user, setUser] = useState(null);

    return (
        <div>
            {user ? (
                <div>
                    <h3>환영합니다, {user.name}님!</h3>
                    <img src={user.picture} alt="프로필" width="50" />
                    <button onClick={() => {
                        googleLogout();
                        setUser(null);
                    }}>로그아웃</button>
                </div>
            ) : (
                <GoogleLogin
                    onSuccess={async (res) => {
                        const idToken = res.credential; // ★ 서버 검증용 원본 토큰
                        const r = await fetch(`${import.meta.env.VITE_API_BASE}/auth/google`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            credentials: "include", // (쿠키 사용하는 경우)
                            body: JSON.stringify({ idToken }),
                        });
                        const data = await r.json();
                        setUser(data.user); // 서버가 돌려준 "우리 서비스 기준 유저"
                    }}
                    onError={() => console.log("로그인 실패")}
                />
            )}
        </div>
    );
};

export default SocialLogin;