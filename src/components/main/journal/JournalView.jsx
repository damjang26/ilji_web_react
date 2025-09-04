import React, {useMemo} from 'react';
import {useParams} from 'react-router-dom';
import {useJournal} from '../../../contexts/JournalContext';
import {useAuth} from '../../../AuthContext';
import {
    ViewContainer,
    ProfileSection,
    ProfilePicture,
    AuthorInfo,
    AuthorName,
    DateDisplay,
    ContentSection,
    ImageGrid,
    JournalImage
} from '../../../styled_components/main/journal/JournalViewStyled';
import {HiPencilAlt} from "react-icons/hi";
import {MdDeleteForever} from "react-icons/md";
import {PostHeaderActions} from "../../../styled_components/main/post/PostListStyled.jsx";

const JournalView = () => {
    const {date} = useParams(); // URL에서 날짜 파라미터를 가져옵니다.
    const {getJournal, deleteJournal} = useJournal();
    const {user} = useAuth(); // 작성자 정보를 위해 user를 가져옵니다.

    const journal = useMemo(() => getJournal(date), [getJournal, date]);

    const formattedDate = useMemo(() => {
        if (!date) return '';
        const d = new Date(date);
        return d.toLocaleDateString('ko-KR', {year: 'numeric', month: 'long', day: 'numeric'});
    }, [date]);

    // ✅ [추가] DB에 저장된 imgUrl(JSON 문자열)을 실제 이미지 URL 배열로 파싱합니다.
    const imageUrls = useMemo(() => {
        if (journal && journal.imgUrl) {
            try {
                const parsedUrls = JSON.parse(journal.imgUrl);
                // 파싱된 결과가 배열인지 확인합니다.
                if (Array.isArray(parsedUrls)) {
                    return parsedUrls;
                }
            } catch (error) {
                console.error("일기 이미지 URL을 파싱하는 데 실패했습니다:", error);
                return [];
            }
        }
        return [];
    }, [journal]);

    if (!journal) {
        return <ViewContainer><p>해당 날짜의 일기를 찾을 수 없습니다.</p></ViewContainer>;
    }

    const handleDelete = async (journalId, journalDate) => {
        // 사용자가 정말 삭제할 것인지 확인
        if (window.confirm("정말로 이 일기를 삭제하시겠습니까?")) {
            try {
                // Context의 deleteJournal 함수 호출
                await deleteJournal(journalId, journalDate);
                alert("일기가 삭제되었습니다.");
            } catch (error) {
                alert("일기 삭제 중 오류가 발생했습니다.");
            }
        }
    };

    return (
        <ViewContainer>
            <ProfileSection>
                <ProfilePicture
                    src={user?.picture || 'https://via.placeholder.com/48'}
                    alt={`${user?.name || 'user'} profile`}
                    referrerPolicy="no-referrer"/>
                <AuthorInfo>
                    <AuthorName>{user?.name || '사용자'}</AuthorName>
                    <DateDisplay>{formattedDate}</DateDisplay>
                </AuthorInfo>
                <PostHeaderActions>
                    <button title="수정">
                        <HiPencilAlt/>
                    </button>
                    <button title="삭제"
                            onClick={() => handleDelete(journal.id, journal.ilogDate.split('T')[0])}>
                        <MdDeleteForever/>
                    </button>
                </PostHeaderActions>
            </ProfileSection>
            {/* ✅ [수정] 파싱된 imageUrls 배열을 사용하여 이미지를 렌더링합니다. */}
            {imageUrls.length > 0 && (
                <ImageGrid imageCount={imageUrls.length}>
                    {imageUrls.map((imgSrc, index) => (
                        <JournalImage key={index} src={imgSrc} alt={`journal image ${index + 1}`}/>
                    ))}
                </ImageGrid>
            )}
            <ContentSection>
                <p>{journal.content}</p>
            </ContentSection>
        </ViewContainer>
    );
};

export default JournalView;