import React, {useRef, useEffect} from "react";
import * as fabric from 'fabric';
import {CanvasContainer, EditContainer} from "../../../../styled_components/main/journal/JournalWriteStyled.jsx";
import {HiOutlineFaceSmile} from "react-icons/hi2";
import {MdPhotoFilter} from "react-icons/md";
import {FaPenToSquare} from "react-icons/fa6";
import {CgFormatText} from "react-icons/cg";

const FabricEditor = ({croppedImage}) => {
    const canvasRef = useRef(null);
    // fabric 인스턴스는 한 번 생성된 후, 이미지가 바뀔 때마다 재사용되거나 재생성될 수 있습니다.
    // 이 인스턴스를 useEffect 스코프 밖에서 추적하기 위해 ref를 사용합니다.
    const fabricRef = useRef(null);

    // croppedImage가 변경될 때마다 이 effect가 실행됩니다.
    // 캔버스 초기화, 이미지 로딩, 그리고 정리를 모두 여기서 처리합니다.
    useEffect(() => {
        if (!croppedImage || !canvasRef.current) {
            return;
        }

        const timeoutId = setTimeout(() => {
            const container = canvasRef.current.parentElement;
            console.log('croppedImage (type, length):', typeof croppedImage, croppedImage?.slice?.(0, 2000));

            if (!container || container.clientWidth === 0) {
                console.error("FabricEditor의 부모 컨테이너를 찾거나 크기를 계산할 수 없습니다.");
                return;
            }

            // 1. 캔버스 초기화
            const canvas = new fabric.Canvas(canvasRef.current, {
                backgroundColor: "#fff",
            });
            fabricRef.current = canvas;

            const width = 300;  // fallback
            const height = 300; // 임의 높이 설정
            canvas.setDimensions({width, height});

            //2. 이미지 로딩 및 캔버스에 적용
            // fabric.Image.fromURL(
            //     croppedImage,
            //     (img) => {
            //         console.log("✅ 이미지 로드 성공!", img.width, img.height);
            //
            //         const scale = Math.min(container.clientWidth / img.width, 1);
            //         const canvasWidth = img.width * scale;
            //         const canvasHeight = img.height * scale;
            //         canvas.setDimensions({width: canvasWidth, height: canvasHeight});
            //         canvas.backgroundImage = img;
            //         img.scaleToWidth(canvas.width);
            //         img.scaleToHeight(canvas.height);
            //         canvas.renderAll();
            //     },
            //     {crossOrigin: "anonymous"}
            // );
        }, 0);


        // 3. 정리(Cleanup) 함수
        // 이 effect가 다시 실행되거나(croppedImage 변경 시) 컴포넌트가 언마운트될 때 호출됩니다.
        return () => {
            clearTimeout(timeoutId); // 예약된 실행을 취소합니다.
            if (fabricRef.current) {
                fabricRef.current.dispose();
                fabricRef.current = null;
            }
        };
    }, [croppedImage]);

    return (
        <>
            <CanvasContainer>
                <canvas ref={canvasRef} id="journal-fabric-canvas"/>
            </CanvasContainer>
            <EditContainer>
                <HiOutlineFaceSmile/>
                <MdPhotoFilter/>
                <FaPenToSquare/>
                <CgFormatText/>
            </EditContainer>
        </>);
};

export default FabricEditor;
