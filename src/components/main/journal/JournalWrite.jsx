import React, {useState, useRef, useMemo, useEffect} from 'react';
import {useAuth} from '../../../AuthContext';
import {useJournal} from '../../../contexts/JournalContext.jsx';
import {FaImage, FaSmile, FaUserTag} from 'react-icons/fa';
import {useLocation} from 'react-router-dom';
import EmojiPicker from 'emoji-picker-react';
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
    ActionButtonWrapper,
    EmojiPickerWrapper,
    IconButton,
    CharCounter,
    PostButton,
    CheckboxLabel,
    CheckboxInput,
} from '../../../styled_components/main/journal/JournalWriteStyled';
import {CloseButton, ModalHeader} from '../../../styled_components/main/journal/ModalStyled';
import ImageEditor from './image_edit/ImageEditor.jsx';

const MAX_CHAR_LIMIT = 3000;
const MAX_IMAGE_LIMIT = 2;

// Base64 데이터 URL을 File 객체로 변환하는 헬퍼 함수
const dataURLtoFile = (dataurl, filename) => {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, {type: mime});
};

// ✅ [추가] URL로부터 이미지를 가져와 File 객체로 변환하는 헬퍼 함수
// const urlToImageFile = async (url, filename) => {
//     const response = await fetch(url);
//     const blob = await response.blob();
//     return new File([blob], filename, {type: blob.type});
// };

const JournalWrite = ({
                          onClose,
                          selectedDate: selectedDateFromProp,
                          onFabricModeChange,
                          journalToEdit: journalToEditFromProp
                      }) => {
    const {user} = useAuth(); // 현재 로그인한 유저 정보
    const {createJournalEntry, updateJournalEntry} = useJournal(); // ✅ 수정 함수도 가져옵니다.

    // ✅ [수정] props와 location.state 양쪽에서 데이터를 받을 수 있도록 로직 개선
    const location = useLocation();

    // 1. location.state를 우선으로 사용하고, 없으면 props에서 데이터를 가져옵니다.
    const journalToEdit = location.state?.journalToEdit || journalToEditFromProp;
    // ✅ [수정] useState의 '초기화 함수'를 사용해 맨 처음 렌더링 시에만 날짜를 결정합니다.
    // 이렇게 하면 컴포넌트가 리렌더링될 때마다 new Date()가 실행되는 것을 방지할 수 있습니다.
    const [selectedDate] = useState(() =>
        location.state?.selectedDate || selectedDateFromProp || new Date()
    );

    const isEditMode = !!journalToEdit; // journalToEdit 데이터가 있으면 수정 모드!

    const [isSubmitting, setIsSubmitting] = useState(false); // ✅ 제출 중 상태 추가
    const [editingImageInfo, setEditingImageInfo] = useState(null); // ✅ 이미지 편집 상태 관리
    const [isDragging, setIsDragging] = useState(false); // ✅ 드래그 상태를 관리할 state 추가

    // --- 상태 초기값 설정 ---
    const [content, setContent] = useState('');
    const [isPrivate, setIsPrivate] = useState(false); // ✅ 비공개 여부 상태, 기본값: 비공개(true)
    const [images, setImages] = useState([]);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const fileInputRef = useRef(null);
    const textareaRef = useRef(null);
    const emojiPickerContainerRef = useRef(null);

    useEffect(() => {
        if (isEditMode) {
            setContent(journalToEdit.content || '');
            setIsPrivate(journalToEdit.visibility === 2);

            // 이 필드는 이미지 URL 문자열의 배열입니다.
            if (journalToEdit.images && Array.isArray(journalToEdit.images)) {
                // 기존 이미지는 preview URL만 세팅, File 객체 없음
                const existingImages = journalToEdit.images.map((url) => {
                    const filename = url.substring(url.lastIndexOf('/') + 1).split('?')[0];
                    return {
                        file: null,   // 아직 File 없음
                        preview: url,
                        name: filename
                    };
                });
                setImages(existingImages);
            }
        }
    }, [isEditMode, journalToEdit]);


    // --- 이모지 피커 외부 클릭 감지 Hook ---
    useEffect(() => {
        const handleClickOutside = (event) => {
            // emojiPickerContainerRef가 존재하고, 클릭된 곳이 피커/아이콘 외부일 때
            if (emojiPickerContainerRef.current && !emojiPickerContainerRef.current.contains(event.target)) {
                setShowEmojiPicker(false);
            }
        };

        // 피커가 열려 있을 때만 이벤트 리스너를 추가합니다.
        if (showEmojiPicker) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside); // 컴포넌트 언마운트 시 리스너 제거
    }, [showEmojiPicker]);

    // 날짜 포맷팅 (e.g., "8월 25일")
    const formattedDate = useMemo(() => {
        // 수정 모드일 때는 journalToEdit의 날짜를, 생성 모드일 때는 selectedDate를 사용
        const dateToFormat = isEditMode ? journalToEdit.logDate : selectedDate;
        if (!dateToFormat) return '';
        const date = new Date(dateToFormat);
        // toLocaleDateString은 브라우저/시스템의 로케일을 따르므로 일관된 결과를 위해 옵션 지정
        return date.toLocaleDateString('ko-KR', {month: 'long', day: 'numeric'});
    }, [isEditMode, journalToEdit, selectedDate]);

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
        // Blob URL을 사용한 경우, 메모리 누수 방지를 위해 URL을 해제합니다.
        const imageToRemove = images[indexToRemove];
        if (imageToRemove.preview.startsWith('blob:')) {
            URL.revokeObjectURL(imageToRemove.preview);
        }
        setImages(prevImages => prevImages.filter((_, index) => index !== indexToRemove));
    };

    const handleImagePreviewClick = async (image, index) => {
        try {
            let file = image.file; // 기존 File이 있으면 그대로 사용

            // 기존 File이 없고 preview가 URL이면 서버 프록시로 fetch
            if (!file && image.preview && image.preview.startsWith('http')) {
                const response = await fetch(`http://localhost:8090/api/proxy/image?url=${encodeURIComponent(image.preview)}`);
                // if (!response.ok) throw new Error('이미지 로드 실패');
                const blob = await response.blob();
                console.log(blob);
                const filename = image.name || `image_${Date.now()}.png`;
                console.log(filename);
                file = new File([blob], filename, {type: blob.type});
                console.log(file)
            }
            const blobUrl = URL.createObjectURL(file); // Canvas용 URL 생성
            setEditingImageInfo({image: {...image, file, preview: blobUrl}, index});
        } catch (err) {
            console.error("이미지 편집 준비 실패:", err);
            alert("이미지를 편집할 수 없습니다. 다시 시도해주세요.");
        }
    };

    const handleImageButtonClick = () => {
        fileInputRef.current.click();
    };

    // --- 이모지 관련 핸들러 ---
    const handleEmojiIconClick = () => {
        setShowEmojiPicker(prev => !prev); // 아이콘 클릭 시 피커 표시 상태 토글
    };

    const onEmojiClick = (emojiObject) => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const cursorPosition = textarea.selectionStart; // 현재 커서 위치
        // 커서 위치에 이모지를 삽입한 새로운 텍스트 생성
        const newText =
            content.substring(0, cursorPosition) +
            emojiObject.emoji +
            content.substring(cursorPosition);

        if (newText.length <= MAX_CHAR_LIMIT) {
            setContent(newText);
        }

        setShowEmojiPicker(false); // 이모지 선택 후 피커 닫기
    };

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
        // 1. FabricEditor가 반환한 고해상도 base64 데이터를 File 객체로 변환합니다.
        const filename = `edited_${user.uid}_${Date.now()}.png`;
        const editedFile = dataURLtoFile(editedImageDataUrl, filename);

        // 2. 이 File 객체로부터 새로운 blob URL을 생성하여 미리보기에 사용합니다.
        // File을 브라우저에서 바로 보여주려면 blob URL을 만들어야 함.
        // 이렇게 하면 항상 Cropper에 고화질의 blob URL이 전달됩니다.
        const newPreviewUrl = URL.createObjectURL(editedFile);

        const newImages = [...images];

        // 3. 이전 미리보기 URL이 blob URL이었다면 메모리에서 해제합니다.
        // URL.revokeObjectURL을 안 하면 편집할 때마다 blob이 계속 쌓여서 브라우저 메모리를 잡아먹어요.
        const oldPreviewUrl = newImages[editingImageInfo.index].preview;
        if (oldPreviewUrl.startsWith('blob:')) {
            URL.revokeObjectURL(oldPreviewUrl);
        }

        // 4. 이미지 배열의 해당 항목을 새로운 파일과 미리보기 URL로 업데이트합니다.
        newImages[editingImageInfo.index] = {
            file: editedFile,
            preview: newPreviewUrl,
        };

        setImages(newImages);
        if (onFabricModeChange) onFabricModeChange(false); // 편집 저장 시 모달 크기 복원
        setEditingImageInfo(null); // 모든 편집 모드 종료
        alert('이미지가 성공적으로 편집되었습니다.');
    };

    // 일기 저장
    const onSubmit = async () => {
        if (isSubmitting) return; // 중복 제출 방지
        setIsSubmitting(true);
        console.log("onSubmit selectedDate:", selectedDate);

        // Context 함수에 전달할 데이터 묶음(payload)을 만듭니다.
        const journalPayload = {
            images,
            content,
            isPrivate,
        };

        try {
            if (isEditMode) {
                // ✅ 수정 모드일 경우
                await updateJournalEntry(journalToEdit.id, journalPayload);
                alert('일기가 성공적으로 수정되었습니다!');
            } else {
                // ✅ 생성 모드일 경우
                const createPayload = {...journalPayload, logDate: selectedDate};
                await createJournalEntry(createPayload);
                alert('일기가 성공적으로 저장되었습니다!');
            }


            onClose(); // 저장 후 모달 닫기
        } catch (error) {
            console.error("일기 저장 실패:", error);
            // 서버에서 보낸 에러 메시지가 있다면 보여주는 것이 더 좋습니다.
            alert(error.response?.data?.message || '일기 저장에 실패했습니다.');
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
                        ref={textareaRef}
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
                            <IconButton data-tooltip="이미지 추가" onClick={handleImageButtonClick}
                                        disabled={images.length >= MAX_IMAGE_LIMIT}>
                                <FaImage/>
                            </IconButton>
                            <ActionButtonWrapper ref={emojiPickerContainerRef}>
                                <IconButton data-tooltip="이모지 추가" onClick={handleEmojiIconClick}>
                                    <FaSmile/>
                                </IconButton>
                                {showEmojiPicker && (
                                    <EmojiPickerWrapper>
                                        <EmojiPicker onEmojiClick={onEmojiClick}/>
                                    </EmojiPickerWrapper>
                                )}
                            </ActionButtonWrapper>
                            <IconButton data-tooltip="친구 태그 추가" onClick={handleTagClick}>
                                <FaUserTag/>
                            </IconButton>
                        </ActionButtons>
                        <CharCounter error={content.length === MAX_CHAR_LIMIT}>
                            {content.length} / {MAX_CHAR_LIMIT}
                        </CharCounter>
                        <CheckboxLabel>
                            <CheckboxInput
                                checked={isPrivate}
                                onChange={(e) => setIsPrivate(e.target.checked)}/>
                            비공개
                        </CheckboxLabel>
                        <PostButton onClick={onSubmit}
                                    disabled={(!content.trim() && images.length === 0) || isSubmitting}>
                            {isSubmitting ? (isEditMode ? '수정 중...' : '저장 중...') : (isEditMode ? '수정하기' : '게시하기')}
                        </PostButton>
                    </ActionBar>
                </FormContent>
            </FormContainer>
        </>
    );
};

export default JournalWrite;