import {Link} from "react-router-dom";
import React, {useState} from "react";
import {useAuth} from "../../../AuthContext";
import {
    ContentBox, FeatureBox, FeatureContent, HeaderContent, ImageWrapper,
    MyPageContainer, MyPageHeader, MypageImg, MyPageMain, Tab, TabMenuContainer, UserActions, UserInfo
} from "../../../styled_components/main/mypage/MyPageStyled.jsx";

const MyPage = () => {
    const {user} = useAuth();

    const [activeTab, setActiveTab] = useState('feature1');

    return (
        <MyPageContainer>
            <MypageImg/>
            <ContentBox>
                <MyPageHeader>
                    <ImageWrapper>
                        <div>
                            <img src={user.picture} alt={`${user.name} 프로필`} referrerPolicy="no-referrer"/>
                        </div>
                    </ImageWrapper>
                    <HeaderContent>
                        <UserInfo>
                            <div className="nickname">{user?.name || 'Guest'}</div>
                            <div className="email">{user?.email || 'guest@example.com'}</div>
                            <div>{user?.name || 'Guest'}</div>
                        </UserInfo>
                        <UserActions>
                            <div>post</div>
                            <div>follow</div>
                            <div>follower</div>
                            <Link to="/mypageset">정보수정</Link>
                        </UserActions>
                    </HeaderContent>
                </MyPageHeader>
                <MyPageMain>
                    <TabMenuContainer>
                        <Tab active={activeTab === 'feature1'} onClick={() => setActiveTab('feature1')}>journal</Tab>
                        <Tab active={activeTab === 'feature2'} onClick={() => setActiveTab('feature2')}>기능2</Tab>
                        <Tab active={activeTab === 'feature3'} onClick={() => setActiveTab('feature3')}>기능3</Tab>
                        <Tab active={activeTab === 'feature4'} onClick={() => setActiveTab('feature4')}>기능4</Tab>
                    </TabMenuContainer>
                    <FeatureContent>
                        {activeTab === 'feature1' && <FeatureBox>기능1</FeatureBox>}
                        {activeTab === 'feature2' && <FeatureBox>기능2</FeatureBox>}
                        {activeTab === 'feature3' && <FeatureBox>기능3</FeatureBox>}
                        {activeTab === 'feature4' && <FeatureBox>기능4</FeatureBox>}
                    </FeatureContent>
                </MyPageMain>
            </ContentBox>
        </MyPageContainer>
    )
}
export default MyPage;