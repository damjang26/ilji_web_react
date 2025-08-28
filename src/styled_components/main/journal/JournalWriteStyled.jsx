import styled from "styled-components";

export const FormContainer = styled.div`
    display: flex;
    gap: 16px;
    width: 100%;
`;

export const ProfilePicture = styled.img`
    width: 48px;
    height: 48px;
    border-radius: 50%;
    object-fit: cover;
    margin-top: 10px;
`;

export const FormContent = styled.div`
    flex-grow: 1;
    display: flex;
    flex-direction: column;
`;

export const StyledTextarea = styled.textarea`
    width: 100%;
    min-height: 120px;
    border: none;
    resize: none;
    font-size: 18px;
    font-family: inherit;
    padding: 0;
    margin-bottom: 16px;
    border-radius: 5px;

    transition: border-color 0.2s, background-color 0.2s;
    background-color: ${props => props.isDragging ? "#ede9ff" : "#fff"};

    &:focus {
        outline: none;
    }

    &::placeholder {
        color: #aaa;
    }
`;

export const ImagePreviewContainer = styled.div`
    display: flex;
    gap: 10px;
    margin-bottom: 16px;
`;

export const ImagePreviewWrapper = styled.div`
    position: relative;
    width: 100px;
    height: 100px;
    cursor: pointer;

    img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: 8px;
    }
`;

export const RemoveImageButton = styled.button`
    position: absolute;
    top: -5px;
    right: -5px;
    background-color: rgba(0, 0, 0, 0.7);
    color: white;
    border: none;
    border-radius: 50%;
    width: 20px;
    height: 20px;
    font-size: 12px;
    line-height: 20px;
    text-align: center;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
`;

export const ImageEditorContainer = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    min-height: 400px;
    background-color: #f6f3ff;
    box-sizing: border-box;

    img {
        max-width: 100%;
        max-height: 300px;
        object-fit: contain;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        border-radius: 4px;
        margin-bottom: 20px;
    }
`;

export const CropArea = styled.div`
    width: 100%;
    height: 450px; /* 자르기 UI의 높이를 고정합니다. */
    background-color: #2c2c2c; /* 어두운 배경색으로 이미지를 돋보이게 합니다. */

    /* react-cropper가 생성하는 컨테이너가 부모 영역을 꽉 채우도록 합니다. */

    .cropper-container {
        height: 100%;
        width: 100%;
    }
`;

export const ActionBar = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-top: 1px solid #eee;
    padding-top: 12px;
`;

export const ActionButtons = styled.div`
    display: flex;
    gap: 8px;
`;

export const IconButton = styled.button`
    background: none;
    border: none;
    color: #7b5fff; /* Twitter blue */
    font-size: 20px;
    cursor: pointer;
    padding: 8px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
        background-color: rgba(131, 29, 240, 0.1);
    }

    &:disabled {
        color: #c3b3ff;
        cursor: not-allowed;
    }
`;

export const CharCounter = styled.div`
    font-size: 13px;
    color: ${({error}) => (error ? '#d93025' : '#888')};
`;

export const PostButton = styled.button`
    background-color: #7b5fff;
    color: white;
    border: none;
    border-radius: 9999px;
    padding: 8px 16px;
    font-weight: bold;
    cursor: pointer;

    &:disabled {
        background-color: #c3b3ff;
        cursor: not-allowed;
    }
`;

export const CanvasContainer = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    min-height: 400px;
`;

export const EditContainer = styled.div`
    display: flex;
    width: 40%;
    height: 100%;
    min-height: 400px;
    background-color: #ffffff;
    border: 1px solid black;
`;