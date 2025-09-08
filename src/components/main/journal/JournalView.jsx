import React, {useCallback, useMemo} from 'react';
import {useParams, useNavigate, useLocation} from 'react-router-dom';
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
    const navigate = useNavigate(); // ✅ 페이지 이동을 위해 useNavigate 훅을 사용합니다.
    const location = useLocation(); // ✅ 모달 네비게이션의 배경 위치를 위해 추가합니다.
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
                    {/* ✅ [수정] onClick 핸들러에 handleEdit 함수를 연결합니다. */}
                    <button data-tooltip="수정" onClick={() => handleEdit(journal)}>
                        <HiPencilAlt/>
                    </button>
                    <button data-tooltip="삭제" onClick={() => handleDelete(journal.id, date)}>
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