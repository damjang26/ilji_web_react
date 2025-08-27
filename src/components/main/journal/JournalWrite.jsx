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
import {ModalHeader} from '../../../styled_components/main/journal/ModalStyled';

const MAX_CHAR_LIMIT = 3000;
const MAX_IMAGE_LIMIT = 3;

const JournalWrite = ({onClose, selectedDate}) => {
    const {user} = useAuth(); // 현재 로그인한 유저 정보
    const {addJournal} = useJournal(); // ✅ JournalContext에서 저장 함수 가져오기
    const [isSubmitting, setIsSubmitting] = useState(false); // ✅ 제출 중 상태 추가
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

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
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

    const handleRemoveImage = (indexToRemove) => {
        setImages(prevImages => prevImages.filter((_, index) => index !== indexToRemove));
    };

    const handleImageButtonClick = () => {
        fileInputRef.current.click();
    };

    // TODO: 이모티콘, 친구 태그 기능 구현
    const handleEmojiClick = () => alert('이모티콘 기능 구현 예정');
    const handleTagClick = () => alert('친구 태그 기능 구현 예정');

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
                        placeholder="오늘은 무슨 일이 있었나요?"
                    />

                    {images.length > 0 && (
                        <ImagePreviewContainer>
                            {images.map((image, index) => (
                                <ImagePreviewWrapper key={index}>
                                    <img src={image.preview} alt={`preview ${index}`}/>
                                    <RemoveImageButton onClick={() => handleRemoveImage(index)}>×</RemoveImageButton>
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