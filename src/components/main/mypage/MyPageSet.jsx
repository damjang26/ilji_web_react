import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // [추가] 페이지 이동을 위해 useNavigate import
import { message } from 'antd'; // [수정] antd Row, Col 제거
import styled from 'styled-components';
import { useMyPage } from '../../../contexts/MyPageContext';
import ImageBox from './ImageBox';
import { api } from '../../../api'; // [추가] API 통신을 위해 import
 
// MyPage.jsx와 레이아웃을 공유하기 위해 기존 스타일 컴포넌트
import { MyPageContainer, MypageImg, ContentBox, MyPageMain, FeatureContent, ImgWrapper } from '../../../styled_components/main/mypage/MyPageStyled';

// MyPageSet.jsx 전용 폼 스타일 컴포넌트
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
    CancelButton,
    CheckButton // ✅ [추가] 중복 확인 버튼 스타일
} from '../../../styled_components/main/mypage/MyPageSetStyled';

// ✅ [추가] 입력 필드와 버튼을 가로로 묶기 위한 컨테이너
const InputWithButtonContainer = styled.div`
    display: flex;
    flex-grow: 1;
    gap: 8px;
`;

// [추가] 닉네임 유효성 검사 메시지를 위한 스타일 컴포넌트
const ValidationMessage = styled.div`
    font-size: 0.8rem;
    color: ${props => props.color || 'red'};
    margin-top: 4px;
    height: 1rem; // 메시지가 없을 때도 공간을 차지하여 레이아웃이 밀리는 것을 방지
`;

const MyPageSet = () => {
    // 1. Context에서 필요한 상태와 함수들을 가져옴
    const { profile: globalProfile, loading, error, updateProfile, handleCancel } = useMyPage();

    // 2. 이 컴포넌트의 폼 입력을 위한 '로컬 상태'를 만들기
    const [localProfile, setLocalProfile] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingImageType, setEditingImageType] = useState(null); // 'profileImage' 또는 'bannerImage'
    // [추가] 닉네임 중복 확인을 위한 상태
    const [isCheckingNickname, setIsCheckingNickname] = useState(false); // '중복 확인' 버튼 로딩 상태
    const [isNicknameChecked, setIsNicknameChecked] = useState(true); // 닉네임이 변경되지 않았으면 기본적으로 '확인된' 상태로 간주
    const [originalNickname, setOriginalNickname] = useState(''); // 원래 닉네임을 저장할 상태
    const [nicknameMessage, setNicknameMessage] = useState({ text: '', color: 'green' }); // [추가] 닉네임 상태 메시지

    // 3. 전역 상태(globalProfile)가 로드되면, 그 데이터를 기반으로 로컬 상태(localProfile)를 초기화
    useEffect(() => {
        if (globalProfile) {
            // 날짜 형식을 'YYYY-MM-DD'
            const formattedBirthdate = globalProfile.birthdate ? globalProfile.birthdate.split('T')[0] : '';
            setLocalProfile({ ...globalProfile, birthdate: formattedBirthdate });
            setOriginalNickname(globalProfile.nickname); // [추가] 원래 닉네임 저장
        }
    }, [globalProfile]);

    // 4. 입력 폼의 내용이 바뀔 때마다 '로컬 상태'만 업데이트 (전역 상태는 건드리지 않음)
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setLocalProfile(prevProfile => ({
            ...prevProfile,
            [name]: type === 'checkbox' ? checked : value,
        }));

        // [추가] 닉네임 필드가 변경되면, 중복 확인 상태를 리셋
        if (name === 'nickname') {
            if (value !== originalNickname) {
                setIsNicknameChecked(false);
                setNicknameMessage({ text: 'Nickname check is required.', color: 'red' });
            } else {
                // 원래 닉네임으로 돌아오면 '확인된' 상태로 복구
                setIsNicknameChecked(true);
                setNicknameMessage({ text: '', color: 'green' });
            }
        }
    };

    const handleImageClick = (imageType) => {
        setEditingImageType(imageType);
        setIsModalOpen(true);
    };

    // ImageBox에서 '확인'을 눌렀을 때 호출될 함수 (File 객체를 받음)
    const handleImageUpdate = async (imageType, imageFile) => {
        if (!imageFile) return;

        try {
            // [개선] Context의 updateProfile을 사용하여 이미지 업데이트를 위임
            // 이미지 업데이트 시에는 텍스트 데이터를 보내지 않으므로 첫 번째 인자는 빈 객체({})
            const imageOptions = imageType === 'bannerImage'
                ? { bannerImageFile: imageFile }
                : { profileImageFile: imageFile };

            await updateProfile({}, imageOptions);
            handleCancel(); // [추가] 이미지 업데이트 성공 후, MyPage로 돌아가기 위해 상태 변경
            alert('Image updated successfully.');
            setIsModalOpen(false); // 성공 시 모달 닫기
        } catch (err) {
            console.error("Image update failed:", err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!localProfile) {
            alert('User information is missing. Cannot save.');
            return;
        }
        // [추가] 닉네임이 변경되었지만 중복 확인을 하지 않은 경우
        if (localProfile.nickname !== originalNickname && !isNicknameChecked) {
            message.warning('Please check the new nickname for duplication.');
            return;
        }
        try {
            // [개선] 서버가 요구하는 수정 가능한 필드만 추출하여 전달
            const profileDataForServer = {
                nickname: localProfile.nickname,
                birthdate: localProfile.birthdate,
                phoneNumber: localProfile.phoneNumber,
                gender: localProfile.gender,
                region: localProfile.region,
                bio: localProfile.bio,
                interests: localProfile.interests,
                isPrivate: localProfile.isPrivate,
            };
            // 텍스트 정보만 업데이트하므로 두 번째 인자는 빈 객체({})
            await updateProfile(profileDataForServer, {});
            alert('Profile updated successfully.');
            // [수정] 저장 성공 후, MyPage로 돌아가기 위해 handleCancel을 호출합니다.
            handleCancel();
        } catch (err) {
            console.error("Profile save failed:", err);
        }
    };

    /*** [추가] 닉네임 중복 확인 API를 호출하는 함수*/
    const handleCheckDuplicate = async () => {
        const newNickname = localProfile.nickname;

        if (!newNickname || newNickname.trim() === '') {
            message.warning('Please enter a nickname.');
            return;
        }
        setIsCheckingNickname(true);
        try {
            await api.get(`/api/user/profile/check-nickname?nickname=${newNickname}`);
            // 성공(200 OK) 시: catch 블록을 건너뛰고 이 코드가 실행됩니다.
            message.success('This nickname is available.');
            setIsNicknameChecked(true);
            setNicknameMessage({ text: 'This nickname is available.', color: 'green' });
        } catch (error) {
            // 실패(409 Conflict) 시: 이 코드가 실행됩니다.
            message.error(error.response?.data?.message || 'This nickname is already in use.');
            setIsNicknameChecked(false);
            setNicknameMessage({ text: 'This nickname is already in use.', color: 'red' });
        } finally {
            setIsCheckingNickname(false);
        }
    };

    if (loading && !localProfile) return <div>Loading...</div>;
    if (error) return <div style={{ color: 'red' }}>{error}</div>;
    if (!localProfile) return <div>Loading profile information...</div>;

    return (
        <MyPageContainer>
            <MypageImg
                style={{ backgroundImage: `url(${localProfile.bannerImage || ''})` }}
                // onClick={() => handleImageClick('bannerImage')}
            />

            {/* MyPage.jsx와 동일한 흰색 콘텐츠 박스 */}
            <ContentBox>
                {/* 배너와 폼 사이의 간격을 위한 빈 공간 */}
                <ImgWrapper />
                <MyPageMain>
                    <FeatureContent>
                        <SettingsForm onSubmit={handleSubmit}>
                            <SettingsTitle>Edit Profile</SettingsTitle>

                            <FormGroup>
                                <FormLabel htmlFor="email">Email</FormLabel>
                                <FormInput id="email" type="email" value={localProfile.email || ''} disabled />
                            </FormGroup>

                            <FormGroup>
                                <FormLabel htmlFor="nickname">Nickname</FormLabel>
                                {/* ✅ [수정] 구조 단순화 */}
                                <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                                    <InputWithButtonContainer>
                                        <FormInput id="nickname" type="text" name="nickname" value={localProfile.nickname || ''} onChange={handleInputChange}/>
                                        <CheckButton
                                            type="button"
                                            onClick={handleCheckDuplicate}
                                            disabled={isNicknameChecked || isCheckingNickname}
                                        >
                                            {isCheckingNickname ? 'Checking...' : 'Check'}
                                        </CheckButton>
                                    </InputWithButtonContainer>
                                    <ValidationMessage color={nicknameMessage.color}>{nicknameMessage.text}</ValidationMessage>
                                </div>
                            </FormGroup>

                            <FormGroup>
                                <FormLabel htmlFor="birthdate">Birthdate</FormLabel>
                                <FormInput id="birthdate" type="date" name="birthdate" value={localProfile.birthdate || ''} onChange={handleInputChange} />
                            </FormGroup>

                            <FormGroup>
                                <FormLabel htmlFor="phoneNumber">Phone</FormLabel>
                                <FormInput id="phoneNumber" type="tel" name="phoneNumber" value={localProfile.phoneNumber || ''} onChange={handleInputChange} placeholder="e.g., 010-1234-5678" />
                            </FormGroup>

                            <FormGroup>
                                <FormLabel htmlFor="gender">Gender</FormLabel>
                                <FormSelect id="gender" name="gender" value={localProfile.gender || ''} onChange={handleInputChange}>
                                    <option value="">Not specified</option>
                                    <option value="M">Male</option>
                                    <option value="F">Female</option>
                                    <option value="O">Other</option>
                                </FormSelect>
                            </FormGroup>

                            <FormGroup>
                                <FormLabel htmlFor="region">Region</FormLabel>
                                <FormInput id="region" type="text" name="region" value={localProfile.region || ''} onChange={handleInputChange} />
                            </FormGroup>

                            <FormGroup>
                                <FormLabel htmlFor="bio">Bio</FormLabel>
                                <FormTextarea id="bio" name="bio" value={localProfile.bio || ''} onChange={handleInputChange} />
                            </FormGroup>

                            <FormGroup>
                                <FormLabel htmlFor="interests">Interests</FormLabel>
                                <FormInput id="interests" type="text" name="interests" value={localProfile.interests || ''} onChange={handleInputChange} placeholder="Enter with commas (,) to separate" />
                            </FormGroup>


                            <ButtonGroup>
                                {/* [수정] 취소 버튼 클릭 시 handleCancel을 호출하여 MyPage로 돌아갑니다. */}
                                <CancelButton type="button" onClick={handleCancel}>
                                    Cancel
                                </CancelButton>
                                {/* [수정] 닉네임이 변경되었지만 확인되지 않았다면 저장 버튼 비활성화 */}
                                <SubmitButton type="submit" disabled={localProfile.nickname !== originalNickname && !isNicknameChecked}>
                                    Save
                                </SubmitButton>
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