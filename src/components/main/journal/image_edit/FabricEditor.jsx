import React, {useRef, useEffect, useState, forwardRef, useImperativeHandle} from "react";
import * as fabric from 'fabric';
import {
    CanvasContainer,
    EditContainer, EditTab, EditTabContent,
    EditTabMenuContainer, EditTabWrapper
} from "../../../../styled_components/main/journal/JournalWriteStyled.jsx";
import {HiOutlineFaceSmile} from "react-icons/hi2";
import {MdPhotoFilter} from "react-icons/md";
import {CgFormatText} from "react-icons/cg";
import {LuPencilLine} from "react-icons/lu";
import Filter from "./editcontent/Filter.jsx";
import Draw from "./editcontent/Draw.jsx";
import Text from "./editcontent/Text.jsx";
import Sticker from "./editcontent/Sticker.jsx";

const FabricEditor = forwardRef(({croppedImage}, ref) => {
    const canvasRef = useRef(null);
    const fabricRef = useRef(null);
    const [canvasHeight, setCanvasHeight] = useState(400);
    const [editTab, seteditTab] = useState('sticker');

    // 부모 컴포넌트(ImageEditor)가 ref를 통해 이 컴포넌트의 함수를 호출할 수 있도록 설정합니다.
    useImperativeHandle(ref, () => ({
        /**
         * 현재 캔버스의 상태를 base64 데이터 URL로 변환하여 반환합니다.
         * @returns {string|null} 이미지 데이터 URL 또는 canvas가 없을 경우 null
         */
        exportCanvas: () => {
            const canvas = fabricRef.current;
            if (!canvas) return null;

            // 1. 캔버스에 저장해 둔 원본 이미지의 크기를 가져옵니다.
            // const originalSize = canvas._originalSize;
            // if (!originalSize || !originalSize.width) {
            //     console.warn("원본 이미지 크기를 찾을 수 없어 현재 크기로 내보냅니다.");
            //     return canvas.toDataURL({
            //         format: 'png',
            //         quality: 0.9,
            //     });
            // }

            // 2. 현재 캔버스 크기 대비 원본 크기의 비율(multiplier)을 계산합니다.
            // const multiplier = originalSize.width / canvas.getWidth();

            // 3. toDataURL에 multiplier 옵션을 주어 원본 해상도로 이미지를 추출합니다.
            return canvas.toDataURL({
                format: 'png',
                quality: 1,
                // multiplier: multiplier,
            });
        }
    }));

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

            // 2. 이미지 로딩 및 캔버스에 적용 (async/await 사용)
            // fabric.Image.fromURL은 Promise를 반환하므로, 콜백 방식 대신 async/await를 사용해야 안정적으로 동작합니다.
            // 특히 Blob URL을 다룰 때 이 방식이 필수적입니다.
            const loadImage = async () => {
                try {
                    const img = await fabric.Image.fromURL(croppedImage, {
                        crossOrigin: "anonymous",
                    });
                    console.log("✅ 이미지 로드 성공!", img.width, img.height);

                    const scale = Math.min(
                        container.clientWidth / img.width,
                        container.clientHeight / img.height * 1.2,
                        1
                    );

                    const displayWidth = img.width * scale;
                    const displayHeight = img.height * scale;
                    setCanvasHeight(displayHeight);

                    canvas.setDimensions({width: displayWidth, height: displayHeight});

                    img.set({
                        scaleX: scale,
                        scaleY: scale,
                        left: 0,
                        top: 0,
                        selectable: false,
                        evented: false,
                    });
                    canvas.add(img);
                    canvas.sendToBack(img);

                    // 원본 크기 저장해두기 (저장 시 사용)
                    fabricRef.current._originalSize = {width: img.width, height: img.height};
                } catch (error) {
                    console.error("❌ Fabric.js 이미지 로딩 실패:", error);
                }
            };

            loadImage();
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
            <EditContainer canvasHeight={canvasHeight}>
                <EditTabMenuContainer>
                    <EditTab click={editTab === 'sticker'}
                             onClick={() => seteditTab('sticker')}><HiOutlineFaceSmile/></EditTab>
                    <EditTab click={editTab === 'filter'}
                             onClick={() => seteditTab('filter')}><MdPhotoFilter/></EditTab>
                    <EditTab click={editTab === 'draw'} onClick={() => seteditTab('draw')}><LuPencilLine/></EditTab>
                    <EditTab click={editTab === 'text'} onClick={() => seteditTab('text')}><CgFormatText/></EditTab>
                </EditTabMenuContainer>
                <EditTabContent>
                    <EditTabWrapper>
                        {editTab === 'sticker' && <Sticker canvas={fabricRef.current}/>}
                        {editTab === 'filter' && <Filter canvas={fabricRef.current}/>}
                        {editTab === 'draw' && <Draw canvas={fabricRef.current}/>}
                        {editTab === 'text' && <Text canvas={fabricRef.current}/>}
                    </EditTabWrapper>
                </EditTabContent>
            </EditContainer>
        </>);
});

export default FabricEditor;
