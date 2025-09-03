import {Link, useNavigate} from "react-router-dom";
import React, {useState, useEffect, useCallback} from "react";
import {useAuth} from "../../../AuthContext";
import {api} from "../../../api";
import ImageBox from "./ImageBox";

import {
    ContentBox, FeatureBox, FeatureContent, HeaderContent, ImgWrapper,
    MyPageContainer, MyPageHeader, MypageImg, MyPageMain, Tab, TabMenuContainer, UserActions, UserInfo,
} from "../../../styled_components/main/mypage/MyPageStyled.jsx";
import JournalList from "./feature/JournalList.jsx";

const MyPage = () => {
    const {user} = useAuth();
    const navigate = useNavigate();

    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('feature1');

    // 모달 상태 관리를 위한 state 추가
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingImageType, setEditingImageType] = useState(null); // 'profileImage' 또는 'bannerImage'

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

    // 이미지 클릭 시 모달을 여는 함수
    const handleImageClick = (imageType) => {
        setEditingImageType(imageType);
        setIsModalOpen(true);
    };

    // 모달에서 '확인'을 눌렀을 때, 이미지를 즉시 서버에 업데이트하는 함수
    const handleImageUpdate = async (imageType, newUrl) => {
        if (!profile) return;

        // 먼저 화면에 즉시 반영되도록 로컬 상태를 업데이트
        const updatedProfile = {...profile, [imageType]: newUrl};
        setProfile(updatedProfile);

        try {
            // 서버에 변경된 전체 프로필 정보를 전송하여 저장
            await api.put(`/api/profiles/user/${user.id}`, updatedProfile);
            alert('이미지가 성공적으로 업데이트되었습니다.');
        } catch (err) {
            console.error("이미지 업데이트 실패:", err);
            alert('이미지 업데이트 중 오류가 발생했습니다.');
            fetchProfile(); // 실패 시 원래 데이터로 복구
        }
    };

    if (loading) return <div>로딩 중...</div>;
    if (error) return <div style={{color: 'red'}}>{error}</div>;
    if (!profile) return <div>프로필 정보가 없습니다.</div>;

    return (
        <MyPageContainer>
            {/* 클릭 가능한 배경 배너 */}
            <MypageImg
                style={{
                    backgroundImage: `url(${profile.bannerImage || ''})`,
                    cursor: 'pointer',
                    position: 'relative'
                }}
                onClick={() => handleImageClick('bannerImage')}
            >
            </MypageImg>
            <ContentBox>
                <MyPageHeader>
                    {/* 클릭 가능한 프로필 이미지 */}
                    <ImgWrapper style={{marginTop: '0px', marginBottom: '20px'}}>
                        <img
                            src={profile.profileImage || '/default-profile.png'}
                            alt="Profile"
                            onClick={() => handleImageClick('profileImage')}
                            style={{
                                width: '120px',
                                height: '120px',
                                borderRadius: '50%',
                                objectFit: 'cover',
                                border: '4px solid #fff',
                                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                                cursor: 'pointer'
                            }}
                        />
                    </ImgWrapper>
                    <HeaderContent>
                        <UserInfo>
                            <div className="nickname">{profile.nickname || 'Guest'}</div>
                            <div className="email">{profile.email || 'guest@example.com'}</div>
                            <div>{profile.bio || '자기소개가 없습니다.'}</div>
                        </UserInfo>
                        <UserActions>
                            <div>post</div>
                            <div>follow</div>
                            <div>follower</div>
                            <button onClick={() => navigate('/mypageset')}>정보수정</button>
                        </UserActions>
                    </HeaderContent>
                </MyPageHeader>
                <MyPageMain>
                    <TabMenuContainer>
                        <Tab active={activeTab === 'feature1'} onClick={() => setActiveTab('feature1')}>i-log</Tab>
                        <Tab active={activeTab === 'feature2'} onClick={() => setActiveTab('feature2')}>좋아요</Tab>
                        <Tab active={activeTab === 'feature3'} onClick={() => setActiveTab('feature3')}>구독</Tab>
                    </TabMenuContainer>
                    <FeatureContent>
                        {activeTab === 'feature1' && <JournalList/>}
                        {activeTab === 'feature2' && <FeatureBox>기능2</FeatureBox>}
                        {activeTab === 'feature3' && <FeatureBox>기능3</FeatureBox>}
                        {activeTab === 'feature4' && <FeatureBox>기능4</FeatureBox>}
                    </FeatureContent>
                </MyPageMain>
            </ContentBox>

            {/* 이미지 수정 모달 */}
            <ImageBox
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                currentImageUrl={profile[editingImageType]}
                onConfirm={handleImageUpdate}
                imageType={editingImageType}
            />
        </MyPageContainer>
    )
}
export default MyPage;