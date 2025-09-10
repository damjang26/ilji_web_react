import React, {useCallback, useMemo, useState} from 'react';
import {useParams, useNavigate, useLocation} from 'react-router-dom';
import {useJournal} from '../../../contexts/JournalContext';
import {
    ViewContainer,
    ProfileSection,
    ProfilePicture,
    AuthorInfo,
    AuthorName,
    DateDisplay,
    ContentSection,
    BookLayoutContainer,
    ImageSliderContainer,
    ImageSlide,
    SliderArrow,
    ContentContainer
} from '../../../styled_components/main/journal/JournalViewStyled';
import {HiPencilAlt} from "react-icons/hi";
import {MdDeleteForever} from "react-icons/md";
import {PostHeaderActions} from "../../../styled_components/main/post/PostListStyled.jsx";
import {FaChevronLeft, FaChevronRight} from "react-icons/fa";

const JournalView = () => {
    const {journalId} = useParams(); // ✅ [수정] URL에서 journalId를 가져옵니다.
    const {deleteJournal} = useJournal();
    const navigate = useNavigate(); // ✅ 페이지 이동을 위해 useNavigate 훅을 사용합니다.
    const location = useLocation(); // ✅ 모달 네비게이션의 배경 위치를 위해 추가합니다.

    // ✅ [수정] API 호출 없이 location.state에서만 데이터를 가져옵니다.
    const journal = location.state?.journalData;
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const formattedDate = useMemo(() => {
        // ✅ [수정] URL 파라미터 대신 journal 객체의 logDate를 사용합니다.
        if (!journal?.logDate) return '';
        const d = new Date(journal.logDate);
        return d.toLocaleDateString('ko-KR', {year: 'numeric', month: 'long', day: 'numeric'});
    }, [journal]);

    const imageUrls = useMemo(() => {
        if (journal && Array.isArray(journal.images)) {
            return journal.images;
        }
        return [];
    }, [journal]);

    const handleDelete = async (journalId, pageDate) => {
        // 사용자가 정말 삭제할 것인지 확인
        if (window.confirm("정말로 이 일기를 삭제하시겠습니까?")) {
            try {
                // Context의 deleteJournal 함수 호출
                await deleteJournal(journalId, pageDate);
                alert("일기가 삭제되었습니다.");
                // ✅ 삭제 성공 후, 이전 페이지(일기 목록)로 이동시킵니다.
                navigate(-1);
            } catch (error) {
                alert("일기 삭제 중 오류가 발생했습니다.");
            }
        }
    };

    // ✅ [추가] 수정 버튼 클릭 핸들러
    const handleEdit = useCallback((journalToEdit) => {
        // ✅ [수정] 확인 창 없이 바로 수정 모드로 진입하도록 변경
        console.log("✏️ 수정할 일기 객체:", journalToEdit);
        navigate('/journal/write', {
            state: {
                journalToEdit: journalToEdit, // 수정할 일기 데이터를 전달합니다.
                backgroundLocation: location, // 모달 뒤에 현재 페이지를 배경으로 유지합니다.
            }
        });
    }, [navigate, location]); // navigate와 location이 변경될 때만 함수를 재생성합니다.

    const handleNextImage = useCallback(() => {
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % imageUrls.length);
    }, [imageUrls.length]);

    const handlePrevImage = useCallback(() => {
        setCurrentImageIndex((prevIndex) => (prevIndex - 1 + imageUrls.length) % imageUrls.length);
    }, [imageUrls.length]);

    if (!journal) {
        return <ViewContainer className="no-image"><p>일기 정보를 불러올 수 없습니다. 목록에서 다시 시도해주세요.</p></ViewContainer>;
    }

    // 이미지가 있는지 여부 확인
    const hasImages = imageUrls.length > 0;

    // 이미지가 없는 경우의 UI
    if (!hasImages) {
        return (
            <ViewContainer className="no-image">
                <ProfileSection>
                    <ProfilePicture
                        src={journal?.writerProfileImage || 'https://via.placeholder.com/48'}
                        alt={`${journal?.writerNickname || 'user'} profile`}
                        referrerPolicy="no-referrer"/>
                    <AuthorInfo>
                        <AuthorName>{journal?.writerNickname || '사용자'}</AuthorName>
                        <DateDisplay>{formattedDate}</DateDisplay>
                    </AuthorInfo>
                    <PostHeaderActions>
                        <button data-tooltip="수정" onClick={() => handleEdit(journal)}>
                            <HiPencilAlt/>
                        </button>
                        <button data-tooltip="삭제"
                                onClick={() => handleDelete(journal.id, journal.logDate.split('T')[0])}>
                            <MdDeleteForever/>
                        </button>
                    </PostHeaderActions>
                </ProfileSection>
                <ContentSection>
                    <p>{journal.content}</p>
                </ContentSection>
            </ViewContainer>
        );
    }

    // 이미지가 있는 경우의 UI (책 레이아웃)
    return (
        <ViewContainer className="has-image">
            <BookLayoutContainer>
                <ImageSliderContainer>
                    <ImageSlide src={imageUrls[currentImageIndex]} alt={`journal image ${currentImageIndex + 1}`}/>
                    {imageUrls.length > 1 && (
                        <>
                            <SliderArrow className="prev" onClick={handlePrevImage}><FaChevronLeft/></SliderArrow>
                            <SliderArrow className="next" onClick={handleNextImage}><FaChevronRight/></SliderArrow>
                        </>
                    )}
                </ImageSliderContainer>
                <ContentContainer>
                    <ProfileSection>
                        <ProfilePicture
                            src={journal?.writerProfileImage || 'https://via.placeholder.com/48'}
                            alt={`${journal?.writerNickname || 'user'} profile`}
                            referrerPolicy="no-referrer"/>
                        <AuthorInfo>
                            <AuthorName>{journal?.writerNickname || '사용자'}</AuthorName>
                            <DateDisplay>{formattedDate}</DateDisplay>
                        </AuthorInfo>
                        <PostHeaderActions>
                            <button data-tooltip="수정" onClick={() => handleEdit(journal)}>
                                <HiPencilAlt/>
                            </button>
                            <button data-tooltip="삭제"
                                    onClick={() => handleDelete(journal.id, journal.logDate.split('T')[0])}>
                                <MdDeleteForever/>
                            </button>
                        </PostHeaderActions>
                    </ProfileSection>
                    <ContentSection>
                        <p>{journal.content}</p>
                    </ContentSection>
                </ContentContainer>
            </BookLayoutContainer>
        </ViewContainer>
    );
};

export default JournalView;