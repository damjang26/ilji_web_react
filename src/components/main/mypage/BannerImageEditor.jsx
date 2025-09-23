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
        
        // [최종 해결책]
        // 1. yPosition 계산을 모두 제거합니다.
        // 2. getCroppedCanvas에 옵션을 주어, 실제 배너 크기에 맞는 고해상도 결과물을 만듭니다.
        //    - width: 1200 -> 최종 배너 이미지의 너비를 1200px로 고정합니다.
        //    - height는 aspectRatio(3/1)에 따라 자동으로 400px이 됩니다.
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
                console.error("이미지 자르기에 실패했습니다.");
                alert("이미지 처리에 실패했습니다. 다른 이미지를 시도해주세요.");
            }
        }, 'image/jpeg', 0.95);
    };

    return (
        <ImageModal isOpen={isOpen} onClose={onClose} title="배너 이미지 편집">
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
                        // 이미지가 선택되지 않았을 때 안내 메시지를 표시
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#888' }}>
                            배너로 사용할 이미지를 선택해주세요.
                        </div>
                    )}
                </CropArea>
                {/* 이미지가 없을 때만 '이미지 선택' 버튼을 표시 */}
                {!imageSrc && (
                    <ActionButtonGroup><SubmitButton onClick={handleUploadButtonClick}>이미지 선택</SubmitButton></ActionButtonGroup>
                )}
            </ModalBody>
            <ModalFooter>
                <CancelButton onClick={onClose}>취소</CancelButton>
                <SubmitButton onClick={handleCrop} disabled={!imageSrc}>적용</SubmitButton>
            </ModalFooter>
        </ImageModal>
    );
};

export default BannerImageEditor;