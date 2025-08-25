import {Link} from "react-router-dom";
import { useAuth } from "../../../AuthContext"; // Added import
import { Check, ContentBox, Divider, ImgWrapper, MyPageSetContainer, MypageImg, UserInfo
} from "../../../styled_components/main/mypage/MyPageSet.styles.jsx";

const MyPageSet = () =>{
    const { user } = useAuth(); // Added useAuth hook

    return(
        <MyPageSetContainer>
            <MypageImg />
          <ContentBox>
              <ImgWrapper>
                  <div>profile-photo</div>
              </ImgWrapper>
              <UserInfo>
                  <div>닉네임 :  <input placeholder="닉네임" value={user?.name || ''}/></div> {/* Using user.name */}
                  <div>이메일 :  <input placeholder="이메일" value={user?.email || ''}/></div> {/* Using user.email */}
                  <div>이름 :  <input placeholder="이름" value={user?.name || ''}/></div> {/* Using user.name */}
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