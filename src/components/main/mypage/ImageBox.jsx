import React, { useState, useEffect } from 'react';
import ImageModal from './ImageModal'; // 방금 수정한 '액자' 컴포넌트를 가져옵니다.
import { ModalBody, ModalFooter, ImagePreview } from '../../../styled_components/main/mypage/ImageModalStyled';
import {
    FormLabel,
    FormInput,
    CancelButton,
    SubmitButton
} from '../../../styled_components/main/mypage/MyPageSetStyled';

const ImageBox = ({ isOpen, onClose, currentImageUrl, onConfirm, imageType }) => {
    const [newUrl, setNewUrl] = useState('');

    // 모달이 열릴 때마다 현재 이미지 URL로 입력 필드를 초기화합니다.
    useEffect(() => {
        if (isOpen) {
            setNewUrl(currentImageUrl || '');
        }
    }, [isOpen, currentImageUrl]);

    const handleConfirm = () => {
        onConfirm(imageType, newUrl);
        onClose(); // 확인 후 모달 닫기
    };

    return (
        <ImageModal isOpen={isOpen} onClose={onClose} title={`${imageType === 'profileImage' ? '프로필' : '배너'} 이미지 변경`}>
            <ModalBody>
                {/* 이미지 미리보기 영역 */}
                <ImagePreview imageUrl={newUrl} imageType={imageType}>
                    {!newUrl && "이미지 URL을 입력하세요"}
                </ImagePreview>
                <FormLabel htmlFor="imageUrlInput">새 이미지 URL:</FormLabel>
                <FormInput
                    id="imageUrlInput"
                    type="text"
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                />
            </ModalBody>
            <ModalFooter>
                <CancelButton type="button" onClick={onClose}>취소</CancelButton>
                <SubmitButton type="button" onClick={handleConfirm}>확인</SubmitButton>
            </ModalFooter>
        </ImageModal>
    );
};

export default ImageBox;