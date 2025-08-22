import {Link} from "react-router-dom";
import { Check, ContentBox, Divider, ImgWrapper, MyPageSetContainer, MypageImg, UserInfo
} from "../../../styled_components/main/mypage/MyPageSet.styles.jsx";

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