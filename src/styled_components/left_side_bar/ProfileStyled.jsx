import styled from "styled-components";
import {Link} from "react-router-dom";

// 프로필 섹션 전체를 감싸는 메인 컨테이너
export const ProfileContainer = styled.div`
  display: flex;
  flex-direction: column; /* 자식 요소들을 수직으로 정렬 */
  align-items: center; 
  position: relative; /* IconContainer를 위치시킬 기준점으로 설정 */
  width: 100%;
  padding: 20px 0; /* 컴포넌트 상하 여유 공간 */
`;

// 프로필 이미지를 감싸는 영역
export const ProfileImageArea = styled.div`
  margin-bottom: 15px; /* 이미지 영역과 아래 정보 사이에 간격 */
`;

// '검색', '...' 아이콘을 감싸는 컨테이너
export const IconContainer = styled.div`
  position: absolute; /* 부모(ProfileContainer)를 기준으로 위치를 자유롭게 지정 */
  top: -15px; /* ProfileContainer의 상단 padding과 동일하게 설정 */
  right: -5px; /* 오른쪽 여백 */
  display: flex;
  align-items: center;  
  gap: 12px; /* 아이콘 사이의 간격 */
  font-size: 12px;
  cursor: pointer;
`;

// 프로필 이미지를 감싸는 Link 컴포넌트 (클릭 시 마이페이지로 이동)
export const ImageWrapper = styled(Link)`
  display: flex;
  justify-content: center;
  align-items: center;
 
   & > img { /* ImageWrapper의 자식인 img 태그에 직접 스타일 적용 */
    width: 70px;
    height: 70px;
    border-radius: 50%;
    object-fit: cover; /* 이미지가 컨테이너에 맞게 잘리도록 설정 */
    border: 1px solid #eee; /* 이미지 주변에 얇은 테두리 추가 */
  }
`

// 검색 아이콘 클릭 시 나타나는 모달 창
export const SearchModal = styled.div`
   position: fixed; /* 뷰포트(화면) 기준으로 위치를 고정 */
   top: 10px;
   left: 235px; /* 왼쪽 사이드바(230px) 바로 옆에 위치 */
   width: 240px;
   min-height: 230px; 
   background-color: white;
   border: 1px solid #dbdbdb;
   border-radius: 8px;
   box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); /* 모달이 떠 있는 듯한 그림자 효과 */
   padding: 15px;
   z-index: 100; /* 다른 요소들 위에 표시되도록 z-index 값을 높게 설정 */
 `;

// 검색 모달의 헤더 영역 (제목과 닫기 버튼 포함)
export const ModalHeader = styled.div`
   display: flex;
   justify-content: space-between;
   align-items: center;
   margin-bottom: 12px;
   font-weight: 600;
 `;

// 모달을 닫는 버튼
export const CloseButton = styled.button`
   background: none; /* 버튼의 기본 배경 제거 */
   border: none; /* 버튼의 기본 테두리 제거 */
   font-size: 1.2rem;
   cursor: pointer;
   padding: 0; /* 버튼의 기본 내부 여백 제거 */
   line-height: 1; /* 아이콘/텍스트 정렬을 위해 줄 높이를 글자 크기에 맞춤 */
 `;

// 검색어 입력을 위한 input 필드
export const SearchInput = styled.input`
   width: 100%;
   padding: 8px;
   border: 1px solid #ccc;
   border-radius: 4px;
   box-sizing: border-box; /* padding과 border가 너비(width)에 포함되도록 계산 */
 `;


// 사용자 정보(닉네임, 이메일, 버튼)를 감싸는 컨테이너
export const InfoWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center; /* 닉네임과 버튼을 수평 중앙에 배치 */
  gap: 10px; /* 닉네임과 버튼 사이에 간격 */
`;

// 사용자 닉네임 스타일
export const Nickname = styled.div`
  font-weight: 600;
  font-size: 1.1rem;
  margin-bottom: 1px; /* 버튼과의 간격 */
`

// 사용자 이메일 스타일
export const Email = styled.div`
  font-weight: 300;
  font-size: 0.9rem;
  margin-bottom: 3px; /* 버튼과의 간격 */
`;

// 로그아웃 등 프로필 관련 버튼을 감싸는 컨테이너
export const ButtonContainer = styled.div`
  display: flex;
  gap: 5px; // 간격 조절
`;

// 버튼들의 기본 스타일을 정의 (내부 사용)
const BaseButton = styled.button`
  padding: 6px 12px;
  font-size: 0.9rem;
  border: 1px solid #ccc;
  border-radius: 5px;
  background-color: white;
  cursor: pointer;
`;

// 로그아웃 버튼 (BaseButton 스타일 상속)
export const LogoutButton = styled(BaseButton)`
  /* Inherits styles from BaseButton */
`;

// 친구 관리 버튼 (BaseButton 스타일 상속)
export const FriendManageButton = styled(BaseButton)`
  /* Inherits styles from BaseButton */
`;

// 로그인되지 않았을 때, 소셜 로그인 컴포넌트를 감싸는 컨테이너
export const LoginWrapper = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;