import React, {useState, useRef, useEffect} from 'react';
import Cropper from 'react-cropper';
import 'cropperjs/dist/cropper.min.css';
import {FaArrowLeft} from 'react-icons/fa';
import {ModalHeader} from '../../../../styled_components/main/journal/ModalStyled.jsx';
import {
    IconButton,
    PostButton,
    CropArea,
    ImageEditorContainer, ImageEditorModalWrapper,
} from '../../../../styled_components/main/journal/JournalWriteStyled';
import FabricEditor from "./FabricEditor.jsx";

const ImageEditor = ({imageInfo, onSave, onCancel, onFabricModeChange}) => {
    const [editingStep, setEditingStep] = useState('crop'); // 'crop' | 'fabric'
    const [croppedImage, setCroppedImage] = useState(null);
    const fabricEditorRef = useRef(null); // ✅ FabricEditor를 참조하기 위한 ref
    const cropperRef = useRef(null);

    useEffect(() => {
        if (onFabricModeChange) {
            onFabricModeChange(editingStep === 'fabric');
        }
    }, [editingStep, onFabricModeChange]);

    useEffect(() => {
        // 컴포넌트가 언마운트되거나 croppedImage가 변경될 때
        // 이전에 생성된 Blob URL을 해제하여 메모리 누수를 방지합니다.
        return () => {
            if (croppedImage) {
                URL.revokeObjectURL(croppedImage);
            }
        };
    }, [croppedImage]);

    // --- Cropper.js 핸들러 ---
    const handleNextStep = () => {
        const cropper = cropperRef.current?.cropper;
        if (typeof cropper === 'undefined') return;

        // ❗ 중요: 옵션 없이 getCroppedCanvas()를 호출해야 원본 해상도의 잘린 이미지를 얻을 수 있습니다.
        const croppedCanvas = cropper.getCroppedCanvas();

        croppedCanvas.toBlob((blob) => {
            if (!blob) {
                console.error("⚠️ Blob creation failed");
                return;
            }
            const blobUrl = URL.createObjectURL(blob);
            setCroppedImage(blobUrl);
        }, 'image/png');
        setEditingStep('fabric');
    };

    // FabricEditor로부터 최종 편집된 이미지를 받아 부모에게 전달하는 함수
    const handleSaveEdit = () => {
        // ✅ fabricEditorRef를 통해 FabricEditor의 exportCanvas 함수를 호출
        if (fabricEditorRef.current) {
            const editedImageDataUrl = fabricEditorRef.current.exportCanvas();
            // 부모 컴포넌트(JournalWrite)의 onSave 함수를 호출하여 데이터 전달
            if (onFabricModeChange) onFabricModeChange(false); // 모달
            onSave(editedImageDataUrl);
        }
    };

    const handleCancelEdit = () => {
        if (window.confirm('Are you sure you want to cancel your edits? Your changes will not be saved.')) {
            if (onFabricModeChange) onFabricModeChange(false); // 모달
            onCancel(); // 부모 컴포넌트의 취소 함수 호출
        }
    };


    // --- 렌더링 분기 ---
    return (
        <>
            {/*
              Crop Step: `editingStep`이 'crop'일 때만 보이도록 처리합니다.
              display: flex를 사용하여 Cropper가 남은 공간을 모두 채우도록 합니다.
            */}
            <div style={{display: editingStep === 'crop' ? 'block' : 'none'}}>
                <ImageEditorModalWrapper>
                    <ModalHeader>
                        <IconButton data-tooltip="back" onClick={handleCancelEdit}
                                    style={{color: '#555'}}><FaArrowLeft/></IconButton>
                        <h2>image crop</h2>
                        <PostButton onClick={handleNextStep}>next</PostButton>
                    </ModalHeader>
                    {/* ✅ [수정] CropArea를 ImageEditorContainer로 감싸서 비율을 유지하도록 합니다. */}
                    <ImageEditorContainer>
                        <CropArea>
                            <Cropper
                                ref={cropperRef}
                                src={imageInfo.image.preview}
                                style={{height: '100%', width: '100%'}}
                                viewMode={1}
                                guides={true}
                                background={false}
                                responsive={true}
                                checkOrientation={false}
                                minCropBoxHeight={100}
                                minCropBoxWidth={100}
                                autoCropArea={1}
                            />
                        </CropArea>
                    </ImageEditorContainer>
                </ImageEditorModalWrapper>
            </div>

            {/*
              Fabric Step: `editingStep`이 'fabric'일 때만 보이도록 처리합니다.
              이렇게 하면 crop 단계로 돌아가도 FabricEditor 컴포넌트가 unmount되지 않아 오류를 방지합니다.
            */}
            <div style={{display: editingStep === 'fabric' ? 'block' : 'none'}}>
                <ModalHeader>
                    <IconButton data-tooltip="back" onClick={() => setEditingStep('crop')}
                                style={{color: '#555'}}><FaArrowLeft/></IconButton>
                    <h2>image edit</h2>
                    <PostButton onClick={handleSaveEdit}>save</PostButton>
                </ModalHeader>
                <ImageEditorContainer>
                    {/*{croppedImage && <FabricEditor croppedImage={croppedImage}/>}*/}
                    {croppedImage && <FabricEditor ref={fabricEditorRef} croppedImage={croppedImage}/>}
                </ImageEditorContainer>
            </div>
        </>
    );
};

export default ImageEditor;