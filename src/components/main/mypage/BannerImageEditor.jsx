import React, { useState, useEffect, useRef } from 'react';
import Cropper from 'react-cropper';
import 'cropperjs/dist/cropper.min.css';
import ImageModal from './ImageModal';
import { ModalBody, ModalFooter } from '../../../styled_components/main/mypage/ImageModalStyled';
import { ActionButtonGroup } from '../../../styled_components/main/mypage/ImageBoxStyled';
import { CancelButton, SubmitButton } from '../../../styled_components/main/mypage/MyPageSetStyled.jsx';
import { CropArea } from '../../../styled_components/main/journal/JournalWriteStyled';

const BannerImageEditor = ({ isOpen, onClose, onCropComplete }) => {
    const [imageSrc, setImageSrc] = useState(null);
    const cropperRef = useRef(null);
    const fileInputRef = useRef(null);

    // 1. 사용자가 파일을 선택했을 때 처리
    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) {
            onClose();
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            setImageSrc(reader.result);
        };
        reader.readAsDataURL(file);
    };

    // '이미지 선택' 버튼을 누르면 숨겨진 파일 입력을 다시 트리거
    const handleUploadButtonClick = () => fileInputRef.current?.click();

    // 2. '적용' 버튼을 눌렀을 때 이미지를 잘라 부모에게 전달
    const handleCrop = () => {
        const cropper = cropperRef.current?.cropper;
        if (typeof cropper === 'undefined') {
            return;
        }

        const croppedCanvas = cropper.getCroppedCanvas({
            width: 1200, 
            imageSmoothingEnabled: true,
            imageSmoothingQuality: 'high',
        });
        
        croppedCanvas.toBlob((blob) => {
            if (blob) {
                // 잘린 이미지를 'banner.jpg'라는 이름의 File 객체로 제작
                const croppedFile = new File([blob], "banner.jpg", { type: "image/jpeg" });
                // 부모에게 파일만 전달하고, yPosition은 0으로 고정합니다.
                onCropComplete(croppedFile, 0);
            } else {
                console.error("Failed to crop image.");
                alert("Image processing failed. Please try a different image.");
            }
        }, 'image/jpeg', 0.95);
    };

    return (
        <ImageModal isOpen={isOpen} onClose={onClose} title="Edit Banner Image">
            {/* 숨겨진 파일 입력 필드 */}
            <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept="image/*"
                onChange={handleFileChange}
            />

            <ModalBody>
                <CropArea>
                    {imageSrc ? (
                        <Cropper
                            ref={cropperRef}
                            src={imageSrc}
                            style={{ height: '100%', width: '100%' }}
                            aspectRatio={3 / 1} // 배너 비율
                            viewMode={2}
                            guides={true}
                            background={false}
                            responsive={true}
                            checkOrientation={false}
                            autoCropArea={1}
                        />
                    ) : (
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#888' }}>
                            Please select an image for the banner.
                        </div>
                    )}
                </CropArea>
                {!imageSrc && (
                    <ActionButtonGroup><SubmitButton onClick={handleUploadButtonClick}>Select Image</SubmitButton></ActionButtonGroup>
                )}
            </ModalBody>
            <ModalFooter>
                <CancelButton onClick={onClose}>Cancel</CancelButton>
                <SubmitButton onClick={handleCrop} disabled={!imageSrc}>Apply</SubmitButton>
            </ModalFooter>
        </ImageModal>
    );
};

export default BannerImageEditor;