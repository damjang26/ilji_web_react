import {GoogleLogin} from "@react-oauth/google";
import {useAuth} from "../../AuthContext";

const SocialLogin = () => {
    const {loginWithGoogle, error} = useAuth();

    return (
        // ✅ [수정] 버튼과 에러 메시지를 세로로 정렬하고 간격을 줍니다.
        <div
            style={{
                width: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "15px",
            }}
        >
            <GoogleLogin
                width="280"
                onSuccess={async (res) => {
                    try {
                        await loginWithGoogle(res.credential);
                        console.log("Login successful!");
                    } catch (err) {
                        console.error("Error during login process:", err);
                    }
                }}
                onError={() => {
                    console.log("Google login failed");
                }}
            />
            {error && (
                // ✅ [수정] 에러 메시지 스타일을 개선하여 가독성을 높입니다.
                <p
                    style={{
                        color: "#c53030", // 차분한 빨간색 텍스트
                        backgroundColor: "#ffe8e8", // 연한 빨간색 배경
                        padding: "10px 15px",
                        borderRadius: "8px",
                        fontSize: "0.875rem",
                        textAlign: "center",
                        maxWidth: "280px", // 버튼 너비와 맞춤
                        margin: 0, // 기본 마진 제거
                    }}
                >
                    {error.message || "An error occurred during login."}
                </p>
            )}
        </div>
    );
};

export default SocialLogin;
