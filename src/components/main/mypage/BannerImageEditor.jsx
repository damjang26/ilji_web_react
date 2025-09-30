import React, {useState, useEffect, useRef} from 'react';
import Cropper from 'react-cropper';
import 'cropperjs/dist/cropper.min.css';
import ImageModal from './ImageModal';
import {ModalBody, ModalFooter} from '../../../styled_components/main/mypage/ImageModalStyled';
import {ActionButtonGroup} from '../../../styled_components/main/mypage/ImageBoxStyled';
import {CancelButton, SubmitButton} from '../../../styled_components/main/mypage/MyPageSetStyled.jsx';
import {CropArea} from '../../../styled_components/main/journal/JournalWriteStyled';

const BannerImageEditor = ({isOpen, onClose, onCropComplete}) => {
    const [imageSrc, setImageSrc] = useState(null);
    const cropperRef = useRef(null);
    const fileInputRef = useRef(null);

    // ✅ [추가] 모달이 닫힐 때 상태를 초기화하는 로직
    useEffect(() => {
        // isOpen이 false가 되면(모달이 닫히면) 이미지 소스를 null로 리셋합니다.
        if (!isOpen) {
            setImageSrc(null);
        }
    }, [isOpen]); // isOpen prop이 변경될 때마다 이 효과를 실행합니다.

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
                const croppedFile = new File([blob], "banner.jpg", {type: "image/jpeg"});
                // 부모에게 파일만 전달하고, yPosition은 0으로 고정합니다.
                onCropComplete(croppedFile, 0);
            } else {
                console.error("Failed to crop image.");
                alert("Image processing failed. Please try a different image.");
            }
        }, 'image/jpeg', 0.95);
    };

    // ✅ [수정] 이미지가 있을 때만 스크롤과 최대 높이를 적용하기 위한 동적 스타일
    const bodyStyle = imageSrc ? {
        maxHeight: '70vh', // 이미지가 있을 때만 최대 높이 제한
        overflowY: 'auto', // 이미지가 있을 때만 세로 스크롤 허용
    } : {}; // 이미지가 없으면 아무 스타일도 적용하지 않음

    return (
        <ImageModal isOpen={isOpen} onClose={onClose} title="Edit Banner Image">
            {/* 숨겨진 파일 입력 필드 */}
            <input
                type="file"
                ref={fileInputRef}
                style={{display: 'none'}}
                accept="image/*"
                onChange={handleFileChange}
            />

            {/* ✅ [수정] 동적으로 생성된 스타일을 ModalBody에 적용합니다. */}
            <ModalBody style={bodyStyle}>
                {/* ✅ [수정] 이미지가 없을 때만 CropArea의 높이를 200px로 설정합니다. */}
                <CropArea style={!imageSrc ? { height: '200px' } : {}}>
                    {imageSrc ? (
                        <Cropper
                            ref={cropperRef}
                            src={imageSrc}
                            style={{height: '100%', width: '100%'}}
                            aspectRatio={5 / 1} // 배너 비율
                            viewMode={2}
                            guides={true}
                            background={false}
                            responsive={true}
                            checkOrientation={false}
                            autoCropArea={1}
                        />
                    ) : (
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                // ✅ [수정] 초기 placeholder의 높이를 고정값으로 변경하여 줄입니다.
                                height: '100%',
                                color: '#888',
                                cursor: 'pointer' // 마우스를 올리면 클릭 가능함을 표시
                            }}
                            onClick={handleUploadButtonClick} // 클릭 시 파일 선택창을 띄우는 함수 연결
                        >
                            Please select an image for the banner.
                        </div>
                    )}
                </CropArea>
                {/* ✅ [수정] 이미지가 없을 때만 'Select Image' 버튼을 중앙에 표시합니다. */}
                {!imageSrc && (
                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                        <SubmitButton onClick={handleUploadButtonClick}>Select Image</SubmitButton>
                    </div>
                )}
            </ModalBody>
            {/* ✅ [수정] 하단 버튼들이 동일한 비율로 너비를 차지하도록 스타일을 수정합니다. */}
            <ModalFooter style={{ display: 'flex', gap: '8px' }}>
                <CancelButton onClick={onClose} style={{ flex: 1 }}>Cancel</CancelButton>
                <SubmitButton onClick={handleCrop} disabled={!imageSrc} style={{ flex: 1 }}>Apply</SubmitButton>
            </ModalFooter>
        </ImageModal>
    );
};

export default BannerImageEditor;