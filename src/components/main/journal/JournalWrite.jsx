import React, {useState, useRef, useMemo} from 'react';
import {useAuth} from '../../../AuthContext';
import {useJournal} from '../../../contexts/JournalContext.jsx';
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
import {ModalHeader} from '../../../styled_components/main/journal/ModalStyled';

const MAX_CHAR_LIMIT = 3000;
const MAX_IMAGE_LIMIT = 3;

const JournalWrite = ({onClose, selectedDate}) => {
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

    const handleSaveEdit = () => {
        // TODO: Cropper.js/Fabric.js 로직이 적용된 후,
        // 수정된 이미지 데이터를 images 배열에 업데이트해야 합니다.
        // 예: const newImages = [...images];
        //     newImages[editingImageInfo.index] = editedImageObject;
        //     setImages(newImages);

        alert('이미지 편집 내용이 저장되었습니다. (현재는 시뮬레이션)');
        setEditingImageInfo(null); // 편집 모드 종료
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
        return (
            <>
                <ModalHeader>
                    {/* IconButton을 재사용하여 뒤로가기 버튼 생성 */}
                    <IconButton onClick={handleCancelEdit} style={{color: '#555'}}><FaArrowLeft/></IconButton>
                    <h2>이미지 편집</h2>
                    <PostButton onClick={handleSaveEdit}>저장</PostButton>
                </ModalHeader>
                <ImageEditorContainer>
                    <img
                        src={editingImageInfo.image.preview}
                        alt={`편집 중인 이미지 ${editingImageInfo.index + 1}`}
                    />
                    <p>여기에 Cropper.js 또는 Fabric.js 편집 도구가 표시됩니다.</p>
                </ImageEditorContainer>
            </>
        );
    }

    return (
        <>
            <ModalHeader>
                <h2>{formattedDate}</h2> {/* 제목은 비워두거나 다른 용도로 사용 */}
                <button onClick={onClose}>×</button>
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
                        <ImagePreviewContainer>
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