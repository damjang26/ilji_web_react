import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input, Button, Form, Typography, message, Spin, Row, Col } from 'antd';
import styled from 'styled-components';
import { api } from '../../api';

// LoginPage.jsx와 동일한 스타일을 재사용하여 디자인 일관성을 유지합니다.
const PageWrapper = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    background-color: #f0f2f5;
`;

const LoginWrapper = styled.div`
    padding: 40px;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    width: 100%;
    max-width: 400px;
    text-align: center;
`;

// [추가] 닉네임 유효성 검사 메시지를 위한 스타일 컴포넌트
const ValidationMessage = styled.div`
    font-size: 0.8rem;
    color: ${props => props.color || 'red'};
    margin-top: 4px;
    height: 1rem; // 메시지가 없을 때도 공간을 차지하여 레이아웃이 밀리는 것을 방지
    text-align: left; // 메시지를 왼쪽 정렬
`;

const { Title, Paragraph } = Typography;

const SetNicknamePage = () => {
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false); // '시작하기' 버튼 로딩 상태
    const [isChecking, setIsChecking] = useState(false); // '중복 확인' 버튼 로딩 상태
    const [isNicknameChecked, setIsNicknameChecked] = useState(false); // 닉네임 중복 확인 완료 여부
    const [nicknameMessage, setNicknameMessage] = useState({ text: '', color: 'green' }); // [추가] 닉네임 상태 메시지

    /**
     * 닉네임 중복 확인 API를 호출하는 함수
     */
    const handleCheckDuplicate = async () => {
        try {
            const nickname = form.getFieldValue('nickname');
            if (!nickname || nickname.trim() === '') {
                message.warning('닉네임을 입력해주세요.');
                return;
            }
            setIsChecking(true);
            // [수정] 이제 try-catch 구문으로 성공/실패를 판단합니다.
            await api.get(`/api/user/profile/check-nickname?nickname=${nickname}`);
            // 성공(200 OK) 시: catch 블록을 건너뛰고 이 코드가 실행됩니다.
            message.success('사용 가능한 닉네임입니다.');
            setIsNicknameChecked(true);
            setNicknameMessage({ text: '사용 가능한 닉네임입니다.', color: 'green' });
        } catch (error) {
            // 실패(409 Conflict) 시: 이 코드가 실행됩니다.
            message.error(error.response?.data?.message || '이미 사용 중인 닉네임입니다.');
            setIsNicknameChecked(false);
            setNicknameMessage({ text: '이미 사용 중인 닉네임입니다.', color: 'red' });
        } finally {
            setIsChecking(false);
        }
    };

    /**
     * 폼 제출 시 닉네임을 서버에 저장하는 함수
     */
    const onFinish = async (values) => {
        if (!isNicknameChecked) {
            message.warning('닉네임 중복 확인을 해주세요.');
            return;
        }
        setLoading(true);
        try {
            await api.post('/api/user/profile/set-nickname', { nickname: values.nickname });
            message.success('닉네임이 설정되었습니다! 메인 페이지로 이동합니다.');

            // 페이지를 새로고침하여 Main.jsx에서 사용자 정보를 다시 로드하고
            // 닉네임 유무를 재확인하여 메인 페이지로 정상 진입하게 함
            window.location.href = '/';
        } catch (error) {
            console.error('닉네임 설정 실패:', error);
            message.error('닉네임 설정에 실패했습니다. 다시 시도해주세요.');
        } finally {
            setLoading(false);
        }
    };

    /**
     * [수정] Form의 값이 변경될 때 호출되는 함수
     */
    const onValuesChange = (changedValues) => {
        // 'nickname' 필드가 변경되었다면,
        if ('nickname' in changedValues) {
            // 이전에 '중복 확인'을 통과한 상태였다면 상태를 초기화합니다.
            setIsNicknameChecked(false);
            setNicknameMessage({ text: '닉네임 중복 확인이 필요합니다.', color: 'red' });
        }
    };

    return (
        <PageWrapper>
            <LoginWrapper>
                <Spin spinning={loading}>
                    <Title level={3}>닉네임 설정</Title>
                    <Paragraph>서비스를 이용하려면 닉네임이 필요합니다.</Paragraph>
                    {/* [수정] onValuesChange 속성을 사용합니다. */}
                    <Form form={form} onFinish={onFinish} onValuesChange={onValuesChange} layout="vertical" style={{ marginTop: '24px' }}>
                        <Form.Item name="nickname" rules={[{ required: true, message: '닉네임을 입력해주세요!' }]} style={{ marginBottom: '4px' }}>
                            <Row gutter={8}>
                                <Col flex="auto">
                                    {/* [수정] Input에서 onChange를 제거합니다. */}
                                    <Input placeholder="사용할 닉네임" size="large" />
                                </Col>
                                <Col flex="100px">
                                    <Button style={{ width: '100%' }} onClick={handleCheckDuplicate} loading={isChecking} size="large">
                                        중복 확인
                                    </Button>
                                </Col>
                            </Row>
                        </Form.Item>
                        {/* [수정] ValidationMessage를 Form.Item 바깥으로 이동 */}
                        <ValidationMessage color={nicknameMessage.color}>{nicknameMessage.text}</ValidationMessage>
                        <Form.Item style={{ marginTop: '20px' }}>
                            <Button type="primary" htmlType="submit" block disabled={!isNicknameChecked} size="large">
                                시작하기
                            </Button>
                        </Form.Item>
                    </Form>
                </Spin>
            </LoginWrapper>
        </PageWrapper>
    );
};

export default SetNicknamePage;