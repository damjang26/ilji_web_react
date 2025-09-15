import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input, Button, Form, Typography, message, Spin, Row, Col } from 'antd';
import styled from 'styled-components';
import { PageWrapper, LoginWrapper, ValidationMessage } from './SetNicknamePageStyled';
import { api } from '../../api';

const { Title, Paragraph } = Typography;

const SetNicknamePage = () => {
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false); // '시작하기' 버튼 로딩 상태
    const [isChecking, setIsChecking] = useState(false); // '중복 확인' 버튼 로딩 상태
    const [isNicknameChecked, setIsNicknameChecked] = useState(false); // 닉네임 중복 확인 완료 여부
    const [nicknameMessage, setNicknameMessage] = useState({ text: '', color: 'green' }); // 닉네임 상태 메시지

    /*** 닉네임 중복 확인 API를 호출하는 함수 */
    const handleCheckDuplicate = async () => {
        try {
            const nickname = form.getFieldValue('nickname');
            if (!nickname || nickname.trim() === '') {
                message.warning('닉네임을 입력해주세요.');
                return;
            }
            setIsChecking(true);
            await api.get(`/api/user/profile/check-nickname?nickname=${nickname}`);
            message.success('사용 가능한 닉네임입니다.');
            setIsNicknameChecked(true);
            setNicknameMessage({ text: '사용 가능한 닉네임입니다.', color: 'green' });
        } catch (error) {
            message.error(error.response?.data?.message || '이미 사용 중인 닉네임입니다.');
            setIsNicknameChecked(false);
            setNicknameMessage({ text: '이미 사용 중인 닉네임입니다.', color: 'red' });
        } finally {
            setIsChecking(false);
        }
    };

    /*** 폼 제출 시 닉네임을 서버에 저장하는 함수 */
    const onFinish = async (values) => {
        if (!isNicknameChecked) {
            message.warning('닉네임 중복 확인을 해주세요.');
            return;
        }
        setLoading(true);
        try {
            await api.post('/api/user/profile/set-nickname', { nickname: values.nickname });
            message.success('닉네임이 설정되었습니다! 메인 페이지로 이동합니다.');
            // 페이지를 새로고침하여 Main.jsx에서 사용자 정보를 다시 로드하고, 닉네임 유무를 재확인하여 메인 페이지로 정상 진입하게 함
            window.location.href = '/';
        } catch (error) {
            console.error('닉네임 설정 실패:', error);
            message.error('닉네임 설정에 실패했습니다. 다시 시도해주세요.');
        } finally {
            setLoading(false);
        }
    };

    /*** [수정] Form의 값이 변경될 때 호출되는 함수*/
    const onValuesChange = (changedValues) => {
        // 'nickname' 필드가 변경되었다면, 이전에 '중복 확인'을 통과한 상태였다면 상태를 초기화
        if ('nickname' in changedValues) {
            setIsNicknameChecked(false);
            // [수정] 입력된 닉네임이 있을 때만 '중복 확인 필요' 메시지를 보여줌
            if (changedValues.nickname) {
                setNicknameMessage({ text: '닉네임 중복 확인이 필요합니다.', color: 'red' });
            } else {
                setNicknameMessage({ text: '', color: 'red' });
            }
        }
    };

    return (
        <PageWrapper>
            <LoginWrapper>
                <Spin spinning={loading}>
                    <Title level={3}>닉네임 설정</Title>
                    <Paragraph>서비스를 이용하려면 닉네임이 필요합니다.</Paragraph>
                    {/* [수정] onValuesChange 속성을 사용 */}
                    <Form form={form} onFinish={onFinish} onValuesChange={onValuesChange} layout="vertical" style={{ marginTop: '24px' }} >
                        {/* [수정] rules에서 required 메시지를 제거하여 중복 메시지를 방지 */}
                        <Form.Item name="nickname" rules={[{ required: true, message: ' ' }]} style={{ marginBottom: '4px' }}>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <Input placeholder="사용할 닉네임" size="large" style={{ flex: 1 }} />
                                <Button
                                    style={{ width: '100px' }}
                                    onClick={handleCheckDuplicate}
                                    loading={isChecking}
                                    size="large"
                                >
                                    중복 확인
                                </Button>
                            </div>
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