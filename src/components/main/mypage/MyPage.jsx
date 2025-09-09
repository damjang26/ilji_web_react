import {Link, useNavigate, useLocation} from "react-router-dom";
import React, {useState, useEffect, useCallback} from "react";
import {useAuth} from "../../../AuthContext";
import {api} from "../../../api";
import ImageBox from "./ImageBox";

import {
    ContentBox, FeatureBox, FeatureContent, HeaderContent, ImgWrapper,
    MyPageContainer, MyPageHeader, MypageImg, MyPageMain, Tab, TabMenuContainer, UserActions, UserInfo,
} from "../../../styled_components/main/mypage/MyPageStyled.jsx";
import JournalList from "./feature/JournalList.jsx";
import FriendManagementModal from "../../friends/FriendManagementModal.jsx";

const MyPage = () => {
    const {user} = useAuth();
    const navigate = useNavigate();

    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('feature1');

    // 모달 상태 관리를 위한 state 추가
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);
    const [editingImageType, setEditingImageType] = useState(null);
    const [isFriendModalOpen, setIsFriendModalOpen] = useState(false);
    const [friendModalInitialTab, setFriendModalInitialTab] = useState('following');

    const fetchProfile = useCallback(async () => {
        if (!user || !user.id) {
            setLoading(false);
            setError('사용자 정보를 불러올 수 없습니다. 다시 로그인해주세요.');
            return;
        }
        try {
            setLoading(true);
            const response = await api.get(`/api/profiles/user/${user.id}`);
            setProfile(response.data);
            setError(null);
        } catch (err) {
            console.error("프로필 정보 로딩 실패:", err);
            setError('프로필 정보를 불러오는 데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    const handleImageClick = (imageType) => {
        setEditingImageType(imageType);
        setIsImageModalOpen(true);
    };

    const handleFriendModalOpen = (initialTab) => {
        setFriendModalInitialTab(initialTab);
        setIsFriendModalOpen(true);
    };

    const handleImageUpdate = async (imageType, newUrl) => {
        if (!profile) return;

        const updatedProfile = {...profile, [imageType]: newUrl};
        setProfile(updatedProfile);

        try {
            await api.put(`/api/profiles/user/${user.id}`, updatedProfile);
            alert('이미지가 성공적으로 업데이트되었습니다.');
        } catch (err) {
            console.error("이미지 업데이트 실패:", err);
            alert('이미지 업데이트 중 오류가 발생했습니다.');
            fetchProfile();
        }
    };

    if (loading) return <div>로딩 중...</div>;
    if (error) return <div style={{color: 'red'}}>{error}</div>;
    if (!profile) return <div>프로필 정보가 없습니다.</div>;

    return (
        <MyPageContainer>
            <MypageImg
                style={{ backgroundImage: `url(${profile.bannerImage || ''})`, cursor: 'pointer', position: 'relative' }}
                onClick={() => handleImageClick('bannerImage')}
            >
            </MypageImg>
            <ContentBox>
                <MyPageHeader>
                    <ImgWrapper style={{marginTop: '10px', marginBottom: '10px'}}>
                        <img
                            src={profile.profileImage || '/default-profile.png'}
                            alt="Profile"
                            onClick={() => handleImageClick('profileImage')}
                            style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover', border: '4px solid #fff', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)', cursor: 'pointer' }}
                        />
                    </ImgWrapper>
                    <HeaderContent>
                        <UserInfo>
                            <div className="nickname">{profile.nickname || 'Guest'}</div>
                            <div className="email">{profile.email || 'guest@example.com'}</div>
                            <div>{profile.bio || ''}</div>
                        </UserInfo>
                        <UserActions>
                            <div>post</div>
                            <div onClick={() => handleFriendModalOpen('following')} style={{cursor: 'pointer'}}>follow</div>
                            <div onClick={() => handleFriendModalOpen('followers')} style={{cursor: 'pointer'}}>follower</div>
                            <button onClick={() => navigate('/mypageset')}>정보수정</button>
                        </UserActions>
                    </HeaderContent>
                </MyPageHeader>
                <MyPageMain>
                    <TabMenuContainer>
                        <Tab $active={activeTab === 'feature1'} onClick={() => setActiveTab('feature1')}>i-log</Tab>
                        <Tab $active={activeTab === 'feature2'} onClick={() => setActiveTab('feature2')}>좋아요</Tab>
                        <Tab $active={activeTab === 'feature3'} onClick={() => setActiveTab('feature3')}>구독</Tab>
                    </TabMenuContainer>
                    <FeatureContent>
                        {activeTab === 'feature1' && <JournalList/>}
                        {activeTab === 'feature2' && <FeatureBox>기능2</FeatureBox>}
                        {activeTab === 'feature3' && <FeatureBox>기능3</FeatureBox>}
                    </FeatureContent>
                </MyPageMain>
            </ContentBox>

            <ImageBox
                isOpen={isImageModalOpen}
                onClose={() => setIsImageModalOpen(false)}
                currentImageUrl={profile[editingImageType]}
                onConfirm={handleImageUpdate}
                imageType={editingImageType}
            />
            <FriendManagementModal
                open={isFriendModalOpen}
                onClose={() => setIsFriendModalOpen(false)}
                initialTab={friendModalInitialTab}
            />
        </MyPageContainer>
    )
}
export default MyPage;