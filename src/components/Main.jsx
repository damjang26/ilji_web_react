import React, { useEffect, useState } from 'react';
import { Route, Routes, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { Spin } from 'antd';
import { api } from '../api';
import FullCalendarExample from "./main/calendar/FullCalendar.jsx";
import Post from "./main/post/Post.jsx"; 
import MyPageSet from "./main/mypage/MyPageSet.jsx"; // [추가]
import MyPageWrapper from "./main/mypage/MyPage.jsx"; // [수정] MyPageWrapper를 import합니다.


const MainContent = styled.main`
    flex-grow: 1; /* 사이드바를 제외한 나머지 공간을 모두 차지 */
    display: flex;
    flex-direction: column;
    height: 100vh;
    box-sizing: border-box;
    padding-top: 30px;
`;

const LoadingWrapper = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
`;

const Main = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkUserProfile = async () => {
            try {
                // 백엔드에서 현재 로그인된 사용자의 프로필 정보를 가져옵니다.
                const response = await api.get('/api/user/profile');
                const userProfile = response.data;

                // 닉네임이 null이거나 비어있는지 확인합니다.
                if (!userProfile.nickname) {
                    // 닉네임이 없으면 닉네임 설정 페이지로 강제 이동시킵니다.
                    // { replace: true } 옵션으로 뒤로가기를 막습니다.
                    navigate('/set-nickname', { replace: true });
                }
            } catch (error) {
                console.error("프로필 정보 확인 실패:", error);
                // 에러 발생 시 로그인 페이지로 보내는 등의 예외 처리도 가능합니다.
                // navigate('/login'); 
            } finally {
                // API 호출 성공/실패 여부와 관계없이 로딩 상태를 해제합니다.
                setLoading(false);
            }
        };

        checkUserProfile();
    }, [navigate]);

    // 프로필을 확인하는 동안 로딩 화면을 보여줍니다.
    if (loading) {
        return (
            <MainContent>
                <LoadingWrapper>
                    <Spin size="large" />
                </LoadingWrapper>
            </MainContent>
        );
    }

    return (
        <MainContent>
            <Routes>
                <Route path="/" element={<FullCalendarExample/>}/>
                <Route path="/mypage/:userId?" element={<MyPageWrapper />} />
                <Route path="/mypageset" element={<MyPageSet />} />
                <Route path="/post/*" element={<Post/>}/>
            </Routes>
        </MainContent>
    );
}

export default Main;