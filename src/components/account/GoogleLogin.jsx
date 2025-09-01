import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../AuthContext';

const SocialLogin = () => {
    const { loginWithGoogle, error } = useAuth();

    return (
        <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
            <GoogleLogin
                width="280"
                onSuccess={async (res) => {
                    try {
                        await loginWithGoogle(res.credential);
                        console.log("로그인 성공!");
                    } catch (err) {
                        console.error("로그인 처리 중 에러 발생:", err);
                    }
                }}
                onError={() => {
                    console.log("Google 로그인 실패");
                }}
            />
            {error && <p style={{ color: 'red', fontSize: '0.8rem', marginTop: '10px' }}>{error.message || '로그인 중 에러가 발생했습니다.'}</p>}
        </div>
    );
};

export default SocialLogin;
