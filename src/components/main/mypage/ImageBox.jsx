import React, { useState, useEffect, useRef } from 'react';
import ImageModal from './ImageModal';
import { ActionButtonGroup } from '../../../styled_components/main/mypage/ImageBoxStyled';
import { ModalBody, ModalFooter, ImagePreview } from '../../../styled_components/main/mypage/ImageModalStyled';
import { CancelButton, SubmitButton } from '../../../styled_components/main/mypage/MyPageSetStyled';
import { useAuth } from '../../../AuthContext';
import { useMyPage } from '../../../contexts/MyPageContext.jsx';

const DEFAULT_PROFILE_URL = import.meta.env.VITE_DEFAULT_PROFILE_URL; // 환경변수에 기본 이미지 링크

const ImageBox = ({ isOpen, onClose, currentImageUrl, imageType }) => {
    const [imageFile, setImageFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [revertMode, setRevertMode] = useState(false);
    const fileInputRef = useRef(null);

    const { user } = useAuth();
    const { profile, updateProfile } = useMyPage(); // Context에서 가져오기

    useEffect(() => {
        if (isOpen) {
            setPreviewUrl(currentImageUrl || '');
            setImageFile(null);
            setRevertMode(false);
        }
    }, [isOpen, currentImageUrl]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setPreviewUrl(URL.createObjectURL(file));
            setRevertMode(false);
        }
    };

    const handleUploadButtonClick = () => fileInputRef.current?.click();

    const handleRevert = () => {
        // 기본 이미지 URL로 미리보기 변경
        const defaultUrl = DEFAULT_PROFILE_URL || '';
        setImageFile(null);
        setPreviewUrl(defaultUrl);
        setRevertMode(true);
    };

    const handleConfirm = async () => {
        if (!profile) return;

        // updateProfile 함수에 전달할 옵션 객체
        const updateOptions = {
            profileImageFile: imageType === 'profileImage' ? imageFile : null,
            bannerImageFile: imageType === 'bannerImage' ? imageFile : null,
            revertToDefault: {},
        };

        try {
            if (revertMode) {
                // 기본 이미지 복원 모드일 때
                updateOptions.revertToDefault[imageType] = true;
            }

            // [수정] 첫 번째 인자로 profile 객체 전체가 아닌, 순수한 텍스트 정보만 전달합니다.
            // 이렇게 해야 백엔드가 이전 이미지 URL(타임스탬프 포함)로 DB를 덮어쓰는 것을 방지할 수 있습니다.
            const textProfileData = {
                nickname: profile.nickname,
                bio: profile.bio,
                // 다른 텍스트 필드가 있다면 여기에 추가합니다.
            };

            // Context의 updateProfile 함수 호출 (수정된 데이터로)
            await updateProfile(textProfileData, updateOptions);

            alert('이미지가 성공적으로 업데이트되었습니다.');
            onClose();
        } catch (err) {
            console.error('이미지 업데이트 실패:', err);
            alert('이미지 업데이트 중 오류가 발생했습니다.');
        }
    };

    return (
        <ImageModal
            isOpen={isOpen}
            onClose={onClose}
            title={`${imageType === 'profileImage' ? '프로필' : '배너'} 이미지 변경`}
        >
            <ModalBody>
                <ImagePreview imageUrl={previewUrl} imageType={imageType}>
                    {!previewUrl && "이미지를 업로드하세요"}
                </ImagePreview>

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                />

                <ActionButtonGroup>
                    <SubmitButton type="button" onClick={handleUploadButtonClick}>이미지 선택</SubmitButton>
                    {imageType === 'profileImage' && (
                        <CancelButton type="button" onClick={handleRevert}>기본으로 복원</CancelButton>
                    )}
                </ActionButtonGroup>
            </ModalBody>

            <ModalFooter>
                <CancelButton type="button" onClick={onClose}>취소</CancelButton>
                <SubmitButton type="button" onClick={handleConfirm} disabled={!imageFile && !revertMode}>확인</SubmitButton>
            </ModalFooter>
        </ImageModal>
    );
};

export default ImageBox;
