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
import {PEN_TYPES} from "./editcontent/Draw.jsx"; // ✅ [추가] Draw 컴포넌트의 PEN_TYPES를 가져옵니다.

const FabricEditor = forwardRef(({croppedImage}, ref) => {
    const canvasRef = useRef(null);
    const fabricRef = useRef(null);
    const cursorCanvasRef = useRef(null); // ✅ [추가] 커서 전용 캔버스 ref
    const [canvasHeight, setCanvasHeight] = useState(400);
    const [editTab, seteditTab] = useState('sticker');

    // ✅ [수정] Draw 컴포넌트에 있던 activeTool 상태를 FabricEditor로 이동시킵니다.
    const [activeTool, setActiveTool] = useState(PEN_TYPES.PENCIL);

    // 부모 컴포넌트(ImageEditor)가 ref를 통해 이 컴포넌트의 함수를 호출할 수 있도록 설정합니다.
    useImperativeHandle(ref, () => ({
        /**
         * 현재 캔버스의 상태를 base64 데이터 URL로 변환하여 반환합니다.
         * @returns {string|null} 이미지 데이터 URL 또는 canvas가 없을 경우 null
         */
        //exportCanvas라는 이름의 함수를 부모가 쓸 수 있도록 열어둡니다.
        exportCanvas: () => {
            const canvas = fabricRef.current;
            if (!canvas) return null;

            // 1. 캔버스에 저장해 둔 원본 이미지의 크기를 가져옵니다.
            const originalSize = canvas._originalSize;

            // 2. 현재 캔버스 크기 대비 원본 크기의 비율(multiplier)을 계산합니다.
            const multiplier = originalSize.width / canvas.getWidth();

            // 3. toDataURL에 multiplier 옵션을 주어 원본 해상도로 이미지를 추출합니다.
            return canvas.toDataURL({
                format: 'png',
                quality: 1,
                multiplier: multiplier,
            });
        }
    }));

    useEffect(() => {
        if (!croppedImage || !canvasRef.current) {
            return;
        }

        const timeoutId = setTimeout(() => {
            const container = canvasRef.current.parentElement;
            // console.log('croppedImage (type, length):', typeof croppedImage, croppedImage?.slice?.(0, 2000));

            if (!container || container.clientWidth === 0) {
                console.error("Could not find or calculate the size of FabricEditor's parent container.");
                return;
            }

            // 1. 캔버스 초기화
            const canvas = new fabric.Canvas(canvasRef.current, {
                backgroundColor: "#fff",
            });
            fabricRef.current = canvas;

            // ✅ [수정] 드로잉 모드일 때 기본 십자가 커서가 나타나지 않도록 설정합니다.
            canvas.freeDrawingCursor = 'none';

            // 2. 이미지 로딩 및 캔버스에 적용 (async/await 사용)
            // fabric.Image.fromURL은 Promise를 반환하므로, 콜백 방식 대신 async/await를 사용해야 안정적으로 동작합니다.
            // 특히 Blob URL을 다룰 때 이 방식이 필수적입니다.
            const loadImage = async () => {
                try {
                    const img = await fabric.Image.fromURL(croppedImage, {
                        crossOrigin: "anonymous",
                    });
                    // console.log("✅ 이미지 로드 성공!", img.width, img.height);

                    const scale = Math.min(
                        container.clientWidth / img.width,
                        container.clientHeight / img.height * 1.2,
                        1
                    );

                    const displayWidth = img.width * scale;
                    const displayHeight = img.height * scale;
                    setCanvasHeight(displayHeight);

                    // ✅ [수정] 친구분의 조언대로, devicePixelRatio(DPR)을 고려하여 커서 캔버스 크기를 설정합니다.
                    // 이것이 좌표 불일치 문제의 핵심 해결책입니다.
                    if (cursorCanvasRef.current) {
                        const cursorCanvas = cursorCanvasRef.current;
                        const ratio = window.devicePixelRatio || 1;

                        // 1. 실제 픽셀 크기 설정 (고해상도에서 선명하게)
                        cursorCanvas.width = Math.round(displayWidth * ratio);
                        cursorCanvas.height = Math.round(displayHeight * ratio);

                        // 2. CSS상 보이는 크기 설정
                        cursorCanvas.style.width = `${displayWidth}px`;
                        cursorCanvas.style.height = `${displayHeight}px`;

                        // 3. 컨텍스트의 좌표계를 CSS 크기에 맞게 스케일링
                        const cursorCtx = cursorCanvas.getContext('2d');
                        cursorCtx.setTransform(ratio, 0, 0, ratio, 0, 0);
                    }

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
                    // canvas.sendToBack(img);

                    // 원본 크기 저장해두기 (저장 시 사용)
                    fabricRef.current._originalSize = {width: img.width, height: img.height};

                } catch (error) {
                    console.error("❌ Fabric.js image loading failed:", error);
                }
            };

            loadImage();
        }, 0);

        // 3. 정리(Cleanup) 함수
        // 이 effect가 다시 실행되거나(croppedImage 변경 시) 컴포넌트가 언마운트될 때 호출됩니다.
        return () => {
            clearTimeout(timeoutId); // 예약된 실행을 취소합니다.
            if (fabricRef.current) {
                // ✅ [개선] dispose 전에 모든 이벤트 리스너를 확실하게 제거합니다.
                fabricRef.current.off();
                fabricRef.current.dispose();
                fabricRef.current = null;
            }
        };
    }, [croppedImage]);

    // ✅ [수정] 커서 로직을 별도의 useEffect로 분리하고, editTab을 의존성으로 추가합니다.
    useEffect(() => {
        const canvas = fabricRef.current;
        const cursorCanvas = cursorCanvasRef.current;
        if (!canvas || !cursorCanvas) return;

        const cursorCtx = cursorCanvas.getContext('2d');
        let mousePos = null;

        const drawCursor = () => {
            // CSS 크기를 기준으로 캔버스를 지웁니다. (setTransform으로 스케일링했기 때문)
            const cssWidth = cursorCanvas.clientWidth;
            const cssHeight = cursorCanvas.clientHeight;
            cursorCtx.clearRect(0, 0, cssWidth, cssHeight);

            // 그리기 조건이 아닐 경우 여기서 종료
            if (editTab !== 'draw' || !mousePos || !canvas.isDrawingMode || !canvas.freeDrawingBrush || activeTool === null) {
                return;
            }

            const brush = canvas.freeDrawingBrush;
            const radius = brush.width / 2;

            cursorCtx.save();

            // 1. 바깥쪽 흰색 테두리
            cursorCtx.beginPath();
            cursorCtx.strokeStyle = '#ffffff';
            cursorCtx.lineWidth = 3;
            cursorCtx.arc(mousePos.x, mousePos.y, radius, 0, Math.PI * 2, false);
            cursorCtx.stroke();

            // 2. 안쪽 검은색 테두리
            cursorCtx.beginPath();
            cursorCtx.strokeStyle = '#000000';
            cursorCtx.lineWidth = 1;
            cursorCtx.arc(mousePos.x, mousePos.y, radius, 0, Math.PI * 2, false);
            cursorCtx.stroke();

            cursorCtx.restore();
        };

        // ✅ [수정] Fabric의 e.pointer 대신, 브라우저의 원본 이벤트를 사용하여 가장 정확한 좌표를 계산합니다.
        const onMouseMove = (e) => {
            const origEvent = e.e || window.event;
            const rect = cursorCanvas.getBoundingClientRect();
            mousePos = {
                x: origEvent.clientX - rect.left,
                y: origEvent.clientY - rect.top
            };
            drawCursor();
        };

        const onMouseOut = () => {
            mousePos = null;
            drawCursor(); // 커서 지우기
        };

        // 이벤트 리스너 등록
        canvas.on('mouse:move', onMouseMove);
        canvas.on('mouse:out', onMouseOut);

        return () => {
            canvas.off('mouse:move', onMouseMove);
            canvas.off('mouse:out', onMouseOut);
        };
    }, [editTab, activeTool]); // ✅ [수정] activeTool이 변경될 때도 이 로직을 다시 실행하여 상태를 동기화합니다.

    // ✅ [신규] 캔버스 전체에 적용될 키보드 이벤트를 여기서 한 번만 관리합니다.
    useEffect(() => {
        const handleKeyDown = (e) => {
            const canvas = fabricRef.current;
            if (!canvas) return;

            if (e.key === "Delete") {
                const activeObjects = canvas.getActiveObjects(); // ✅ 여러 개 객체 가져오기
                if (activeObjects && activeObjects.length > 0) {
                    e.preventDefault();

                    // 선택된 객체 전부 삭제
                    activeObjects.forEach((obj) => {
                        // 텍스트 입력 중일 때는 건너뛰기
                        if (!obj.isEditing) {
                            canvas.remove(obj);
                        }
                    });

                    // 선택 해제 후 렌더링
                    canvas.discardActiveObject();
                    canvas.requestRenderAll();
                }
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);


    return (
        <>
            {/* ✅ [수정] 두 개의 캔버스를 겹치기 위해 div로 감싸고 relative 포지션을 설정합니다. */}
            <CanvasContainer style={{position: 'relative'}}>
                {/* Fabric.js가 사용하는 기본 캔버스 */}
                <canvas ref={canvasRef}/>
                {/* 커서를 그리기 위한 별도 캔버스 */}
                <canvas
                    ref={cursorCanvasRef}
                    style={{position: 'absolute', top: 0, left: 0, pointerEvents: 'none'}}
                />
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
                        {/* ✅ [수정] activeTool 상태와 핸들러를 Draw 컴포넌트에 props로 전달합니다. */}
                        {editTab === 'draw' && (
                            <Draw
                                canvas={fabricRef.current}
                                activeTool={activeTool}
                                setActiveTool={setActiveTool}
                            />
                        )}
                        {editTab === 'text' && <Text canvas={fabricRef.current}/>}
                    </EditTabWrapper>
                </EditTabContent>
            </EditContainer>
        </>);
});

export default FabricEditor;
