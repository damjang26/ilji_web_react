import styled from 'styled-components';

export const PanelContainer = styled.div`
    position: fixed;
    bottom: 60px; // FAB height + margin
    right: 90px; // 20px (기존) + 56px (버튼 너비) + 20px (간격)
    width: 400px;
    height: 60vh;
    max-height: 700px;
    display: flex;
    flex-direction: column;
    background-color: #ffffff;
    border: 1px solid #e0e0e0;
    border-radius: 12px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
    z-index: 998; // Below FAB, above other content
    overflow: hidden;

    /* 애니메이션 */
    transform-origin: bottom right; /* 오른쪽 하단에서부터 커지도록 */
    transition: opacity 0.3s ease-out, transform 0.3s ease-out; /* 부드러운 전환 */

    opacity: 1; /* 기본적으로 보이도록 설정 */
    transform: scale(1); /* 기본적으로 원래 크기 */
`;

export const PanelHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 20px;
    border-bottom: 1px solid #e9ecef;
    flex-shrink: 0;
`;

export const PanelTitle = styled.h3`
    flex: 1;
    text-align: center;
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: #343a40;
`;

export const BackButton = styled.button`
    background: none;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 8px;
    margin: -8px; // To increase clickable area
    border-radius: 50%;
    color: #8394a6;
    font-size: 16px;
    transition: all 0.2s ease-in-out;

    &:hover {
        background-color: #efefef;
        color: #7b5fff;
    }
`;

export const CloseButton = styled.button`
    background: none;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 8px;
    margin: -8px; // To increase clickable area
    border-radius: 50%;
    color: #8394a6;
    font-size: 16px;
    transition: all 0.2s ease-in-out;

    &:hover {
        background-color: #efefef;
        color: #7b5fff;
    }
    

`;

export const PanelBody = styled.div`
    flex-grow: 1;
    overflow-y: auto;
    padding: 16px; // 일관된 여백 적용
`;
