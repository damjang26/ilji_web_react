import React, {useState, useEffect, useRef} from 'react';
import { FaSearch } from "react-icons/fa";
import { CloseButton, Email, IconContainer, ImageWrapper, InfoWrapper, ModalHeader, Nickname, ProfileContainer, ProfileImageArea,
    SearchInput, SearchModal,} from "../../styled_components/left_side_bar/Profile.styles.jsx";

const Profile = () => {

    const [isModalSearch, setIsModalSearch] =useState(false);
    const modalRef = useRef(null); // 모달 DOM을 참조 목적의 ref 생성

    useEffect(() => {
        const handleClickOutside = (e) => {// 모달 열려 있고, 클릭된 곳이 모달 외부일 때
            if (modalRef.current && !modalRef.current.contains(e.target)) {
                setIsModalSearch(false);
            }
        };
        if (isModalSearch) {// 모달 열릴 때 document에 이벤트 리스너 추가
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {// 컴포넌트가 언마운트, 모달이 닫힐 때 이벤트 리스너 제거
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isModalSearch]); // isModalSearch 상태가 변경될 때마다 이 훅을 실행

    return  (
        <ProfileContainer>
            <IconContainer>
                <FaSearch onClick={()=>setIsModalSearch(!isModalSearch)}/>{/*==돋보기 아이콘*/}
                <div>....</div>
            </IconContainer>
            {isModalSearch && (
                <SearchModal ref={modalRef}>
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