import React from 'react';
import MyPage from './MyPage';
import MyPageSet from './MyPageSet';
import { useMyPage } from '../../../contexts/MyPageContext';

/**
 * MyPage와 MyPageSet 컴포넌트를 감싸는 Wrapper 컴포넌트입니다.
 * Context의 'isEditing' 상태를 통해 보기 모드와 수정 모드를 전환합니다.
 */
const MyPageWrapper = () => {
    // 상태 관리 로직을 모두 Context로 옮기고, Context에서 isEditing 상태만 가져옵니다.
    const { isEditing } = useMyPage();

    return (
        <>
            {isEditing ? <MyPageSet /> : <MyPage />}
        </>
    );
};

export default MyPageWrapper;