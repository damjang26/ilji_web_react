import React, {useState, useRef} from 'react';
import Cropper from 'react-cropper';
import 'cropperjs/dist/cropper.min.css';
import {FaArrowLeft} from 'react-icons/fa';
import {ModalHeader} from '../../../../styled_components/main/journal/ModalStyled.jsx';
import {
    IconButton,
    PostButton,
    CropArea,
    ImageEditorContainer,
} from '../../../../styled_components/main/journal/JournalWriteStyled';
import FabricEditor from "./FabricEditor.jsx";

const ImageEditor = ({imageInfo, onSave, onCancel}) => {
    const [editingStep, setEditingStep] = useState('crop'); // 'crop' | 'fabric'
    const [croppedImage, setCroppedImage] = useState(null);
    const cropperRef = useRef(null);

    // --- Cropper.js 핸들러 ---
    const handleNextStep = () => {
        const cropper = cropperRef.current?.cropper;
        console.log("✅ cropperRef:", cropperRef.current);
        console.log("✅ cropper 인스턴스:", cropper);
        if (typeof cropper === 'undefined') return;


        console.log("✅ cropData:", cropper.getData(true));
        const croppedCanvas = cropper.getCroppedCanvas({
            width: cropper.getData(true).width,
            height: cropper.getData(true).height,
        });
        console.log("✅ croppedCanvas:", croppedCanvas);
        console.log("✅ croppedCanvas 크기:", croppedCanvas?.width, croppedCanvas?.height);

        croppedCanvas.toBlob((blob) => {
            if (!blob) {
                console.error("⚠️ Blob 생성 실패");
                return;
            }
            const blobUrl = URL.createObjectURL(blob);
            console.log("✅ Blob URL:", blobUrl);
            setCroppedImage(blobUrl);
        }, 'image/png');
        setEditingStep('fabric');
    };

    const handleSaveEdit = () => {
        if (!croppedImage) return;
        onSave(croppedImage); // 부모 컴포넌트로 최종 이미지 데이터 전달
    };

    const handleCancelEdit = () => {
        if (window.confirm('편집을 취소하시겠습니까? 변경사항이 저장되지 않습니다.')) {
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
                <ModalHeader>
                    <IconButton onClick={handleCancelEdit} style={{color: '#555'}}><FaArrowLeft/></IconButton>
                    <h2>이미지 자르기</h2>
                    <PostButton onClick={handleNextStep}>다음</PostButton>
                </ModalHeader>
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
            </div>

            {/*
              Fabric Step: `editingStep`이 'fabric'일 때만 보이도록 처리합니다.
              이렇게 하면 crop 단계로 돌아가도 FabricEditor 컴포넌트가 unmount되지 않아 오류를 방지합니다.
            */}
            <div style={{display: editingStep === 'fabric' ? 'block' : 'none'}}>
                <ModalHeader>
                    <IconButton onClick={() => setEditingStep('crop')}
                                style={{color: '#555'}}><FaArrowLeft/></IconButton>
                    <h2>이미지 꾸미기</h2>
                    <PostButton onClick={handleSaveEdit}>저장</PostButton>
                </ModalHeader>
                <ImageEditorContainer>
                    {/*{croppedImage && <FabricEditor croppedImage={croppedImage}/>}*/}
                    {croppedImage && (
                        <>
                            <FabricEditor croppedImage={croppedImage}/>
                            {/* 바로 확인용 */}
                            <img src={croppedImage} alt="테스트 이미지" style={{maxWidth: '300px'}}/>
                        </>
                    )}
                </ImageEditorContainer>
            </div>
        </>
    );
};

export default ImageEditor;