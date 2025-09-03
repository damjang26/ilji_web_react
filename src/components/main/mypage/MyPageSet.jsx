import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom'; // 페이지 이동을 위해 추가
import { useAuth } from '../../../AuthContext'; // AuthContext에서 사용자 정보를 가져오기 위함
import { api } from '../../../api'; // 설정해두신 axios 인스턴스를 직접 가져옵니다.
import ImageBox from './ImageBox'; // 새로 만든 ImageBox 컴포넌트를 가져옵니다.

// MyPage.jsx와 레이아웃을 공유하기 위해 기존 스타일 컴포넌트 가져오기
import { MyPageContainer, MypageImg, ContentBox, MyPageMain, FeatureContent, ImgWrapper } from '../../../styled_components/main/mypage/MyPageStyled';

// MyPageSet.jsx 전용 폼 스타일 컴포넌트 가져오기
import {
    SettingsForm,
    FormGroup,
    FormLabel,
    FormInput,
    FormTextarea,
    FormSelect,
    CheckboxGroup,
    FormCheckbox,
    SubmitButton,
    ButtonGroup,
    CancelButton
} from '../../../styled_components/main/mypage/MyPageSetStyled';

const MyPageSet = () => {
    const { user } = useAuth(); // 로그인한 사용자 정보 (예: { id: 1, email: '...' })
    const navigate = useNavigate(); // useNavigate 훅 사용
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingImageType, setEditingImageType] = useState(null); // 'profileImage' 또는 'bannerImage'

    // 프로필 정보를 서버에서 가져오는 함수
    const fetchProfile = useCallback(async () => {
        if (!user || !user.id) {
            setLoading(false);
            setError('로그인 정보가 없습니다.');
            return;
        }

        try {
            setLoading(true);
            // [API 호출] api 객체를 사용해 직접 프로필 정보를 요청합니다.
            const response = await api.get(`/api/profiles/user/${user.id}`);
            const data = response.data;
            const formattedBirthdate = data.birthdate ? data.birthdate.split('T')[0] : '';
            setProfile({ ...data, birthdate: formattedBirthdate });
        } catch (err) {
            console.error("프로필 조회 실패:", err);
            setError('프로필 정보를 불러오는 데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    }, [user]);

    // 컴포넌트가 처음 화면에 나타날 때, 프로필 정보를 가져옵니다.
    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    // 입력 폼의 내용이 바뀔 때마다 profile 상태를 업데이트합니다.
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setProfile(prevProfile => ({
            ...prevProfile,
            // 입력 필드 타입이 'checkbox'이면 checked 상태(true/false)를, 아니면 기존처럼 value를 저장합니다.
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    // 이미지 클릭 시 모달 열기
    const handleImageClick = (imageType) => {
        setEditingImageType(imageType);
        setIsModalOpen(true);
    };

    // 모달에서 '확인' 눌렀을 때 프로필 상태 업데이트
    const handleImageUpdate = async (imageType, newUrl) => {
        if (!profile) return;

        // 먼저 화면에 즉시 반영되도록 로컬 상태를 업데이트
        const updatedProfile = { ...profile, [imageType]: newUrl };
        setProfile(updatedProfile);

        try {
            // 서버에 변경된 전체 프로필 정보를 전송하여 저장
            await api.put(`/api/profiles/user/${user.id}`, updatedProfile);
            alert('이미지가 성공적으로 업데이트되었습니다.');
        } catch (err) {
            console.error("이미지 업데이트 실패:", err);
            alert('이미지 업데이트 중 오류가 발생했습니다.');
            // 실패 시 원래 데이터로 복구하기 위해 다시 fetch
            fetchProfile();
        }
    };

    // '저장하기' 버튼을 눌렀을 때 실행되는 함수
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user || !user.id) {
            alert('사용자 정보가 없어 저장할 수 없습니다.');
            return;
        }
        try {
            // [API 호출] api 객체를 사용해 수정된 프로필 정보를 서버에 전송합니다.
            await api.put(`/api/profiles/user/${user.id}`, profile);
            alert('프로필이 성공적으로 업데이트되었습니다.');
            navigate('/mypage'); // 성공 시 마이페이지로 이동
        } catch (err) {
            console.error("프로필 업데이트 실패:", err);
            alert('프로필 업데이트 중 오류가 발생했습니다.');
        }
    };

    if (loading) return <div>로딩 중...</div>;
    if (error) return <div style={{ color: 'red' }}>{error}</div>;
    if (!profile) return <div>프로필 정보가 없습니다.</div>;

    return (
        <MyPageContainer>
            {/* MyPage.jsx와 동일한 배경 배너 */}
            <MypageImg
                style={{
                    backgroundImage: `url(${profile.bannerImage || ''})`,
                    cursor: 'pointer',
                    position: 'relative'
                }}
                onClick={() => handleImageClick('bannerImage')}
            >
            </MypageImg>

            {/* MyPage.jsx와 동일한 흰색 콘텐츠 박스 */}
            <ContentBox>
                <ImgWrapper style={{ marginTop: '-20px', marginBottom: '20px' }}>
                </ImgWrapper>
                <MyPageMain>
                    {/* 콘텐츠를 중앙에 배치하기 위한 래퍼 */}
                    <FeatureContent>
                        <SettingsForm onSubmit={handleSubmit}>
                            <h2 style={{ marginBottom: '16px' }}>프로필 수정</h2>

                            <FormGroup>
                                <FormLabel htmlFor="email">이메일</FormLabel>
                                <FormInput id="email" type="email" value={profile.email || ''} disabled />
                            </FormGroup>

                            <FormGroup>
                                <FormLabel htmlFor="nickname">닉네임</FormLabel>
                                <FormInput id="nickname" type="text" name="nickname" value={profile.nickname || ''} onChange={handleInputChange} />
                            </FormGroup>

                            <FormGroup>
                                <FormLabel htmlFor="birthdate">생년월일</FormLabel>
                                <FormInput id="birthdate" type="date" name="birthdate" value={profile.birthdate || ''} onChange={handleInputChange} />
                            </FormGroup>

                            <FormGroup>
                                <FormLabel htmlFor="phoneNumber">연락처</FormLabel>
                                <FormInput id="phoneNumber" type="tel" name="phoneNumber" value={profile.phoneNumber || ''} onChange={handleInputChange} placeholder="010-1234-5678" />
                            </FormGroup>

                            <FormGroup>
                                <FormLabel htmlFor="gender">성별</FormLabel>
                                <FormSelect id="gender" name="gender" value={profile.gender || ''} onChange={handleInputChange}>
                                    <option value="">선택안함</option>
                                    <option value="M">남성</option>
                                    <option value="F">여성</option>
                                    <option value="O">기타</option>
                                </FormSelect>
                            </FormGroup>

                            <FormGroup>
                                <FormLabel htmlFor="region">지역</FormLabel>
                                <FormInput id="region" type="text" name="region" value={profile.region || ''} onChange={handleInputChange} />
                            </FormGroup>

                            <FormGroup>
                                <FormLabel htmlFor="bio">자기소개</FormLabel>
                                <FormTextarea id="bio" name="bio" value={profile.bio || ''} onChange={handleInputChange} />
                            </FormGroup>

                            <FormGroup>
                                <FormLabel htmlFor="interests">관심사</FormLabel>
                                <FormInput id="interests" type="text" name="interests" value={profile.interests || ''} onChange={handleInputChange} placeholder="쉼표(,)로 구분하여 입력" />
                            </FormGroup>

                            <CheckboxGroup>
                                <FormCheckbox id="isPrivate" type="checkbox" name="isPrivate" checked={profile.isPrivate || false} onChange={handleInputChange} />
                                <FormLabel htmlFor="isPrivate">계정 비공개</FormLabel>
                            </CheckboxGroup>

                            <ButtonGroup>
                                <CancelButton type="button" onClick={() => navigate('/mypage')}>
                                    취소
                                </CancelButton>
                                <SubmitButton type="submit">저장</SubmitButton>
                            </ButtonGroup>
                        </SettingsForm>
                    </FeatureContent>
                </MyPageMain>
            </ContentBox>

            <ImageBox
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                currentImageUrl={profile[editingImageType]}
                onConfirm={handleImageUpdate}
                imageType={editingImageType}
            />
        </MyPageContainer>
    );
};

export default MyPageSet;