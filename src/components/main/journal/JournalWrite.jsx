import React, {useState, useRef, useMemo} from 'react';
import {useAuth} from '../../../AuthContext';
import {useJournal} from '../../../contexts/JournalContext.jsx';
import {FaImage, FaSmile, FaUserTag} from 'react-icons/fa';
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
} from '../../../styled_components/main/journal/JournalWriteStyled';
import {CloseButton, ModalHeader} from '../../../styled_components/main/journal/ModalStyled';
import ImageEditor from './image_edit/ImageEditor.jsx';

const MAX_CHAR_LIMIT = 3000;
const MAX_IMAGE_LIMIT = 3;

const JournalWrite = ({onClose, selectedDate, onFabricModeChange}) => {
    const {user} = useAuth(); // 현재 로그인한 유저 정보
    const {addJournal} = useJournal(); // ✅ JournalContext에서 저장 함수 가져오기
    const [isSubmitting, setIsSubmitting] = useState(false); // ✅ 제출 중 상태 추가
    const [editingImageInfo, setEditingImageInfo] = useState(null); // ✅ 이미지 편집 상태 관리
    const [isDragging, setIsDragging] = useState(false); // ✅ 드래그 상태를 관리할 state 추가
    const [content, setContent] = useState('');
    const [images, setImages] = useState([]);
    const fileInputRef = useRef(null);

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

    // ✅ File을 base64(dataURL)로 변환해서 preview에 저장
    const processFiles = (files) => {
        if (images.length + files.length > MAX_IMAGE_LIMIT) {
            alert(`사진은 최대 ${MAX_IMAGE_LIMIT}개까지 추가할 수 있습니다.`);
            return;
        }

        // Array.from(files).forEach((file) => {
        //     const reader = new FileReader();
        //     reader.onloadend = () => {
        //         const base64Data = reader.result; // ✅ dataURL (base64)
        //         setImages((prevImages) => [
        //             ...prevImages,
        //             {
        //                 file,                // 원본 File도 저장 (필요하면 서버 업로드용)
        //                 preview: base64Data, // ✅ 이제 blobURL 대신 base64 저장
        //             },
        //         ]);
        //     };
        //     reader.readAsDataURL(file);
        // });

        Array.from(files).forEach((file) => {
            // ✅ base64 대신 blob URL 사용
            const blobUrl = URL.createObjectURL(file);

            setImages((prevImages) => [
                ...prevImages,
                {
                    file,         // 원본 File (서버 업로드용)
                    preview: blobUrl, // 브라우저에서 바로 보여줄 임시 URL
                },
            ]);
        });
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
        if (onFabricModeChange) onFabricModeChange(false); // 편집 모드 종료 시 모달 크기 복원
        setEditingImageInfo(null); // 편집 모드 종료
    };

    // ✅ ImageEditor로부터 최종 편집된 이미지 데이터를 받아 처리하는 함수
    const handleSaveEdit = (editedImageDataUrl) => {
        const newImages = [...images];

        // preview를 편집된 이미지의 데이터 URL(base64)로 교체합니다.
        newImages[editingImageInfo.index] = {
            ...newImages[editingImageInfo.index],
            preview: editedImageDataUrl,
            // 원본 파일 정보는 더 이상 유효하지 않으므로,
            // 필요하다면 나중에 base64를 File 객체로 변환하여 업로드해야 합니다.
            file: null,
        };

        setImages(newImages);
        if (onFabricModeChange) onFabricModeChange(false); // 편집 저장 시 모달 크기 복원
        setEditingImageInfo(null); // 모든 편집 모드 종료
        alert('이미지가 성공적으로 편집되었습니다.');
    };

    // 일기 저장processFiles
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
        return (
            <ImageEditor
                imageInfo={editingImageInfo}
                onSave={handleSaveEdit}
                onCancel={handleCancelEdit}
                onFabricModeChange={onFabricModeChange} // ImageEditor로 심부름꾼 함수 전달
            />
        );
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