import React from 'react';
import {Spin} from 'antd';
import {LoadingOutlined} from '@ant-design/icons';
import styled from 'styled-components';

// 로딩 스피너를 감싸서 중앙에 배치하기 위한 스타일
const SpinnerWrapper = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
    min-height: 100px; /* 컨텐츠가 없을 때 최소 높이 확보 */
`;

// 스피너 아이콘 커스텀
const antIcon = (
    <LoadingOutlined
        style={{
            fontSize: 32, // 아이콘 크기
            color: '#7b5fff', // 우리 보라색!
        }}
        spin
    />
);

const LoadingSpinner = () => (
    <SpinnerWrapper>
        <Spin indicator={antIcon}/>
    </SpinnerWrapper>
);

export default LoadingSpinner;