import React, { useState, useEffect, useRef } from 'react';
import ImageModal from './ImageModal';
import { ModalBody, ModalFooter, ImagePreview } from '../../../styled_components/main/mypage/ImageModalStyled';
import { CancelButton, SubmitButton } from '../../../styled_components/main/mypage/MyPageSetStyled';

const ImageBox = ({ isOpen, onClose, currentImageUrl, onConfirm, imageType, onRevert }) => {
    const [imageFile, setImageFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            setPreviewUrl(currentImageUrl || '');
            setImageFile(null);
        }
    }, [isOpen, currentImageUrl]);

    // 이미지 압축 로직을 제거한 간단한 파일 변경 핸들러
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file); // 압축 없이 원본 파일을 상태에 저장
            setPreviewUrl(URL.createObjectURL(file)); // 원본 파일로 미리보기 생성
        }
    };

    const handleUploadButtonClick = () => {
        fileInputRef.current.click();
    };

    const handleConfirm = () => {
        onConfirm(imageType, imageFile);
        onClose();
    };

    const handleRevertClick = () => {
        if (onRevert) {
            onRevert(imageType);
        }
        onClose();
    };

    return (
        <ImageModal isOpen={isOpen} onClose={onClose} title={`${imageType === 'profileImage' ? '프로필' : '배너'} 이미지 변경`}>
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

                <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                    <SubmitButton type="button" onClick={handleUploadButtonClick} style={{ flex: 1 }}>
                        이미지 선택
                    </SubmitButton>

                    {imageType === 'profileImage' && (
                        <CancelButton type="button" onClick={handleRevertClick}>
                            기본으로 복원
                        </CancelButton>
                    )}
                </div>
            </ModalBody>
            <ModalFooter>
                <CancelButton type="button" onClick={onClose}>취소</CancelButton>
                <SubmitButton type="button" onClick={handleConfirm} disabled={!imageFile}>
                    확인
                </SubmitButton>
            </ModalFooter>
        </ImageModal>
    );
};

export default ImageBox;