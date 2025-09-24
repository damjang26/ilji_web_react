import styled from "styled-components";

// 전체 로그인 페이지 컨테이너: 화면 중앙에 로그인 폼을 배치합니다.
export const LoginPageContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    width: 100vw;
    background-color: #ffffff;
`;

// 로그인 폼 자체의 스타일: 배경, 그림자, 정렬 등을 정의합니다.
export const LoginForm = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
`;

// 로고 이미지의 스타일: 크기와 하단 여백을 설정합니다.
export const LogoImage = styled.img`
    width: 200px;
    padding-bottom: 50px;
`;


// ✅ [신규] 앱 소개 문구(슬로건) 스타일
export const Slogan = styled.div`
    margin: 24px 0 32px;
    font-size: 1.25rem; /* 손글씨 폰트 가독성을 위해 크기 조정 */
    color: #4A5568; /* 부드러운 회색톤으로 변경 */
    text-align: center;
    font-family: 'ShinDongYeopHandwriting', sans-serif; /* 신동엽 손글씨 폰트 적용 */
    line-height: 1.6; /* 줄 간격 확보 */
`;
