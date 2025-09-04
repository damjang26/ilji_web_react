import styled from "styled-components";

export const ViewContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 20px;
    padding: 8px;
    min-height: 300px;
    max-height: 70vh; // 화면 높이의 85%를 최대 높이로 제한합니다.
    overflow-y: auto;
`;

export const ProfileSection = styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
`;

export const ProfilePicture = styled.img`
    width: 48px;
    height: 48px;
    border-radius: 50%;
    object-fit: cover;
`;

export const AuthorInfo = styled.div`
    display: flex;
    flex-direction: column;
`;

export const AuthorName = styled.span`
    font-weight: bold;
    font-size: 16px;
`;

export const DateDisplay = styled.span`
    font-size: 14px;
    color: #888;
`;

export const ContentSection = styled.div`
    font-size: 16px;
    line-height: 1.6;
    white-space: pre-wrap; /* 줄바꿈과 공백을 그대로 표시 */
`;

export const ImageGrid = styled.div`
    display: grid;
    gap: 8px;
    grid-template-columns: repeat(${({imageCount}) => Math.min(imageCount, 2)}, 1fr);
`;

export const JournalImage = styled.img`
    width: 100%;
    height: auto;
    border-radius: 12px;
    object-fit: cover;
`;