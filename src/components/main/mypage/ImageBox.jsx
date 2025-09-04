import React, { useState, useEffect, useRef } from 'react';
import ImageModal from './ImageModal';
import { ActionButtonGroup } from '../../../styled_components/main/mypage/ImageBoxStyled';
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

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setPreviewUrl(URL.createObjectURL(file));
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
                <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
                <ActionButtonGroup>
                    <SubmitButton type="button" onClick={handleUploadButtonClick}>이미지 선택</SubmitButton>
                    {imageType === 'profileImage' && ( <CancelButton type="button" onClick={handleRevertClick}>기본으로 복원</CancelButton> )}
                </ActionButtonGroup>
            </ModalBody>
            <ModalFooter>
                <CancelButton type="button" onClick={onClose}>취소</CancelButton>
                <SubmitButton type="button" onClick={handleConfirm} disabled={!imageFile}>확인</SubmitButton>
            </ModalFooter>
        </ImageModal>
    );
};

export default ImageBox;