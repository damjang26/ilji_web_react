import styled from "styled-components";

// ✅ [신규] 일기 작성 모달의 전체 컨테이너
export const JournalWriteContainer = styled.div`
    position: relative; /* 스프링 바인더의 기준점 */
    padding: 20px 25px 20px 45px; /* 내부 여백 (스프링 공간 확보) */
    background-color: #ffffff;
    border: 1.5px solid #a3a3a3;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    gap: 15px; /* 내부 요소 간의 간격 */
    width: 600px; /* PostContainer와 너비 통일 */
    box-sizing: border-box;
`;

export const FormContainer = styled.div`
    display: flex;
    gap: 16px;
    width: 100%;
`;

export const ProfilePicture = styled.img`
    width: 40px;
    height: 40px;
    border-radius: 50%;
    object-fit: cover;
`;

export const FormContent = styled.div`
    flex-grow: 1;
    display: flex;
    flex-direction: column;
`;

export const StyledTextarea = styled.textarea`
    width: 100%;
    min-height: 160px;
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

export const ImageEditorModalWrapper = styled.div`
    background: white;
    padding: 24px;
    border-radius: 10px;
    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
    width: 90%;
    display: flex;
    flex-direction: column;

    /* 이미지 꾸미기 단계일 때만 최대 너비를 넓힙니다. */
    max-width: ${({$isFabricStep}) => ($isFabricStep ? "900px" : "600px")};

    /* max-width 값이 변경될 때 부드러운 애니메이션 효과를 적용합니다. */
    transition: max-width 0.4s ease-in-out;
`;

export const ModalTitle = styled.h2`
    flex-grow: 1; /* 양쪽 아이콘/버튼을 제외한 나머지 공간을 모두 차지 */
    font-size: 18px;
    font-weight: 600;
    color: #333;
    line-height: 1.5;
    white-space: nowrap; /* 제목이 길어져도 줄바꿈 방지 */
`;

export const ImageEditorContainer = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    min-height: 400px;
    max-height: 1000px;
    background-color: #f6f3ff;
    box-sizing: border-box;

    img {
        max-width: 100%;
        object-fit: contain;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        border-radius: 4px;
        margin-bottom: 20px;
    }
`;

export const CropArea = styled.div`
    width: 100%;
    /* height: 450px; */ /* aspect-ratio 사용 시 고정 높이는 불필요할 수 있습니다. */
    background-color: #2c2c2c; /* 어두운 배경색으로 이미지를 돋보이게 합니다. */

    aspect-ratio: 1 / 1;

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
    color: #7b5fff;
    font-size: 20px;
    cursor: pointer;
    padding: 8px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative; /* 툴팁 위치 기준 */

    &:hover {
        background-color: rgba(131, 29, 240, 0.1);
    }

    &:disabled {
        color: #c3b3ff;
        cursor: not-allowed;
    }

    /* 툴팁 기본 숨김 */

    &::after {
        content: attr(data-tooltip); /* data-tooltip 속성에서 텍스트 가져오기 */
        position: absolute;
        bottom: 120%; /* 버튼 위쪽 위치 */
        left: 50%;
        transform: translateX(-50%);
        background-color: #333;
        color: #fff;
        padding: 4px 8px;
        border-radius: 4px;
        white-space: nowrap;
        font-size: 12px;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.2s, transform 0.2s;
    }

    &:hover::after {
        opacity: 1;
        transform: translateX(-50%) translateY(-4px);
    }
`;


export const ActionButtonWrapper = styled.div`
    position: relative; /* EmojiPickerWrapper의 기준점이 됩니다 */
`;

export const EmojiPickerWrapper = styled.div`
    position: absolute;
    bottom: 0;
    left: 37px;
    z-index: 1000; /* 다른 요소들 위에 오도록 z-index 설정 */
    margin-top: 8px; /* 아이콘과 약간의 간격을 줍니다. */
`;

export const CharCounter = styled.div`
    font-size: 13px;
    color: ${({error}) => (error ? '#d93025' : '#888')};
`;

export const CheckboxLabel = styled.label`
    display: flex;
    align-items: center;
    margin: 0 12px;
    cursor: pointer;
    font-size: 14px;
    color: ${props => props.theme.textSecondary || '#555'};
    user-select: none; /* 사용자가 라벨 텍스트를 드래그하는 것을 방지합니다. */

    &:hover {
        color: ${props => props.theme.text || '#000'};
    }
`;

export const CheckboxInput = styled.input.attrs({type: 'checkbox'})`
    appearance: none;
    -webkit-appearance: none;
    width: 18px;
    height: 18px;
    border: 2px solid #7b5fff;
    border-radius: 4px;
    cursor: pointer;
    position: relative;
    margin-right: 6px;
    outline: none;
    transition: all 0.2s ease;

    &:checked {
        background-color: #7b5fff;
        border-color: #7b5fff;
    }

    &:checked::after {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        width: 4px;
        height: 8px;
        border: solid white;
        border-width: 0 2px 2px 0;
        transform: translate(-50%, -50%) rotate(45deg); /* 가운데 정렬 */
    }

    &:hover {
        box-shadow: 0 0 0 2px rgba(123, 95, 255, 0.2);
    }
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

export const VisibilitySelector = styled.div`
    position: relative;
    display: inline-block;
    margin: 0 12px;
`;

export const VisibilityButton = styled.button`
    display: flex;
    align-items: center;
    gap: 6px;
    background-color: #f0f2f5;
    border: 1px solid #e0e0e0;
    border-radius: 6px;
    padding: 6px 12px;
    font-size: 13px;
    font-weight: 500;
    color: #333;
    cursor: pointer;
    transition: background-color 0.2s, border-color 0.2s;

    &:hover {
        background-color: #e9ecef;
        border-color: #d9d9d9;
    }

    svg {
        font-size: 16px;
        color: #555;
    }
`;

export const VisibilityDropdown = styled.div`
    position: absolute;
    bottom: 100%; /* 버튼 바로 위에 위치 */
    right: -12px;
    margin-bottom: 8px;
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 10;
    width: 120px;
    padding: 8px 0;
    overflow: hidden;
`;

export const VisibilityOption = styled.div`
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 16px;
    font-size: 14px;
    cursor: pointer;

    &:hover {
        background-color: #f0f2f5;
    }

    svg {
        font-size: 16px;
    }
`;

export const CanvasContainer = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    /* ✅ [수정] width: 100% 대신 flex-grow를 사용하여 남은 공간을 모두 차지하도록 합니다. */
    flex-grow: 1;
    /* ✅ [추가] flex 아이템이 줄어들 수 있도록 설정하여 오버플로우를 방지합니다. */
    flex-shrink: 1;
    min-width: 0; /* flex 아이템의 최소 너비 제한을 풀어줍니다. */
    min-height: 400px;
`;

export const EditContainer = styled.div`
    display: flex;
    flex-direction: column;
    width: 280px; /* ✅ [수정] 이전 요청에 따라 너비를 247px로 유지합니다. */
    height: ${(props) => props.canvasHeight}px;
    min-height: 400px;
    background-color: #ffffff;
    border: 1px solid #d9d1e8;
`;

export const EditTabMenuContainer = styled.div`
    display: flex;
    justify-content: center;
    border-bottom: 1px solid #ebe9ef;
    margin-top: 15px;
`;

export const EditTab = styled.div`
    padding: 6px 19px;
    color: ${props => (props.click ? '#7b5fff' : '#868e96')};
    border-bottom: 3px solid ${props => (props.click ? '#7b5fff' : 'transparent')};
    transition: all 0.2s ease-in-out;
    cursor: pointer;
    font-size: 20px;
`;

export const EditTabContent = styled.div`
    /* ✅ [수정] 부모(EditContainer)의 남은 공간을 모두 차지하도록 설정합니다. */
    flex-grow: 1;
    /* ✅ [수정] 자식(EditTabWrapper)이 높이 100%를 올바르게 계산하도록 position 설정 */
    position: relative;
    /* ✅ [수정] 자식의 스크롤 영역이 패딩 안쪽으로 제한되도록 overflow를 여기로 이동 */
    overflow: hidden;
`;

export const EditTabWrapper = styled.div`
    /* ✅ [수정] 부모(EditTabContent)를 기준으로 절대 위치를 잡아 꽉 채웁니다. */
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    padding: 20px; /* 기존 패딩을 이곳으로 이동 */
    overflow-y: auto; /* 내용이 넘칠 때만 세로 스크롤 표시 */

    /* 스크롤바 스타일 (선택 사항) */

    &::-webkit-scrollbar {
        width: 6px;
    }

    &::-webkit-scrollbar-track {
        background: transparent; /* 트랙 배경 투명 */
    }

    &::-webkit-scrollbar-thumb {
        background-color: #ccc; /* 스크롤바 핸들 색상 */
        border-radius: 10px;
    }

    &:hover::-webkit-scrollbar-thumb {
        background-color: #aaa; /* 호버 시 핸들 색상 변경 */
    }
`;

export const EditDrawPenButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    font-size: 20px;
    background-color: #ffffff;
    border: 2px solid #7b5fff;
    border-radius: 9999px;
    color: #7b5fff;
    cursor: pointer;
    transition: all 0.2s ease;

    /* $active prop에 따라 스타일 변경 */
    background-color: ${props => props.$active ? '#7b5fff' : '#ffffff'};
    color: ${props => props.$active ? '#ffffff' : '#7b5fff'};

    &:hover {
        opacity: 0.8;
    }
`;

export const EditDrawBrushWidthList = styled.div`
    display: flex;
    gap: 10px;
    align-items: center;
`;

export const EditDrawBrushWidthBtn = styled.button`
    padding: 6px 10px;
    border-radius: 5px;
    border: 1px solid ${props => props.$active ? '#7b5fff' : '#ccc'};
    background-color: ${props => props.$active ? '#f0ebff' : 'white'};
    color: ${props => props.$active ? '#7b5fff' : '#333'};
    cursor: pointer;
    font-size: 13px;

    &:disabled {
        cursor: not-allowed;
        opacity: 0.5;
    }
`;

export const EditDrawColorList = styled.div`
    display: flex;
    gap: 10px;
    align-items: center;
    flex-wrap: wrap;
`;

export const EditDrawColor = styled.div`
    width: 35px;
    height: 35px;
    border-radius: 50%;
    background-color: ${props => props.color};
    cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
    opacity: ${props => props.disabled ? 0.5 : 1};
    border: 3px solid ${props => props.$active ? '#7b5fff' : '#fff'};
    box-shadow: 0 0 0 1px #ccc;
    transition: all 0.2s ease;
`;

export const ColorPickerLabel = styled.label`
    display: inline-block;
    width: 35px;
    height: 35px;
    border-radius: 50%;
    cursor: pointer;
    /* 선택된 색상이 커스텀 색상일 경우 해당 색을, 아닐 경우 무지개 그래디언트를 배경으로 사용합니다. */
    background: ${props => props.customColor || 'conic-gradient(red, yellow, lime, aqua, blue, magenta, red)'};
    border: 3px solid ${props => props.$active ? '#7b5fff' : '#fff'};
    box-shadow: 0 0 0 1px #ccc;
    transition: all 0.2s ease;
`;

export const ColorPickerInput = styled.input.attrs({type: 'color'})`
    /* 실제 input은 시각적으로 숨기고, label을 통해 상호작용합니다. */
    opacity: 0;
    width: 0;
    height: 0;
    position: absolute;
`;

export const FilterContainer = styled.div`
    padding: 15px;
    display: flex;
    flex-direction: column;
    gap: 20px;
    font-family: sans-serif;
`;

export const FilterLabel = styled.p`
    margin: 0;
    font-size: 14px;
    font-weight: bold;
    color: #555;
`;

export const FilterPresetList = styled.div`
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
`;

export const FilterPresetButton = styled.button`
    padding: 8px 12px;
    border-radius: 5px;
    border: 1px solid ${props => props.$active ? '#7b5fff' : '#ccc'};
    background-color: ${props => props.$active ? '#f0ebff' : 'white'};
    color: ${props => props.$active ? '#7b5fff' : '#333'};
    cursor: pointer;
    font-weight: 500;
    transition: all 0.2s ease;

    &:hover {
        border-color: #7b5fff;
    }
`;

export const FilterSliderContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;

    span {
        font-size: 13px;
        color: #666;
    }
`;

export const FilterSlider = styled.input.attrs({type: 'range'})`
    width: 100%;
    cursor: pointer;
`;

export const ResetButton = styled.button`
    padding: 10px;
    border: 1px solid #ddd;
    background-color: #f8f9fa;
    color: #333;
    border-radius: 5px;
    cursor: pointer;
    font-weight: bold;

    &:hover {
        background-color: #e9ecef;
    }
`;


export const EditStickerBtn = styled.button`
    width: 70px;
    height: 70px;
    align-items: center;
    justify-content: center;
    border: none;
    background: none;

    &:hover {
        background: #f5f0ff;
    }

    img {
        width: 100%;
        height: 100%;
        box-shadow: none;
    }
`;

export const TextContainer = styled.div`
    padding: 15px;
    display: flex;
    flex-direction: column;
    align-items: center;
    font-family: sans-serif;
`;

export const AddButton = styled.button`
    width: 100%;
    padding: 12px;
    font-size: 16px;
    font-weight: bold;
    color: white;
    background-color: #7b5fff;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: background-color 0.2s ease;

    &:hover {
        background-color: #6a4fe6;
    }
`;

export const Description = styled.p`
    font-size: 14px;
    color: #666;
    text-align: center;
    margin-top: 20px;
`;
