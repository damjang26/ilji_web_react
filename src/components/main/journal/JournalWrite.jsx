import React, {useState, useRef, useMemo} from 'react';
import {useAuth} from '../../../AuthContext';
import {useJournal} from '../../../contexts/JournalContext.jsx';
import Cropper from 'react-cropper';
import 'cropperjs/dist/cropper.min.css';
import * as fabric from 'fabric'; // ✅ fabric.js 라이브러리 임포트
import {FaArrowLeft, FaImage, FaSmile, FaUserTag} from 'react-icons/fa';
import {
    FormContainer,
    ProfilePicture,
    FormContent,
    StyledTextarea,
    ImagePreviewContainer,
    ImagePreviewWrapper,
    RemoveImageButton,
    ActionBar,
    ActionButtons,
    IconButton,
    CharCounter,
    PostButton,
    ImageEditorContainer,
} from '../../../styled_components/main/journal/JournalWriteStyled';
import {CloseButton, ModalHeader} from '../../../styled_components/main/journal/ModalStyled';

const MAX_CHAR_LIMIT = 3000;
const MAX_IMAGE_LIMIT = 3;

const JournalWrite = ({onClose, selectedDate}) => {
    const {user} = useAuth(); // 현재 로그인한 유저 정보
    const {addJournal} = useJournal(); // ✅ JournalContext에서 저장 함수 가져오기
    const [isSubmitting, setIsSubmitting] = useState(false); // ✅ 제출 중 상태 추가
    const [editingImageInfo, setEditingImageInfo] = useState(null); // ✅ 이미지 편집 상태 관리
    const [editingStep, setEditingStep] = useState('crop'); // 'crop' | 'fabric'
    const [isDragging, setIsDragging] = useState(false); // ✅ 드래그 상태를 관리할 state 추가
    const [content, setContent] = useState('');
    const [images, setImages] = useState([]);
    const fileInputRef = useRef(null);
    const cropperRef = useRef(null); // ✅ Cropper 인스턴스를 참조할 ref 생성

    // 날짜 포맷팅 (e.g., "8월 25일")
    const formattedDate = useMemo(() => {
        if (!selectedDate) return '';
        const date = new Date(selectedDate);
        // toLocaleDateString은 브라우저/시스템의 로케일을 따르므로 일관된 결과를 위해 옵션 지정
        return date.toLocaleDateString('ko-KR', {month: 'long', day: 'numeric'});
    }, [selectedDate]);

    const handleContentChange = (e) => {
        const text = e.target.value;
        if (text.length <= MAX_CHAR_LIMIT) {
            setContent(text);
        }
    };

    // ✅ 파일 처리 로직을 공통 함수로 분리하여 재사용성을 높입니다.
    const processFiles = (files) => {
        if (images.length + files.length > MAX_IMAGE_LIMIT) {
            alert(`사진은 최대 ${MAX_IMAGE_LIMIT}개까지 추가할 수 있습니다.`);
            return;
        }

        const newImages = files.map(file => ({
            file: file,
            preview: URL.createObjectURL(file),
        }));

        setImages(prevImages => [...prevImages, ...newImages]);
    };

    const handleImageUpload = (e) => {
        processFiles(Array.from(e.target.files));
    };

    const handleRemoveImage = (e, indexToRemove) => {
        e.stopPropagation(); // ❗ 중요: 부모(ImagePreviewWrapper)의 클릭 이벤트가 실행되는 것을 막습니다.
        setImages(prevImages => prevImages.filter((_, index) => index !== indexToRemove));
    };

    // ✅ 이미지 미리보기를 클릭하면 편집 모드로 전환하는 핸들러
    const handleImagePreviewClick = (image, index) => {
        setEditingImageInfo({image, index});
        setEditingStep('crop'); // 편집 시작 시 항상 첫 단계(crop)로 설정
    };

    const handleImageButtonClick = () => {
        fileInputRef.current.click();
    };

    // TODO: 이모티콘, 친구 태그 기능 구현
    const handleEmojiClick = () => alert('이모티콘 기능 구현 예정');
    const handleTagClick = () => alert('친구 태그 기능 구현 예정');

    // --- Drag & Drop 핸들러 추가 ---
    const handleDragEnter = (e) => {
        e.preventDefault();
        e.stopPropagation();
        // 드래그하는 대상이 파일일 때만 상태 변경
        if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
            setIsDragging(true);
        }
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDragOver = (e) => {
        e.preventDefault(); // 이 부분이 없으면 onDrop 이벤트가 발생하지 않습니다.
        e.stopPropagation();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        processFiles(Array.from(e.dataTransfer.files));
    };

    // --- 이미지 편집 모드 핸들러 ---
    const handleCancelEdit = () => {
        if (window.confirm('편집을 취소하시겠습니까? 변경사항이 저장되지 않습니다.')) {
            setEditingImageInfo(null); // 편집 모드 종료
        }
    };

    // 단계 1: Crop -> Fabric으로 넘어가는 핸들러
    const handleNextStep = () => {
        const cropper = cropperRef.current?.cropper;
        if (typeof cropper !== 'undefined') {
            // ✅ 원본 해상도 기준으로 자르기 위해, 자른 영역의 실제 픽셀 정보를 가져옵니다.
            const cropData = cropper.getData(true); // 반올림된 정수 값으로 가져옵니다.

            // ✅ getCroppedCanvas에 옵션을 전달하여 고화질 결과물을 생성합니다.
            const croppedCanvas = cropper.getCroppedCanvas({
                width: cropData.width,
                height: cropData.height,
            });

            // ✅ toDataURL을 'image/png'로 설정하여 다음 단계(fabric)로 넘길 때 화질 손실을 최소화합니다.
            const croppedImageUrl = croppedCanvas.toDataURL('image/png');

            setEditingImageInfo(prev => ({
                ...prev,
                croppedImage: croppedImageUrl,
            }));
            setEditingStep('fabric');
        }
    };

    // 단계 2: Fabric.js에서 최종 저장하는 핸들러
    const handleSaveFabricEdit = () => {
        // 지금은 Cropper.js에서 자른 이미지를 바로 저장하는 로직으로 구현합니다.
        const newImages = [...images];

        // ✅ preview를 자른 이미지의 데이터 URL(base64)로 교체합니다.
        newImages[editingImageInfo.index] = {
            ...newImages[editingImageInfo.index],
            preview: editingImageInfo.croppedImage,
            // 원본 파일 정보는 더 이상 유효하지 않으므로,
            // 필요하다면 나중에 base64를 File 객체로 변환하여 업로드해야 합니다.
            file: null,
        };

        setImages(newImages);
        setEditingImageInfo(null); // 모든 편집 모드 종료
        alert('이미지가 성공적으로 편집되었습니다.');
    };

    // 일기 저장
    const onSubmit = async () => {
        if (isSubmitting) return; // 중복 제출 방지
        setIsSubmitting(true);

        // TODO: 이미지 업로드 로직 (e.g., Firebase Storage에 업로드 후 URL 받아오기)
        // 지금은 시뮬레이션을 위해 파일 이름만 저장합니다.
        const imageUrls = images.map(image => image.file.name);

        const journalData = {
            content: content,
            images: imageUrls,
            authorId: user.uid, // 작성자 ID
        };

        try {
            await addJournal(selectedDate, journalData);
            onClose(); // 저장 후 모달 닫기
        } catch (error) {
            console.error("일기 저장 실패:", error);
            alert('일기 저장에 실패했습니다.');
        } finally {
            setIsSubmitting(false); // 제출 상태 해제
        }
    };

    // --- 렌더링 분기: 편집 모드일 경우 편집기 UI를 보여줍니다. ---
    if (editingImageInfo) {
        // 편집 단계에 따라 다른 UI를 렌더링
        if (editingStep === 'crop') {
            return (
                <>
                    <ModalHeader>
                        <IconButton onClick={handleCancelEdit} style={{color: '#555'}}><FaArrowLeft/></IconButton>
                        <h2>이미지 자르기</h2>
                        <PostButton onClick={handleNextStep}>다음</PostButton>
                    </ModalHeader>
                    {/* ✅ 기존 img 태그를 Cropper 컴포넌트로 교체 */}
                    <Cropper
                        ref={cropperRef}
                        src={editingImageInfo.image.preview}
                        style={{height: 400, width: '100%'}}
                        // Cropper.js 옵션들
                        viewMode={1} // 자르기 영역을 이미지 밖으로 나가지 않도록 제한
                        guides={true} // 자르기 영역에 안내선 표시
                        background={false} // 격자무늬 배경 비활성화
                        responsive={true} // 컨테이너 크기가 변경될 때 캔버스 크기 조정
                        checkOrientation={false} // 일부 브라우저의 EXIF 데이터 오류 방지
                        minCropBoxHeight={100}
                        minCropBoxWidth={100}
                    />
                </>
            );
        } else if (editingStep === 'fabric') {
            return (
                <>
                    <ModalHeader>
                        {/* 이전 단계(crop)로 돌아가는 버튼 */}
                        <IconButton onClick={() => setEditingStep('crop')}
                                    style={{color: '#555'}}><FaArrowLeft/></IconButton>
                        <h2>이미지 꾸미기</h2>
                        <PostButton onClick={handleSaveFabricEdit}>저장</PostButton>
                    </ModalHeader>
                    <ImageEditorContainer>
                        <img
                            src={editingImageInfo.croppedImage}
                            alt="자르기 완료된 이미지"
                            style={{maxWidth: '100%', maxHeight: '300px', objectFit: 'contain'}}
                        />

                    </ImageEditorContainer>
                </>
            );
        }
    }

    return (
        <>
            <ModalHeader>
                <h2>{formattedDate}</h2> {/* 제목은 비워두거나 다른 용도로 사용 */}
                <CloseButton onClick={onClose}>×</CloseButton>
            </ModalHeader>
            <FormContainer>
                <ProfilePicture
                    src={user?.picture || 'https://via.placeholder.com/48'}
                    alt={`${user?.name || 'user'} profile`}
                    referrerPolicy="no-referrer"/>
                <FormContent>
                    <StyledTextarea
                        value={content}
                        onChange={handleContentChange}
                        onDragEnter={handleDragEnter}
                        onDragLeave={handleDragLeave}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                        isDragging={isDragging} // ✅ 스타일링을 위해 isDragging 상태 전달
                        placeholder="오늘은 무슨 일이 있었나요?"
                    />

                    {images.length > 0 && (
                        <ImagePreviewContainer
                            onDragEnter={handleDragEnter}
                            onDragLeave={handleDragLeave}
                            onDragOver={handleDragOver}
                            onDrop={handleDrop}
                            isDragging={isDragging}>
                            {images.map((image, index) => (
                                <ImagePreviewWrapper key={index} onClick={() => handleImagePreviewClick(image, index)}>
                                    <img src={image.preview} alt={`preview ${index}`}/>
                                    <RemoveImageButton onClick={(e) => handleRemoveImage(e, index)}>
                                        ×
                                    </RemoveImageButton>
                                </ImagePreviewWrapper>
                            ))}
                        </ImagePreviewContainer>
                    )}

                    <ActionBar>
                        <ActionButtons>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleImageUpload}
                                multiple
                                accept="image/*"
                                style={{display: 'none'}}
                            />
                            <IconButton onClick={handleImageButtonClick} disabled={images.length >= MAX_IMAGE_LIMIT}>
                                <FaImage/>
                            </IconButton>
                            <IconButton onClick={handleEmojiClick}>
                                <FaSmile/>
                            </IconButton>
                            <IconButton onClick={handleTagClick}>
                                <FaUserTag/>
                            </IconButton>
                        </ActionButtons>
                        <CharCounter error={content.length === MAX_CHAR_LIMIT}>
                            {content.length} / {MAX_CHAR_LIMIT}
                        </CharCounter>
                        <PostButton onClick={onSubmit}
                                    disabled={(!content.trim() && images.length === 0) || isSubmitting}>
                            {isSubmitting ? '저장 중...' : '게시하기'}
                        </PostButton>
                    </ActionBar>
                </FormContent>
            </FormContainer>
        </>
    );
};

export default JournalWrite;
JournalWrite;