import {Link} from "react-router-dom";
import styled from "styled-components";

const TabMenuContainer = styled.div`
  /* 부모(LeftSideBar)의 남는 세로 공간을 모두 차지하도록 만드는 핵심 속성 */
  flex-grow: 1;

  /* 내부 아이템(div, Link)들을 정렬하기 위한 flex 설정 */
  display: flex;
  flex-direction: column;
  justify-content: center; /* 자식 요소들을 수직 중앙에 배치합니다. */
  align-items: center;     /* 자식 요소들을 수평 중앙에 배치합니다. */
  gap: 15px;               /* 요소들 사이의 간격을 줍니다. */
`;

const TabMenu = () => {
    return (

        <TabMenuContainer>
          <hr/>
          <div>TabMenu</div>
          <Link to="/">Home</Link>
          <div>검색</div>
       </TabMenuContainer>
    );
}

export default TabMenu;