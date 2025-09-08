import React, { useState, useEffect } from 'react';
import { useMyPage } from '../../../contexts/MyPageContext';
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
    SettingsTitle, SubmitButton,
    ButtonGroup,
    CancelButton
} from '../../../styled_components/main/mypage/MyPageSetStyled';

const MyPageSet = () => {
    // 1. Context에서 필요한 상태와 함수들을 가져옵니다.
    const { profile: globalProfile, loading, error, updateProfile, handleCancel } = useMyPage();

    // 2. 이 컴포넌트의 폼 입력을 위한 '로컬 상태'를 만듭니다.
    const [localProfile, setLocalProfile] = useState(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingImageType, setEditingImageType] = useState(null); // 'profileImage' 또는 'bannerImage'

    // 3. 전역 상태(globalProfile)가 로드되면, 그 데이터를 기반으로 로컬 상태(localProfile)를 초기화합니다.
    useEffect(() => {
        if (globalProfile) {
            // 날짜 형식을 'YYYY-MM-DD'로 맞춥니다.
            const formattedBirthdate = globalProfile.birthdate ? globalProfile.birthdate.split('T')[0] : '';
            setLocalProfile({ ...globalProfile, birthdate: formattedBirthdate });
        }
    }, [globalProfile]);

    // 4. 입력 폼의 내용이 바뀔 때마다 '로컬 상태'만 업데이트합니다. (전역 상태는 건드리지 않음)
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setLocalProfile(prevProfile => ({
            ...prevProfile,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleImageClick = (imageType) => {
        setEditingImageType(imageType);
        setIsModalOpen(true);
    };

    const handleImageUpdate = async (imageType, newUrl) => {
        if (!localProfile) return;
        const updatedLocalProfile = { ...localProfile, [imageType]: newUrl };
        setLocalProfile(updatedLocalProfile); // 로컬 UI 즉시 업데이트

        try {
            // 서버에 변경된 정보를 전송하고, 성공 시 '전역 상태'를 업데이트합니다.
            const response = await api.put(`/api/profiles/user/${globalProfile.userId}`, updatedLocalProfile);
            updateProfile(response.data); // 이미지는 즉시 업데이트 되므로 updateProfile을 호출
            alert('이미지가 성공적으로 업데이트되었습니다.');
        } catch (err) {
            console.error("이미지 업데이트 실패:", err);
            alert('이미지 업데이트 중 오류가 발생했습니다.');
            // 실패 시 로컬 상태를 이전 전역 상태로 롤백할 수 있습니다.
            setLocalProfile(globalProfile);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!globalProfile || !globalProfile.userId) {
            alert('사용자 정보가 없어 저장할 수 없습니다.');
            return;
        }
        try {
            // Context에 있는 updateProfile 함수를 호출하고 성공을 기다립니다.
            await updateProfile(localProfile);

            alert('프로필이 성공적으로 업데이트되었습니다.');
            handleCancel(); // 성공 후 보기 모드로 돌아갑니다.
        } catch (err) {
            alert('프로필 업데이트 중 오류가 발생했습니다.');
        }
    };

    if (loading && !localProfile) return <div>로딩 중...</div>; // 초기 로딩 강화
    if (error) return <div style={{ color: 'red' }}>{error}</div>;
    if (!localProfile) return <div>프로필 정보를 불러오는 중입니다...</div>;

    return (
        <MyPageContainer>
            <MypageImg
                style={{ backgroundImage: `url(${localProfile.bannerImage || ''})` }}
                onClick={() => handleImageClick('bannerImage')}
            />

            {/* MyPage.jsx와 동일한 흰색 콘텐츠 박스 */}
            <ContentBox>
                {/* 배너와 폼 사이의 간격을 위한 빈 공간 */}
                <ImgWrapper />
                <MyPageMain>
                    <FeatureContent>
                        <SettingsForm onSubmit={handleSubmit}>
                            <SettingsTitle>프로필 수정</SettingsTitle>

                            <FormGroup>
                                <FormLabel htmlFor="email">이메일</FormLabel>
                                <FormInput id="email" type="email" value={localProfile.email || ''} disabled />
                            </FormGroup>

                            <FormGroup>
                                <FormLabel htmlFor="nickname">닉네임</FormLabel>
                                <FormInput id="nickname" type="text" name="nickname" value={localProfile.nickname || ''} onChange={handleInputChange} />
                            </FormGroup>

                            <FormGroup>
                                <FormLabel htmlFor="birthdate">생년월일</FormLabel>
                                <FormInput id="birthdate" type="date" name="birthdate" value={localProfile.birthdate || ''} onChange={handleInputChange} />
                            </FormGroup>

                            <FormGroup>
                                <FormLabel htmlFor="phoneNumber">연락처</FormLabel>
                                <FormInput id="phoneNumber" type="tel" name="phoneNumber" value={localProfile.phoneNumber || ''} onChange={handleInputChange} placeholder="010-1234-5678" />
                            </FormGroup>

                            <FormGroup>
                                <FormLabel htmlFor="gender">성별</FormLabel>
                                <FormSelect id="gender" name="gender" value={localProfile.gender || ''} onChange={handleInputChange}>
                                    <option value="">선택안함</option>
                                    <option value="M">남성</option>
                                    <option value="F">여성</option>
                                    <option value="O">기타</option>
                                </FormSelect>
                            </FormGroup>

                            <FormGroup>
                                <FormLabel htmlFor="region">지역</FormLabel>
                                <FormInput id="region" type="text" name="region" value={localProfile.region || ''} onChange={handleInputChange} />
                            </FormGroup>

                            <FormGroup>
                                <FormLabel htmlFor="bio">자기소개</FormLabel>
                                <FormTextarea id="bio" name="bio" value={localProfile.bio || ''} onChange={handleInputChange} />
                            </FormGroup>

                            <FormGroup>
                                <FormLabel htmlFor="interests">관심사</FormLabel>
                                <FormInput id="interests" type="text" name="interests" value={localProfile.interests || ''} onChange={handleInputChange} placeholder="쉼표(,)로 구분하여 입력" />
                            </FormGroup>

                            <CheckboxGroup>
                                <FormCheckbox id="isPrivate" type="checkbox" name="isPrivate" checked={localProfile.isPrivate || false} onChange={handleInputChange} />
                                <FormLabel htmlFor="isPrivate">계정 비공개</FormLabel>
                            </CheckboxGroup>

                            <ButtonGroup>
                                <CancelButton type="button" onClick={handleCancel}>
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
                currentImageUrl={localProfile ? localProfile[editingImageType] : ''}
                onConfirm={handleImageUpdate}
                imageType={editingImageType}
            />
        </MyPageContainer>
    );
};

export default MyPageSet;