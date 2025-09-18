import {Link, useParams} from "react-router-dom"; // [추가] useParams import
import React, {useState, useCallback, useEffect} from "react";
import ImageBox from "./ImageBox";
import BannerImageEditor from "./BannerImageEditor.jsx";
import {followUser, unfollowUser} from "../../../api"; // [추가]

import {
    FeatureBox,
    FeatureContent,
    HeaderContent,
    ImgWrapper,
    MyPageContainer,
    MyPageHeader,
    MypageImg,
    MyPageMain,
    ProfileImage,
    Tab,
    TabMenuContainer,
    UserActions,
    ContentBox,
    UserInfo,
} from "../../../styled_components/main/mypage/MyPageStyled.jsx";
import {MyPageProvider, useMyPage} from "../../../contexts/MyPageContext.jsx";
import {useAuth} from "../../../AuthContext.jsx"; // [추가]
import {JournalProvider} from "../../../contexts/JournalContext.jsx"; // [추가]
import JournalList from "./feature/JournalList.jsx";
import FriendManagementModal from "../../friends/FriendManagementModal.jsx";
import MyPageSet from "./MyPageSet.jsx";
import LikeList from "./feature/LikeList.jsx"; // Import the component to switch to

/**
 * MyPageContent - UI 렌더링만 담당
 */
// [되돌리기] MyPageContent의 이름을 MyPage로 변경하고, MyPageWrapper가 이 컴포넌트를 렌더링하도록 구조를 변경합니다.
const MyPage = () => {
    const {userId} = useParams(); // [추가] URL에서 userId를 가져옵니다.
    // [수정] AuthContext에서 전역 상태를 가져옵니다.
    const {user: loggedInUser, following: myFollowing, fetchMyFollowing} = useAuth();
    const {
        profile,
        loading,
        error,
        updateProfile,
        handleEdit,
    } = useMyPage();

    // [수정] isOwner와 isFollowing을 AuthContext와 useParams를 기반으로 계산합니다.
    const isOwner = !userId || (loggedInUser && loggedInUser.id.toString() === userId);
    const isFollowing = (myFollowing && Array.isArray(myFollowing))
        ? myFollowing.some(f => f?.userId?.toString() === userId)
        : false;
    // [추가] 팔로우/언팔로우 토글 핸들러
    const handleFollowToggle = useCallback(async () => {
        if (!loggedInUser || isOwner) return;

        try {
            if (isFollowing) {
                await unfollowUser(userId);
            } else {
                await followUser(userId);
            }
            // [핵심] API 호출 성공 후, AuthContext의 전역 팔로잉 목록을 새로고침합니다.
            await fetchMyFollowing();
        } catch (err) {
            console.error('팔로우 상태 변경에 실패했습니다.', err);
            // 필요하다면 사용자에게 에러 메시지를 보여줄 수 있습니다.
        }
    }, [isFollowing, userId, loggedInUser, isOwner, fetchMyFollowing]);

    // 모달 상태 관리를 위한 state 추가
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);
    const [editingImageType, setEditingImageType] = useState(null);
    const [isFriendModalOpen, setIsFriendModalOpen] = useState(false);
    const [friendModalInitialTab, setFriendModalInitialTab] =
        useState("following");

    // ImageBox에서 확인 버튼 눌렀을 때
    const handleImageConfirm = useCallback(
        async (imageFile) => {
            if (!imageFile) return;
            // [수정] updateProfile 호출 시 loggedInUser.id를 전달하지 않습니다.
            // Context가 이미 로그인 상태를 알고 있으므로, 파일 정보만 전달합니다.
            await updateProfile({}, {profileImageFile: imageFile});
            setIsImageModalOpen(false); // 성공 시 모달 닫기
        },
        [updateProfile]
    );

    const [activeTab, setActiveTab] = useState("feature1");

    const [isBannerEditorOpen, setIsBannerEditorOpen] = useState(false);

    // 이미지 클릭 시 모달을 여는 함수
    const handleImageClick = (imageType) => {
        // [수정] isOwner가 false이면(친구 페이지) 아무 작업도 하지 않고 함수를 종료합니다.
        if (!isOwner) return;

        if (imageType === "bannerImage") {
            setIsBannerEditorOpen(true); // 배너 클릭 시 배너 편집기 열기
        } else {
            setEditingImageType(imageType); // 프로필 이미지 클릭 시 일반 이미지 모달 열기
            setIsImageModalOpen(true);
        }
    };
    const handleFriendModalOpen = (initialTab) => {
        setFriendModalInitialTab(initialTab);
        setIsFriendModalOpen(true);
    };

    // BannerImageEditor에서 편집 완료 후
    const handleBannerCropComplete = useCallback(
        async (croppedFile) => {
            // updateProfile 호출 시 파일 정보만 전달합니다.
            await updateProfile({}, {bannerImageFile: croppedFile});
            setIsBannerEditorOpen(false);
        },
        [updateProfile]
    );

    // 로딩/에러 처리
    if (loading) return <div>로딩 중...</div>;
    if (error) return <div style={{color: "red"}}>{error}</div>;
    if (!loading && !profile) return <div>프로필 정보가 없습니다.</div>;
    return (
        <MyPageContainer>
            {/* 클릭 가능한 배경 배너 */}
            <MypageImg
                style={{
                    backgroundImage: `url(${profile.bannerImage || ""})`,
                }}
                // [수정] isOwner일 때만 커서 포인터를 적용합니다.
                onClick={isOwner ? () => handleImageClick("bannerImage") : undefined}
                $isOwner={isOwner}
            />
            <ContentBox>
                <MyPageHeader>
                    {/* 클릭 가능한 프로필 이미지 */}
                    <ImgWrapper>
                        <ProfileImage
                            src={profile.profileImage || "/default-profile.png"}
                            alt="Profile"
                            // [수정] isOwner일 때만 커서 포인터를 적용합니다.
                            onClick={isOwner ? () => handleImageClick("profileImage") : undefined}
                            $isOwner={isOwner}
                        />
                    </ImgWrapper>
                    <HeaderContent>
                        <UserInfo>
                            <div className="nickname">{profile.nickname || "Guest"}</div>
                            {/* [수정] isOwner만 이메일 표시 */}
                            {isOwner && (
                                <div className="email">
                                    {profile.email || "guest@example.com"}
                                </div>
                            )}
                            <div>{profile.bio || ""}</div>
                        </UserInfo>
                        <UserActions>
                            <div>post</div>
                            <div
                                onClick={() => handleFriendModalOpen("following")}
                                style={{cursor: "pointer"}}
                            >
                                follow
                            </div>
                            <div
                                onClick={() => handleFriendModalOpen("followers")}
                                style={{cursor: "pointer"}}
                            >
                                follower
                            </div>
                            {/* [수정] isOwner 값에 따라 다른 버튼을 렌더링합니다. */}
                            {isOwner ? (
                                // 내 페이지일 경우 '정보수정' 버튼을 보여줍니다.
                                <button onClick={handleEdit}>정보수정</button>
                            ) : (
                                // 친구 페이지일 경우 '팔로우/언팔로우' 버튼을 보여줍니다.
                                <button onClick={handleFollowToggle}>
                                    {isFollowing ? 'following' : 'follow'}
                                </button>
                            )}
                        </UserActions>
                    </HeaderContent>
                </MyPageHeader>
                <MyPageMain>
                    <TabMenuContainer>
                        <Tab
                            $active={activeTab === "feature1"}
                            onClick={() => setActiveTab("feature1")}
                        >
                            i-log
                        </Tab>
                        <Tab
                            $active={activeTab === "feature2"}
                            onClick={() => setActiveTab("feature2")}
                        >
                            Liked i-log
                        </Tab>
                        <Tab
                            $active={activeTab === "feature3"}
                            onClick={() => setActiveTab("feature3")}
                        >
                            구독
                        </Tab>
                    </TabMenuContainer>
                    <FeatureContent>
                        {/* [수정] JournalList를 JournalProvider로 감싸고 userId를 전달합니다. */}
                        {activeTab === "feature1" && (
                            <JournalProvider userId={userId}>
                                <JournalList/>
                            </JournalProvider>
                        )}
                        {activeTab === "feature2" && (
                            <LikeList/>
                        )}
                        {activeTab === "feature3" && <FeatureBox>기능3</FeatureBox>}
                        {activeTab === "feature4" && <FeatureBox>기능4</FeatureBox>}
                    </FeatureContent>
                </MyPageMain>
            </ContentBox>

            {/* 이미지 수정 모달 */}
            {/* [수정] ImageBox 모달 - isEditable에 isOwner 전달 */}
            <ImageBox
                isOpen={isImageModalOpen}
                onClose={() => setIsImageModalOpen(false)}
                currentImageUrl={
                    profile && editingImageType && profile[editingImageType]
                        ? profile[editingImageType].split("?")[0]
                        : ""
                }
                onConfirm={handleImageConfirm}
                imageType={editingImageType}
                isEditable={isOwner} // isOwner를 전달하여 편집 가능 여부 제어
            />

            <BannerImageEditor
                isOpen={isBannerEditorOpen}
                onClose={() => setIsBannerEditorOpen(false)}
                onCropComplete={handleBannerCropComplete}
                isEditable={isOwner} // isOwner를 전달하여 편집 가능 여부 제어
            />
            <FriendManagementModal
                open={isFriendModalOpen}
                onClose={() => setIsFriendModalOpen(false)}
                initialTab={friendModalInitialTab}
                // [수정] 현재 보고 있는 페이지의 userId를 targetUserId prop으로 전달합니다.
                targetUserId={userId}
            />
        </MyPageContainer>
    );
};

/**
 * MyPage - Manager
 * paramUserId가 있으면 친구 페이지, 없으면 로그인 사용자 페이지
 * [되돌리기] 이 컴포넌트는 이제 Provider를 감싸는 Wrapper 역할만 담당합니다.
 */
const MyPageWrapper = () => {
    // URL에서 userId 파라미터를 가져옵니다. (예: /mypage/123 -> userId는 "123")
    // URL이 /mypage이면 userId는 undefined가 됩니다.
    const {userId} = useParams();

    // The Wrapper's job is to provide the context and render the switcher.
    return (
        // [수정] MyPageProvider에 userId를 전달합니다.
        <MyPageProvider userId={userId}>
            <PageSwitcher/>
        </MyPageProvider>
    );
};

const PageSwitcher = () => {
    const {isEditing} = useMyPage();
    return isEditing ? <MyPageSet/> : <MyPage/>;
};

export default MyPageWrapper;
