import styled from 'styled-components';
import {Link} from "react-router-dom";


// 전체 마이페이지를 감싸는 컨테이너
const MyPageSetContainer = styled.div`
  display: flex;
  flex-direction: column; /* 헤더와 메인을 수직으로 쌓습니다. */
  width: 100%;
  height: 100%;
`;

// 마이페이지 상단 배경 이미지를 위한 컨테이너
const MypageImg = styled.div`
  /* 헤더/메인 박스가 겹칠 수 있도록 충분한 높이를 확보합니다. */
  height: 250px;
  /* 부모의 여백을 무시하고 좌우를 꽉 채웁니다. */
  margin: -40px 0 0;
  width: 100%; 
  background-color: #e9ecef; /* 이미지가 없을 때 보일 임시 배경색 */
  flex-shrink: 0; /* 컨테이너 크기가 줄어들지 않도록 합니다. */
  z-index: 0; /* 배경이므로 가장 낮은 레이어에 위치합니다. */

  /* 나중에 실제 이미지를 넣을 때  */
  /* background-image: url(여기에 이미지 주소); */
  /* background-size: cover; */
  /* background-position: center; */
`;

// 헤더와 메인을 감싸서 이미지 위에 띄울 박스 컨테이너
const ContentBox = styled.div`
  /* 레이어링 및 겹침 효과 */
  position: relative;
  z-index: 1; /* MypageImg(z-index: 0) 위에 위치하도록 설정 */
  margin-top: -110px; /* ◀ 이 값을 조절해 이미지와 겹치는 정도를 변경합니다. */

  /* 박스 모양과 위치 (좌우 여백을 주어 사이드바 영역을 침범하지 않도록 함) */
  margin-left: 30px;
  margin-right: 30px;
  background-color: #fafafa;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);

  /* 내부 컨텐츠(이미지, 정보, 버튼)를 배치합니다. */
  display: flex;
  flex-direction: column;
  align-items: center; /* 내부 요소들을 보기 좋게 중앙 정렬합니다. */
  padding: 30px; /* 박스 안쪽에 여유 공간을 줍니다. */
`;

// 페이지 상단에 위치할 헤더
const UserInfo = styled.header`
  display: flex;
  flex-direction: column; /* 정보들을 세로로 나열합니다. */
  align-items: flex-start; /* 왼쪽 정렬 */
  padding: 20px 40px;
  gap: 15px; /* 각 정보 항목 사이의 간격 */
  width: 100%; /* 부모 컨테이너의 너비를 꽉 채웁니다. */
`;

// 프로필 이미지를 감싸는 컨테이너
const ImgWrapper = styled.div`
    margin-left: -900px; /*이미지와 왼쪽 끝의 간격 */
  /* 실제 이미지를 위한 임시 스타일 */
  & > div {
    width: 120px; /*이 값을 조절하여 이미지 크기를 변경. */
    height: 120px;
    border-radius: 50%;
    background-color: #ddd;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 1rem;
    flex-shrink: 0; /* 컨테이너가 줄어들어도 이미지 크기는 유지 */
  }
`;

// 수정, 취소 버튼을 감싸는 컨테이너
const Check = styled.div`
  display: flex;
  gap: 20px; /* 버튼 사이의 간격 */
  margin-top: 20px;
`;

// 선을 만들기 위한 간단한 컴포넌트
const Divider = styled.div`
  width: 100%; /*  선의 길이를 변경 */
  height: 1px;
  background-color: #e0e0e0;
  margin: 10px 0 20px 0; /* 위, 아래 여백을 줍니다. */
`;

const MyPageSet = () =>{

    return(
        <MyPageSetContainer>
            <MypageImg />
          <ContentBox>
              <ImgWrapper>
                  <div>profile-photo</div>
              </ImgWrapper>
              <UserInfo>
                  <div>닉네임 :  <input placeholder="닉네임"/></div>
                  <div>이메일 :  <input placeholder="이메일"/></div>
                  <div>이름 :  <input placeholder="이름"/></div>
                  <div>연락처 :  <input placeholder="연락처"/></div>
                  <div>생년월일 :  <input placeholder="생년월일"/></div>
                  <div>성별 :  <input placeholder="성별"/></div>
                  <div>지역 :  <input placeholder="지역"/></div>
              </UserInfo>
              <Divider />
              <Check>
                  <button>수정</button>
                  <Link to='/mypage'>취소</Link>
              </Check>
          </ContentBox>
        </MyPageSetContainer>
    );
}
export default MyPageSet;