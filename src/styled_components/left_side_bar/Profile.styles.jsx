import styled from "styled-components";
import {Link} from "react-router-dom";

export const ProfileContainer = styled.div`
  display: flex;
  flex-direction: column; /* 자식 요소들을 수직으로 정렬 */
  align-items: center;
  position: relative; /* IconContainer를 위치시킬 기준점으로 설정 */
  width: 100%;
  padding: 20px 0; /* 컴포넌트 상하 여유 공간 */
`;

// 프로필 이미지와 아이콘들을 함께 묶는 영역
export const ProfileImageArea = styled.div`
  margin-bottom: 15px; /* 이미지 영역과 아래 정보 사이에 간격 */
`;

// '검색', '...' 아이콘을 감싸는 컨테이너
export const IconContainer = styled.div`
  position: absolute; /* ProfileContainer를 기준으로 위치를 절대 지정 */
  top: -15px; /* ProfileContainer의 상단 padding과 동일하게 설정 */
  right: -5px; /* 오른쪽 여백 */
  display: flex;
  align-items: center;  
  gap: 12px; /* 아이콘 사이의 간격 */
  font-size: 12px;
  cursor: pointer;
`;

export const ImageWrapper = styled(Link)`
  display: flex;
  justify-content: center;
  align-items: center;
  & > div {/* 실제 이미지를 위한 임시 스타일 */
    width: 70px;
    height: 70px;
    border-radius: 50%;
    background-color: #ddd;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 12px;
  }
`
export const SearchModal = styled.div`
   position: fixed;
   top: 0; 
   left: 208px; /* 아이콘과 오른쪽 정렬을 맞춤 */
   width: 240px;
   min-height: 230px; 
   background-color: white;
   border: 1px solid #dbdbdb;
   border-radius: 8px;
   box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
   padding: 15px;
   z-index: 100; 
 `;

export const ModalHeader = styled.div`
   display: flex;
   justify-content: space-between;
   align-items: center;
   margin-bottom: 12px;
   font-weight: 600;
 `;

export const CloseButton = styled.button`
   background: none;
   border: none;
   font-size: 1.2rem;
   cursor: pointer;
   padding: 0;
   line-height: 1;
 `;

export const SearchInput = styled.input`
   width: 100%;
   padding: 8px;
   border: 1px solid #ccc;
   border-radius: 4px;
   box-sizing: border-box; /* padding이 너비에 포함되도록 설정 */
 `;


export const InfoWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center; /* 닉네임과 버튼을 수평 중앙에 배치 */
  gap: 10px; /* 닉네임과 버튼 사이에 간격 */
`;

export const Nickname = styled.div`
  font-weight: 600;
  font-size: 1.1rem;
  margin-bottom: 1px; /* 버튼과의 간격 */
`
export const Email = styled.div`
  font-weight: 300;
  font-size: 0.9rem;
  margin-bottom: 3px; /* 버튼과의 간격 */
`;