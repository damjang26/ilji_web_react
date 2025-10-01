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

    // ✅ [추가] 모든 상태를 초기화하는 함수
    const resetState = () => {
        setPreviewUrl('');
        setImageFile(null);
        setRevertMode(false);
    };

    useEffect(() => {
        if (isOpen) {
            // 모달이 열릴 때 전달받은 이미지로 미리보기 설정
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
        // [수정] 브라우저 캐시 문제를 방지하기 위해 기본 이미지 URL에도 고유한 타임스탬프를 추가합니다.
        const defaultUrlWithCacheBuster = `${DEFAULT_PROFILE_URL}?t=${new Date().getTime()}`;

        setImageFile(null);
        setPreviewUrl(defaultUrlWithCacheBuster);
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

            // [수정] 첫 번째 인자로 profile 객체 전체가 아닌, 순수한 텍스트 정보만 전달
            // 이유: 백엔드가 이전 이미지 URL(타임스탬프 포함)로 DB를 덮어쓰는 것을 방지
            const textProfileData = {
                nickname: profile.nickname,
                bio: profile.bio,
                // 다른 텍스트 필드가 있다면 여기에 추가
            };

            // Context의 updateProfile 함수 호출 (수정된 데이터로)
            await updateProfile(textProfileData, updateOptions);

            alert('Image updated successfully.');
            resetState(); // ✅ [수정] 성공 후 상태 초기화
            onClose(); // 모달 닫기
        } catch (err) {
            console.error('Image update failed:', err);
            alert('An error occurred while updating the image.');
        }
    };

    return (
        <ImageModal
            isOpen={isOpen}
            onClose={() => {
                resetState(); // ✅ [수정] 모달이 닫힐 때 상태를 초기화합니다.
                onClose();
            }}
            title={`Change ${imageType === 'profileImage' ? 'Profile' : 'Banner'} Image`}
        >
            <ModalBody>
                {/* ✅ [수정] 레이아웃 조정을 위해 스타일을 변경합니다. */}
                <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '68px', // ✅ [수정] 이 값을 조절하여 이미지와 버튼 사이의 간격을 넓힐 수 있습니다.
                    justifyContent: 'flex-start', // ✅ [수정] 그룹 전체를 왼쪽 정렬합니다.
                    marginTop: '16px', // 1. 제목과의 세로 간격 (값을 키우면 더 멀어집니다)
                    paddingLeft: '40px'// 2. 왼쪽에서의 가로 간격 (값을 키우면 그룹 전체가 오른쪽으로 이동합니다)
                }}>
                    {/* ✅ [수정] 이미지 미리보기 영역을 클릭하면 파일 선택창이 열리도록 onClick 이벤트를 추가합니다. */}
                    <ImagePreview
                        imageUrl={previewUrl}
                        imageType={imageType}
                        onClick={handleUploadButtonClick}
                    >{!previewUrl && "Upload an image"}</ImagePreview>

                    {/* ✅ [수정] 버튼들을 세로로 쌓기 위한 컨테이너입니다. */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <SubmitButton type="button" onClick={handleUploadButtonClick}>Select Image</SubmitButton>
                        {imageType === 'profileImage' && (
                            <CancelButton type="button" onClick={handleRevert}>Revert to Default</CancelButton>
                        )}
                    </div>
                </div>

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                />
            </ModalBody>

            {/* ✅ [수정] 하단 버튼들이 동일한 비율로 너비를 차지하도록 스타일을 수정합니다. */}
            <ModalFooter style={{ display: 'flex', gap: '8px' }}>
                <CancelButton type="button" onClick={onClose} style={{ flex: 1 }}>Cancel</CancelButton>
                <SubmitButton type="button" onClick={handleConfirm} disabled={!imageFile && !revertMode} style={{ flex: 1 }}>Apply</SubmitButton>
            </ModalFooter>
        </ImageModal>
    );
};

export default ImageBox;
