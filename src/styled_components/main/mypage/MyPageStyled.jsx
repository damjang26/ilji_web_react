import styled from 'styled-components';

// 전체 마이페이지 감싸는 컨테이너
export const MyPageContainer = styled.div`
    display: flex;
    flex-direction: column; /* 헤더와 메인을 수직으로 쌓기 */
    width: 100%;
    height: 100%;
`;

// 마이페이지 상단 배경 이미지를 위한 컨테이너
export const MypageImg = styled.div`
    height: 250px; /* 헤더,메인 박스가 겹칠 수 있도록 높이 확보 */
    margin: -40px 0 0; /* 부모의 여백 무시, 좌우 채우기*/
    width: 100%;
    background-color: #e9ecef; /* 임시 배경색 */
    flex-shrink: 0; /* 컨테이너 크기 유지. */
    z-index: 0; /* 가장 낮은 레이어에 위치 */

    /* 나중에 사용자가 설정한 커버(배경) 이미지를 넣을 때 사용 */
    /* background-image: url(이미지 주소); */
    /* background-size: cover; */
    /* background-position: center; */
`;

// 헤더, 메인을 감싸서 이미지 위에 띄울 박스 컨테이너
export const ContentBox = styled.div`
    position: relative;
    z-index: 1; /* MypageImg(z-index: 0) 위에 위치하도록 설정 */
    margin-top: -110px; /* 이미지와 겹치는 정도를 변경 */
    margin-left: 30px; /* 박스 모양과 위치 (좌우 여백) */
    margin-right: 30px;
    background-color: #ffffff;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08); /* 내부 컨텐츠(헤더, 메인) 배치 */
    display: flex;
    flex-direction: column;
    flex-grow: 1; /* 남은 세로 공간을 모두 차지 */
`;

// 페이지 상단에 위치할 헤더
export const MyPageHeader = styled.header`
    display: flex;
    justify-content: flex-start;
    align-items: center;
    padding: 30px 40px 0 40px;
    flex-shrink: 0;
    gap: 60px;
`;

// 사용자 프로필 이미지를 감싸는 컨테이너
export const ImageWrapper = styled.div`
    margin-left: 100px; /*이미지와 왼쪽 끝의 간격 */
    width: 90px; /* 이미지 크기를 변경 */
    height: 90px;
    border-radius: 50%; /* 원형으로 만듭니다 */
    overflow: hidden; /* 이미지가 컨테이너를 벗어나지 않도록 함 */
    display: flex; /* 이미지를 중앙에 배치하기 위해 */
    justify-content: center;
    align-items: center;
    flex-shrink: 0; /* 컨테이너가 줄어들어도 이미지 크기는 유지 */

    & > img { /* 실제 이미지 스타일 */
        width: 100%; /* 부모 컨테이너에 꽉 채우기 */
        height: 100%; /* 부모 컨테이너에 꽉 채우기 */
        object-fit: cover; /* 이미지가 비율을 유지하며 컨테이너를 채우기 */
    }
`;

// 이미지 오른쪽의 모든 정보를 감싸는 컨테이너
export const HeaderContent = styled.div`
    display: flex;
    justify-content: flex-start; /*<UserInfo> 와 <UserActions>를 양 끝으로 보냄 */
    align-items: center;
    justify-content: space-between;
    flex-grow: 1; /* 헤더의 남은 공간을 모두 차지 */
    min-width: 0; /* flex item이 부모를 넘어가는 것을 방지 */
`;

// 닉네임, 이메일, 이름을 수직으로 묶는 컨테이너
export const UserInfo = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px; /* 이름들 사이의 간격 */

    & > .nickname { /* UserInfo의 직계 자식 중 className이 'nickname'인 요소에 적용 */
        font-size: 1.5rem;
        font-weight: 600;
    }

    & > .email { /* UserInfo의 직계 자식 중 className이 'email'인 요소에 적용 */
        color: #6c757d;
    }
`;

// 게시물, 팔로우, 정보수정 등을 묶는 컨테이너
export const UserActions = styled.div`
    display: flex;
    align-items: center;
    gap: 20px; /* 액션 아이템들 사이의 간격 */
`;

// 탭 메뉴를 감싸는 컨테이너
export const TabMenuContainer = styled.div`
    display: flex;
    justify-content: center;
    border-bottom: 1px solid #e9ecef;
    width: 100%; /* ContentBox의 너비 채우기 */
`;

// 개별 탭 버튼
export const Tab = styled.button`
    padding: 15px 20px;
    font-size: 1rem;
    font-weight: ${props => (props.$active ? '600' : '500')}; /* active prop에 따라 글자 굵기 변경 (활성/비활성) */
    color: ${props => (props.$active ? '#343a40' : '#868e96')}; /* active prop에 따라 글자 색상 변경 */
    background-color: transparent; /* 버튼의 기본 배경을 투명하게 설정 */
    border: none; /* 버튼의 기본 테두리 제거 */
    border-bottom: 3px solid ${props => (props.$active ? '#343a40' : 'transparent')}; /* active prop에 따라 하단 테두리 표시 여부 결정 */
    cursor: pointer;
    margin-bottom: -1px; /* 탭의 하단 테두리가 부모(TabMenuContainer)의 하단 테두리와 겹쳐 보이도록 설정 */
    transition: all 0.2s ease-in-out; /* 색상, 배경 등 모든 속성 변경에 0.2초 동안 부드러운 전환 효과 적용 */

    &:hover { /* 마우스를 올렸을 때의 스타일 */
        color: #343a40; /* 마우스를 올리면 글자색을 활성 탭과 동일 변경 */
        background-color: #f8f9fa; /* 마우스를 올리면 배경색을 살짝 추가, 시각적 피드백 제공 */
    }
`;

// 기능들이 위치할 메인 컨텐츠 영역
export const MyPageMain = styled.main`
    flex-grow: 1; /* 헤더를 제외한 나머지 모든 수직 공간을 차지 */
    display: flex;
    flex-direction: column; /* 탭 메뉴와 컨텐츠를 수직으로 배치 */
    align-items: center;
`;

// 프로필 이미지를 감싸서 위치(마진 등)를 조정하기 위한 래퍼
export const ImgWrapper = styled.div`
    position: relative;
    margin-top: 10px;
    margin-bottom: 10px;
    display: flex;
    justify-content: center;
    align-items: center;
`;

// 사용자의 프로필 이미지를 스타일링하는 컴포넌트 (원형, 그림자 효과 등)
export const ProfileImage = styled.img`
   width: 120px;
   height: 120px;
   border-radius: 50%;
   object-fit: cover;
   border: 4px solid #fff;
   box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
   cursor: pointer;
   background-color: #f0f0f0; /* 이미지가 없을 때를 위한 배경색 */
 `;


//  탭에 따라 선택된 기능이 표시될 영역
export const FeatureContent = styled.main`
    flex-grow: 1; /* 헤더를 제외한 나머지 모든 수직 공간을 차지 */
    padding: 20px;
    width: 100%;
`;

// 각 기능을 감싸는 박스
export const FeatureBox = styled.div`
    padding: 40px;
    border: 1px dashed #ccc;
    border-radius: 8px;
    font-size: 1.2rem;
`;

export const Contents = styled.div`
     padding: 20px;
     /* 추가적인 스타일링 (예: 게시물 목록) */
 `;