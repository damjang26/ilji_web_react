import React, {useState} from 'react';
import { FaSearch } from "react-icons/fa";
import { CloseButton, Email, IconContainer, ImageWrapper, InfoWrapper, ModalHeader, Nickname, ProfileContainer, ProfileImageArea,
    SearchInput, SearchModal,} from "../../styled_components/left_side_bar/Profile.styles.jsx";

const Profile = () => {

    const [isModalSearch, setIsModalSearch] =useState(false);

    return  (
        <ProfileContainer>
            <IconContainer>
                {/*==돋보기 아이콘*/}
                <FaSearch onClick={()=>setIsModalSearch(!isModalSearch)}/>
                <div>....</div>
            </IconContainer>
            {isModalSearch && (
                <SearchModal>
                    <ModalHeader>
                        <span>검색</span>
                        <CloseButton onClick={()=>setIsModalSearch(false)}>닫기</CloseButton>
                    </ModalHeader>
                    <SearchInput type="text" placeholder="검색어를 입력하세요" />
                </SearchModal>
            )}
            <ProfileImageArea>
                <ImageWrapper to="/mypage">
                    <div>profile-img</div>
                </ImageWrapper>
            </ProfileImageArea>
            <InfoWrapper>
                <Nickname>nickname</Nickname>
                <Email>email</Email>
            </InfoWrapper>
        </ProfileContainer>
    );
}

export default Profile;