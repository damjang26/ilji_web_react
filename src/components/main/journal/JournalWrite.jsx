import React, {useState, useRef, useMemo, useEffect} from 'react';
import {useAuth} from '../../../AuthContext';
import {useJournal} from '../../../contexts/JournalContext.jsx';
import {FaImage, FaSmile} from 'react-icons/fa';
import {useLocation} from 'react-router-dom';
import EmojiPicker from 'emoji-picker-react';
import {
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
    VisibilitySelector,
    VisibilityButton,
    VisibilityDropdown,
    VisibilityOption,
    JournalWriteContainer, // ✅ JournalWriteStyled에서 가져오도록 수정
    ProfilePicture, ModalTitle,
} from '../../../styled_components/main/journal/JournalWriteStyled.jsx';
import {CloseButton, ModalHeader} from '../../../styled_components/main/journal/ModalStyled.jsx';
import {SpringBinder, SpringBinder2} from "../../../styled_components/main/post/PostListStyled.jsx";
import ImageEditor from './image_edit/ImageEditor.jsx';
import {LuGlobe, LuLock, LuUsers} from "react-icons/lu"; // 공개 범위 아이콘

const MAX_CHAR_LIMIT = 2000;
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

const JournalWrite = ({
                          onClose,
                          selectedDate: selectedDateFromProp,
                          onFabricModeChange,
                          journalToEdit: journalToEditFromProp
                      }) => {
    const {user, triggerPostChange} = useAuth(); // [수정] triggerPostChange 함수를 가져옵니다.
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
    const spring = "/images/spring_binder.png";
    const [editingImageInfo, setEditingImageInfo] = useState(null); // ✅ 이미지 편집 상태 관리
    const [isDragging, setIsDragging] = useState(false); // ✅ 드래그 상태를 관리할 state 추가

    // --- 상태 초기값 설정 ---
    const [content, setContent] = useState('');
    // ✅ [수정] isPrivate를 visibility로 변경 (0: 전체, 1: 친구, 2: 비공개)
    const [visibility, setVisibility] = useState('PUBLIC'); // ✅ [수정] 기본값을 문자열 'PUBLIC'으로 변경
    const [images, setImages] = useState([]);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [isVisibilityDropdownOpen, setIsVisibilityDropdownOpen] = useState(false);
    const fileInputRef = useRef(null);
    const textareaRef = useRef(null);
    const emojiPickerContainerRef = useRef(null);

    // ✅ [추가] 이미지 편집 모드에 따라 부모 모달의 스타일을 제어합니다.
    // editingImageInfo가 있으면(편집 모드 on) isFabricMode를 true로 설정합니다.
    useEffect(() => {
        if (onFabricModeChange) {
            onFabricModeChange(!!editingImageInfo);
        }
    }, [editingImageInfo, onFabricModeChange]);

    useEffect(() => {
        if (isEditMode) {
            setContent(journalToEdit.content || '');
            // ✅ [수정] visibility 상태를 초기화합니다.
            setVisibility(journalToEdit.visibility || 'PUBLIC');

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

    // --- 공개 범위 드롭다운 외부 클릭 감지 Hook ---
    useEffect(() => {
        const handleClickOutside = (event) => {
            // ActionButtonWrapper(드롭다운 버튼이 있는 곳)의 자손이 아니면 닫기
            if (event.target.closest(VisibilitySelector.toString()) === null) {
                setIsVisibilityDropdownOpen(false);
            }
        };
        if (isVisibilityDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isVisibilityDropdownOpen]);

    // 날짜 포맷팅 (e.g., "8월 25일")
    const formattedDate = useMemo(() => {
        // 수정 모드일 때는 journalToEdit의 날짜를, 생성 모드일 때는 selectedDate를 사용
        const dateToFormat = isEditMode ? journalToEdit.logDate : selectedDate;
        if (!dateToFormat) return '';
        const date = new Date(dateToFormat);
        // toLocaleDateString은 브라우저/시스템의 로케일을 따르므로 일관된 결과를 위해 옵션 지정
        return date.toLocaleDateString('en-US', {month: 'long', day: '2-digit'});
    }, [isEditMode, journalToEdit, selectedDate]);

    // ✅ [신규] 현재 visibility 상태에 맞는 아이콘과 텍스트를 반환하는 객체
    const visibilityOptions = useMemo(() => ({
        'PUBLIC': {
            icon: <LuGlobe/>,
            text: 'Public',
            description: 'Everyone can see my journal.'
        },
        'FRIENDS_ONLY': {
            icon: <LuUsers/>,
            text: 'Friends',
            description: 'Only you and your friends can see it.'
        },
        'PRIVATE': {
            icon: <LuLock/>,
            text: 'Private',
            description: 'Only you can see this journal.'
        }
    }), []);

    // ✅ [신규] 공개 범위 옵션 클릭 핸들러
    const handleVisibilityChange = (newVisibility) => {
        setVisibility(newVisibility);
        setIsVisibilityDropdownOpen(false); // 옵션 선택 후 드롭다운 닫기
    };


    const handleContentChange = (e) => {
        const text = e.target.value;
        if (text.length <= MAX_CHAR_LIMIT) {
            setContent(text);
        }
    };

    // ✅ File을 base64(dataURL)로 변환해서 preview에 저장
    const processFiles = (files) => {
        // ✅ [추가] 허용할 이미지 파일의 MIME 타입 정의
        const allowedTypes = ['image/jpeg', 'image/png'];
        const allFiles = Array.from(files);

        // 1. 허용되지 않는 파일 형식을 먼저 걸러냅니다.
        const invalidFiles = allFiles.filter(file => !allowedTypes.includes(file.type));
        if (invalidFiles.length > 0) {
            alert(`Unsupported file format. Only JPG and PNG files can be uploaded.`);
            return; // 유효하지 않은 파일이 있으면 함수를 중단합니다.
        }

        // 2. 허용된 파일들로만 개수 제한을 확인합니다.
        if (images.length + allFiles.length > MAX_IMAGE_LIMIT) {
            alert(`You can add up to ${MAX_IMAGE_LIMIT} photos.`);
            return;
        }

        // 3. 모든 검증을 통과한 파일들만 상태에 추가합니다.
        allFiles.forEach((file) => {
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
                // console.log(blob);
                const filename = image.name || `image_${Date.now()}.png`;
                // console.log(filename);
                file = new File([blob], filename, {type: blob.type});
                // console.log(file)
            }
            const blobUrl = URL.createObjectURL(file); // Canvas용 URL 생성
            setEditingImageInfo({image: {...image, file, preview: blobUrl}, index});
        } catch (err) {
            console.error("Failed to prepare image for editing:", err);
            alert("Cannot edit the image. Please try again.");
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
        setEditingImageInfo(null); // 편집 모드 종료
    };

    // ✅ ImageEditor로부터 최종 편집된 이미지 데이터를 받아 처리하는 함수
    const handleSaveEdit = (editedImageDataUrl) => {
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
        setEditingImageInfo(null); // 모든 편집 모드 종료
        alert('Image edited successfully.');
    };

    // 일기 저장
    const onSubmit = async () => {
        if (isSubmitting) return; // 중복 제출 방지
        setIsSubmitting(true);
        // console.log("onSubmit selectedDate:", selectedDate);

        // ✅ [추가] 백엔드 Enum(int)에 맞게 문자열 visibility를 숫자로 변환합니다.
        const visibilityMap = {
            'PUBLIC': 0,
            'FRIENDS_ONLY': 1,
            'PRIVATE': 2
        };

        // Context 함수에 전달할 데이터 묶음(payload)을 만듭니다.
        const journalPayload = {
            images, content, visibility: visibilityMap[visibility]
        };

        try {
            if (isEditMode) {
                // ✅ 수정 모드일 경우
                const updatedJournal = await updateJournalEntry(journalToEdit.id, journalPayload);
                // ✅ [수정] 수정이 성공하면, 전역 이벤트를 발생시켜 다른 컴포넌트에게 알립니다.
                // 이벤트의 detail에 수정된 '전체 일기 객체'를 담아 보냅니다.
                window.dispatchEvent(new CustomEvent('journal:updated', {detail: {updatedJournal}}));
                alert('Journal updated successfully!');
                // [수정] 게시물 변경 신호를 보냅니다.
                triggerPostChange();
            } else {
                // ✅ 생성 모드일 경우
                const createPayload = {...journalPayload, logDate: selectedDate};
                await createJournalEntry(createPayload);
                alert('Journal saved successfully!');
                // [핵심 추가] 생성 성공 후에도 게시물 변경 신호를 보냅니다.
                triggerPostChange();
            }
        } catch (error) {
            console.error("Failed to save journal:", error);
            // 서버에서 보낸 에러 메시지가 있다면 보여주는 것이 더 좋습니다.
            alert(error.response?.data?.message || 'Failed to save journal.');
        } finally {
            setIsSubmitting(false); // 제출 상태 해제
            onClose(); // 모든 작업 후 모달 닫기
        }
    };

    // --- 렌더링 분기: 편집 모드일 경우 편집기 UI를 보여줍니다. ---
    if (editingImageInfo) {
        return (
            <ImageEditor
                imageInfo={editingImageInfo}
                onSave={handleSaveEdit}
                onCancel={handleCancelEdit}
                onFabricModeChange={onFabricModeChange}
            />
        );
    }

    return (
        <>
            {/* ✅ [수정] JournalWriteContainer와 SpringBinder를 사용하여 일기장 디자인 적용 */}
            <JournalWriteContainer>
                <SpringBinder src={spring} alt="Spring binder"/>
                <SpringBinder2 src={spring} alt="Spring binder"/>
                <ModalHeader>
                    <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                        <ProfilePicture
                            src={user?.picture || 'https://via.placeholder.com/48'}
                            alt={`${user?.name || 'user'} profile`}
                            referrerPolicy="no-referrer"/>
                        <span style={{fontWeight: 600}}>{user?.name || 'User'}</span>
                    </div>
                    <CloseButton onClick={onClose}>×</CloseButton>
                </ModalHeader>
                <ModalTitle>{formattedDate}</ModalTitle>
                <FormContent>
                    <StyledTextarea
                        ref={textareaRef}
                        value={content}
                        onChange={handleContentChange}
                        onDragEnter={handleDragEnter}
                        onDragLeave={handleDragLeave}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                        $isDragging={isDragging} // ✅ 스타일링을 위해 isDragging 상태 전달
                        placeholder="Share what happened today📝"
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
                                accept="image/jpeg, image/png"
                                style={{display: 'none'}}
                            />
                            <IconButton data-tooltip="Add image" onClick={handleImageButtonClick}
                                        disabled={images.length >= MAX_IMAGE_LIMIT}>
                                <FaImage/>
                            </IconButton>
                            <ActionButtonWrapper ref={emojiPickerContainerRef}>
                                <IconButton data-tooltip="Add emoji" onClick={handleEmojiIconClick}>
                                    <FaSmile/>
                                </IconButton>
                                {showEmojiPicker && (
                                    <EmojiPickerWrapper>
                                        <EmojiPicker onEmojiClick={onEmojiClick}/>
                                    </EmojiPickerWrapper>
                                )}
                            </ActionButtonWrapper>
                        </ActionButtons>
                        <CharCounter $error={content.length === MAX_CHAR_LIMIT}>
                            {content.length} / {MAX_CHAR_LIMIT}
                        </CharCounter>
                        <VisibilitySelector>
                            <VisibilityButton onClick={() => setIsVisibilityDropdownOpen(prev => !prev)}>
                                {visibilityOptions[visibility].icon}
                                <span>{visibilityOptions[visibility].text}</span>
                            </VisibilityButton>
                            {isVisibilityDropdownOpen && (
                                <VisibilityDropdown>
                                    {Object.entries(visibilityOptions).map(([key, {icon, text}]) => (
                                        <VisibilityOption key={key} onClick={() => handleVisibilityChange(key)}>
                                            {icon}
                                            <span>{text}</span>
                                        </VisibilityOption>
                                    ))}
                                </VisibilityDropdown>
                            )}
                        </VisibilitySelector>
                        <PostButton onClick={onSubmit}
                                    disabled={(!content.trim() && images.length === 0) || isSubmitting}>
                            {isSubmitting ? (isEditMode ? 'Updating...' : 'Saving...') : (isEditMode ? 'Edit' : 'Upload')}
                        </PostButton>
                    </ActionBar>
                </FormContent>
            </JournalWriteContainer>
        </>
    );
};

export default JournalWrite;