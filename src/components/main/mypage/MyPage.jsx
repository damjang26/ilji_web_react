import {Link, useParams} from "react-router-dom"; // [추가] useParams import
import React, {useState, useCallback, useEffect} from "react";
import { EllipsisOutlined } from "@ant-design/icons"; // [추가] antd 아이콘
import { Dropdown } from "antd"; // [추가] antd 드롭다운
import ImageBox from "./ImageBox";
import BannerImageEditor from "./BannerImageEditor.jsx";
import {followUser, unfollowUser} from "../../../api"; // [추가]

import {
    FeatureBox,
    FeatureContent,
    HeaderContent,
    ImgWrapper,
    BannerImage, // [추가] BannerImage 컴포넌트를 import 합니다.
    IconContainer, // [추가] 아이콘을 감싸는 컨테이너
    MyPageContainer,
    MyPageHeader,
    MypageImg,
    MyPageMain,
    ProfileImage,
    Tab,
    TabMenuContainer,
    StatsGroup,
    StatItem, // [추가] 스타일 파일에서 StatItem을 import 합니다.
    ButtonGroup, // [추가]
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
import defaultProfileImage from '../../../static/image/default-profile.png';

/**
 * MyPageContent - UI 렌더링만 담당
 */
// [되돌리기] MyPageContent의 이름을 MyPage로 변경하고, MyPageWrapper가 이 컴포넌트를 렌더링하도록 구조를 변경합니다.
const MyPage = () => {
    const { userId } = useParams(); // [추가] URL에서 userId를 가져옵니다.
    // [수정] AuthContext에서 전역 상태를 가져옵니다.
    const { user: loggedInUser, following: myFollowing, fetchMyFollowing, logout, postChangeSignal } = useAuth(); // [추가] postChangeSignal 가져오기
    const {
        profile,
        loading,
        error,
        updateProfile,
        // 1) useMyPage()에서 가져오는 항목 변경: Context가 제공하는 공식적인 'handleEdit' 함수를 가져옵니다.
        handleEdit,
        refetchProfile, // [추가] 프로필 정보를 새로고침하는 함수를 가져옵니다.
    } = useMyPage();

    // [핵심 수정] 게시물 생성/삭제 신호를 감지하여 프로필 정보를 다시 불러옵니다.
    useEffect(() => {
        // postChangeSignal이 0보다 클 때만 (초기 렌더링 방지) 실행합니다.
        if (postChangeSignal > 0) {
            // 현재 보고 있는 페이지가 로그인한 사용자의 페이지일 때만 갱신하도록 합니다.
            const isCurrentPageOwner = !userId || (loggedInUser && loggedInUser.id.toString() === userId);
            if (isCurrentPageOwner) {
                refetchProfile(userId);
            }
        }
    }, [postChangeSignal, userId, loggedInUser, refetchProfile]);

    // [추가] 드롭다운 메뉴 아이템 정의
    const menuItems = [
        { key: "logout", label: "로그아웃" },
        // 다른 메뉴 아이템 추가 가능
    ];

    // [추가] 드롭다운 메뉴 클릭 핸들러
    const handleMenuClick = ({ key }) => {
        if (key === "logout") {
            logout();
        }
    };

    // 2) 로컬 핸들러를 Context 함수 호출로 변경: 불필요한 로컬 handleEdit 함수를 제거합니다.
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
            await refetchProfile(userId); // [추가] 팔로워 수 등을 업데이트하기 위해 프로필 정보를 다시 불러옵니다.
        } catch (err) {
            console.error('팔로우 상태 변경에 실패했습니다.', err);
            // 필요하다면 사용자에게 에러 메시지를 보여줄 수 있습니다.
        }
    }, [isFollowing, userId, loggedInUser, isOwner, fetchMyFollowing, refetchProfile]);

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
        async (croppedFile, yPosition) => {
            // [수정] BannerImageEditor가 이제 완성된 이미지를 생성하므로,
            // yPosition은 항상 0으로 고정하여 저장합니다.
            // 파일 정보(두 번째 인자)에는 bannerImageFile을 전달합니다.
            await updateProfile(
                { bannerPositionY: 0 }, // 위치 조정값은 0
                { bannerImageFile: croppedFile } // 완성된 이미지 파일
            );
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
            <MypageImg
                onClick={isOwner ? () => handleImageClick("bannerImage") : undefined}
                $isOwner={isOwner}
            >
                {/* [수정] MypageImg 내부에 BannerImage를 렌더링합니다. */}
                {profile.bannerImage && <BannerImage src={profile.bannerImage} yPosition={profile.bannerPositionY} alt="배너 이미지" />}
            </MypageImg>
            <ContentBox>
                <MyPageHeader>
                    {/* 클릭 가능한 프로필 이미지 */}
                    <ImgWrapper>
                        <ProfileImage
                            src={profile.profileImage || defaultProfileImage}
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
                            {/* [수정] isOwner에 따라 다른 버튼 그룹을 렌더링 */}
                            {isOwner ? (
                                // 내 페이지일 경우
                                <ButtonGroup>
                                    {/* 3) 버튼 클릭 핸들러 교체: 이제 버튼은 Context에서 직접 가져온 올바른 handleEdit 함수를 호출합니다. */}
                                    <button onClick={handleEdit}>정보수정</button>
                                    <IconContainer>
                                        <Dropdown
                                            menu={{ items: menuItems, onClick: handleMenuClick }}
                                            trigger={["click"]}
                                        >
                                            <EllipsisOutlined style={{ fontSize: "20px", cursor: "pointer" }} />
                                        </Dropdown>
                                    </IconContainer>
                                </ButtonGroup>
                            ) : (
                                // 친구 페이지일 경우 '팔로우/언팔로우' 버튼을 보여줍니다.
                                <ButtonGroup>
                                    <button onClick={handleFollowToggle}>
                                        {isFollowing ? 'following' : 'follow'}
                                    </button>
                                </ButtonGroup>
                            )}

                            <StatsGroup>
                                <StatItem>
                                    <div>post</div>
                                    <div>{profile.postCount ?? 0}</div>
                                </StatItem>
                                <StatItem
                                    onClick={() => handleFriendModalOpen("following")}
                                >
                                    <div>follow</div>
                                    <div>{profile.followingCount ?? 0}</div>
                                </StatItem>
                                <StatItem
                                    onClick={() => handleFriendModalOpen("followers")}
                                >
                                    <div>follower</div>
                                    <div>{profile.followerCount ?? 0}</div>
                                </StatItem>
                            </StatsGroup>
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
                    </TabMenuContainer>
                    <FeatureContent>
                        {/* [수정] JournalList를 JournalProvider로 감싸고 userId를 전달합니다. */}
                        {activeTab === "feature1" && (
                            // [핵심 수정] 게시물 데이터 변경 시 MyPage의 프로필을 다시 불러오도록 콜백 함수를 전달합니다.
                            <JournalList onPostChange={() => refetchProfile(userId)} />
                        )}
                        {activeTab === "feature2" && (
                            <LikeList/>
                        )}
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
                onClose={() => {
                    setIsFriendModalOpen(false);
                    // [핵심 수정] 모달이 닫힐 때, MyPage의 프로필 정보를 다시 불러와 숫자를 갱신합니다.
                    refetchProfile(userId);
                }}
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
// [핵심 수정] MyPageWrapper와 PageSwitcher를 하나로 통합합니다.
const MyPageWrapper = () => {
    // URL에서 userId 파라미터를 가져옵니다. (예: /mypage/123 -> userId는 "123")
    // URL이 /mypage이면 userId는 undefined가 됩니다.
    const {userId} = useParams();

    return (
        // [수정] MyPageProvider에 userId를 전달합니다.
        <MyPageProvider userId={userId}>
            <JournalProvider userId={userId}>
                {/* PageSwitcher의 로직을 이곳으로 직접 가져옵니다. */}
                <MyPageContent/>
            </JournalProvider>
        </MyPageProvider>
    );
};

const MyPageContent = () => {
    const { isEditing } = useMyPage();
    return isEditing ? <MyPageSet /> : <MyPage />;
}

export default MyPageWrapper;
