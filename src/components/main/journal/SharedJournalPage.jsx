import React, {useState, useEffect, useCallback} from 'react';
import {useParams, useNavigate} from 'react-router-dom';
import styled from 'styled-components';
import {Spin, Modal, message} from 'antd';
import {useAuth} from '../../../AuthContext';
import {api, getPostLikers, toggleLike} from '../../../api';

// PostList.jsx에서 JournalItem과 필요한 컴포넌트들을 가져옵니다.
// 실제로는 PostList.jsx에서 JournalItem을 별도 파일로 분리하는 것이 더 좋습니다.
// 여기서는 설명을 위해 PostList.jsx에서 직접 가져온다고 가정합니다.
import {JournalItem} from '../post/PostList';
import PostLikersModal from '../post/PostLikersModal';
import {OriginalImage} from '../../../styled_components/main/post/PostListStyled';

const PageContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: flex-start; /* 위쪽 정렬 */
    min-height: 100vh;
    padding-top: 80px; /* 헤더 높이만큼 여백 */
    background-color: #ffffff;
`;

const ContentWrapper = styled.div`
    width: 100%;
    max-width: 550px; /* JournalItem의 최대 너비와 유사하게 설정 */
`;

const LoadingContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 50vh;
`;

const ErrorContainer = styled.div`
    text-align: center;
    padding: 40px 20px;
    font-size: 1.2rem;
    color: #555;
`;

const SharedJournalPage = () => {
    const {shareId} = useParams();
    const navigate = useNavigate();
    const {user} = useAuth();

    const [journal, setJournal] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // PostList에 있던 모달 관련 상태들을 가져옵니다.
    const [isLikersModalOpen, setLikersModalOpen] = useState(false);
    const [likersList, setLikersList] = useState([]);
    const [isLikersLoading, setIsLikersLoading] = useState(false);
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);
    const [selectedImageUrl, setSelectedImageUrl] = useState('');

    useEffect(() => {
        const fetchSharedJournal = async () => {
            if (!shareId) return;
            setLoading(true);
            try {
                // ✅ 우리가 설계한 새로운 공유 API 호출
                const response = await api.get(`/api/i-log/share/${shareId}`);
                setJournal(response.data);
            } catch (err) {
                console.error("공유 일기 로딩 실패:", err);
                setError(err.response?.data?.message || "일기를 불러올 수 없습니다.");
            } finally {
                setLoading(false);
            }
        };

        fetchSharedJournal();
    }, [shareId]);

    // PostList에 있던 핸들러 함수들을 이 페이지에 맞게 가져옵니다.
    const handleProfileClick = useCallback((writerId) => {
        if (writerId) navigate(`/mypage/${writerId}`);
    }, [navigate]);

    const handleImageClick = useCallback((imageUrl) => {
        setSelectedImageUrl(imageUrl);
        setIsImageModalOpen(true);
    }, []);

    const handleLikeClick = useCallback(async (postId) => {
        if (!journal) return;
        // 낙관적 업데이트
        setJournal(prev => ({
            ...prev,
            liked: !prev.liked,
            likeCount: prev.liked ? prev.likeCount - 1 : prev.likeCount + 1,
        }));

        try {
            await toggleLike(postId, user?.id);
        } catch (error) {
            console.error("좋아요 처리 중 오류 발생:", error);