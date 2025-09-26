import {useEffect, useState, useRef} from "react";
import {FaPencilAlt, FaPenFancy, FaPenNib} from "react-icons/fa"; // ✅ [추가] 필압 브러시 아이콘
import {BiSolidSprayCan} from "react-icons/bi";
import {BsCircle} from "react-icons/bs"; // ✅ [추가] 원 브러시 아이콘
import {
    EditDrawBrushWidthBtn,
    EditDrawBrushWidthList,
    EditDrawColor, ColorPickerInput, ColorPickerLabel,
    EditDrawColorList, BrushWidthInput, BrushWidthInputContainer,
    EditDrawPenButton
} from "../../../../../styled_components/main/journal/JournalWriteStyled.jsx";
import * as fabric from 'fabric';
import {PSBrush} from "@arch-inc/fabricjs-psbrush"; // ✅ [추가] 필압 브러시 라이브러리 import
import {TiDelete} from "react-icons/ti";

// 나중에 펜 종류를 쉽게 추가할 수 있도록 상수로 관리합니다.
export const PEN_TYPES = { // ✅ [수정] FabricEditor에서 import할 수 있도록 export 합니다.
    PENCIL: 'Pencil',
    SPRAY: 'Spray',
    CIRCLE: 'Circle', // ✅ [추가] 원 브러시 타입
    PRESSURE: 'Pressure', // ✅ [추가] 필압 브러시 타입
};
const BRUSH_WIDTHS = [3, 5, 10]; // ✅ [수정] 15px를 제거합니다.
const COLORS = ['#000000', '#FF6B6B', '#4F9DFF', '#6BCB77', '#FFD93D', '#ffffff', '#7b5fff'];

const Draw = ({canvas, activeTool, setActiveTool}) => { // ✅ [수정] activeTool 상태를 props로 받습니다.
    // ❌ [제거] 더 이상 자체적으로 activeTool 상태를 관리하지 않습니다.
    const [brushWidth, setBrushWidth] = useState(3);
    const [brushColor, setBrushColor] = useState('#000000');
    const [selectedObj, setSelectedObj] = useState(null);
    const [deleteBtnPos, setDeleteBtnPos] = useState({x: 0, y: 0, visible: false});
    const iconSize = 28;

    // 펜(브러시) 객체들을 저장해두고 재사용하기 위한 ref
    const brushesRef = useRef(null);

    // 캔버스가 생성될 때, 사용할 모든 브러시를 미리 한 번만 생성합니다.
    useEffect(() => {
        if (!canvas) return;
        brushesRef.current = {
            [PEN_TYPES.PENCIL]: new fabric.PencilBrush(canvas),
            [PEN_TYPES.SPRAY]: new fabric.SprayBrush(canvas),
            [PEN_TYPES.CIRCLE]: new fabric.CircleBrush(canvas), // ✅ [추가] 원 브러시 생성
            [PEN_TYPES.PRESSURE]: new PSBrush(canvas), // ✅ [추가] 필압 브러시 생성
        };
    }, [canvas]);

    useEffect(() => {
        // 캔버스 객체나 freeDrawingBrush가 준비되지 않았으면 아무것도 하지 않습니다.
        // 이 방어 코드는 부모 컴포넌트에서 캔버스가 비동기적으로 생성/파괴될 때 발생할 수 있는 오류를 방지합니다.
        if (!canvas || !brushesRef.current) return;

        const isDrawing = activeTool !== null;
        canvas.isDrawingMode = isDrawing;

        if (isDrawing) {
            // 1. 현재 선택된 펜 종류로 캔버스의 freeDrawingBrush를 교체합니다.
            canvas.freeDrawingBrush = brushesRef.current[activeTool];

            // 2. 현재 브러시의 속성을 설정합니다.
            canvas.selection = false; // 그리기 모드일 때는 객체 선택 비활성화
            canvas.freeDrawingBrush.width = brushWidth;
            canvas.freeDrawingBrush.color = brushColor;
        } else {
            canvas.selection = true; // 선택 모드 활성화
        }

        // 컴포넌트가 언마운트되거나, 탭이 변경될 때 캔버스를 초기 상태로 되돌립니다.
        // 이것이 없으면 다른 탭으로 이동해도 계속 그리기 모드가 유지될 수 있습니다.
        return () => {
            if (canvas && canvas.freeDrawingBrush) {
                canvas.isDrawingMode = false;
                canvas.selection = true;
            }
        };
    }, [canvas, activeTool, brushWidth, brushColor]);

    const handleToolSelect = (tool) => {
        // 같은 도구를 다시 클릭하면 비활성화(선택 모드), 다른 도구를 클릭하면 전환합니다.
        setActiveTool(prev => (prev === tool ? null : tool));
    };

    // ✅ [추가] 커스텀 브러시 크기 입력 핸들러
    const handleBrushWidthChange = (e) => {
        let newWidth = parseInt(e.target.value, 10);
        // 숫자가 아니거나 1보다 작으면 1로 강제합니다.
        if (isNaN(newWidth) || newWidth < 1) {
            newWidth = 1;
        }
        setBrushWidth(newWidth);
    };

    // ✅ [추가] 마우스 휠로 브러시 크기 조절하는 핸들러 (크롬 개발자 도구처럼)
    const handleBrushWidthWheel = (e) => {
        // 기본 스크롤 동작을 막습니다.
        e.preventDefault();
        setBrushWidth(prev => {
            // 휠을 위로 올리면(e.deltaY < 0) 크기 증가, 아래로 내리면 크기 감소
            const newWidth = e.deltaY < 0 ? prev + 1 : prev - 1;
            // 크기는 최소 1을 보장합니다.
            return Math.max(1, newWidth);
        });
    };

    useEffect(() => {
        if (!canvas) return;

        const updateDeleteBtnPos = (target) => {
            // target이 없으면(선택 해제) 버튼을 숨깁니다.
            if (!target) {
                setDeleteBtnPos({x: 0, y: 0, visible: false});
                return;
            }
            const canvasRect = canvas.getElement().getBoundingClientRect();

            // getBoundingRect() 대신 oCoords.tr을 사용하여 회전/크기 조절에도 정확한 모서리 좌표를 얻습니다.
            const corner = target.oCoords.tr;

            // 아이콘이 스티커의 모서리 바깥쪽에 살짝 걸치도록 위치를 조정합니다.
            // 기존에는 아이콘의 '중앙'이 모서리에 위치했습니다 (x: corner.x - 14, y: corner.y - 14).
            // 이제 아이콘이 모서리에서 살짝 떨어져 보이도록 오프셋을 조정합니다.
            // 예를 들어, 아이콘의 왼쪽 아래 부분이 모서리 근처에 오도록 합니다.
            setDeleteBtnPos({
                x: canvasRect.left + corner.x - (iconSize / 9), // 중앙에서 오른쪽으로 조금 이동 (기존: -14)
                y: canvasRect.top + corner.y - (iconSize * 3 / 3), // 중앙에서 위쪽으로 많이 이동 (기존: -14)
                visible: true,
            });
        };

        const handleSelection = (e) => {
            const activeObject = canvas.getActiveObject();
            setSelectedObj(activeObject);
            updateDeleteBtnPos(activeObject);
        };

        // 이동, 크기 조절, 회전 시 모두 버튼 위치를 업데이트합니다.
        const handleTransform = (e) => {
            updateDeleteBtnPos(e.target);
        };

        canvas.on("selection:created", handleSelection);
        canvas.on("selection:updated", handleSelection);
        canvas.on("selection:cleared", handleSelection);
        canvas.on("object:moving", handleTransform);
        canvas.on("object:scaling", handleTransform);
        canvas.on("object:rotating", handleTransform);

        return () => {
            canvas.off("selection:created", handleSelection);
            canvas.off("selection:updated", handleSelection);
            canvas.off("selection:cleared", handleSelection);
            canvas.off("object:moving", handleTransform);
            canvas.off("object:scaling", handleTransform);
            canvas.off("object:rotating", handleTransform);
        };
    }, [canvas]);

    return (
        <div style={{padding: '15px', display: 'flex', flexDirection: 'column', gap: '20px'}}>
            <div style={{display: 'flex', gap: '10px'}}>
                <EditDrawPenButton
                    onClick={() => handleToolSelect(PEN_TYPES.PENCIL)}
                    $active={activeTool === PEN_TYPES.PENCIL}
                >
                    <FaPencilAlt/>
                </EditDrawPenButton>
                <EditDrawPenButton
                    onClick={() => handleToolSelect(PEN_TYPES.PRESSURE)}
                    $active={activeTool === PEN_TYPES.PRESSURE}
                >
                    <FaPenFancy/>
                </EditDrawPenButton>
                <EditDrawPenButton
                    onClick={() => handleToolSelect(PEN_TYPES.SPRAY)}
                    $active={activeTool === PEN_TYPES.SPRAY}
                >
                    <BiSolidSprayCan/>
                </EditDrawPenButton>
                {/* ✅ [추가] 원 브러시 선택 버튼 */}
                <EditDrawPenButton
                    onClick={() => handleToolSelect(PEN_TYPES.CIRCLE)}
                    $active={activeTool === PEN_TYPES.CIRCLE}
                >
                    <BsCircle/>
                </EditDrawPenButton>
            </div>
            <EditDrawBrushWidthList>
                {BRUSH_WIDTHS.map(width => (
                    <EditDrawBrushWidthBtn
                        key={width}
                        onClick={() => setBrushWidth(width)}
                        // ✅ [수정] 현재 브러시 너비가 프리셋 값과 일치할 때만 활성화
                        $active={activeTool && brushWidth === width && BRUSH_WIDTHS.includes(brushWidth)}
                        disabled={!activeTool}
                    >
                        {width}px
                    </EditDrawBrushWidthBtn>
                ))}
                {/* ✅ [추가] 커스텀 브러시 크기 입력 필드 */}
                <BrushWidthInputContainer>
                    <BrushWidthInput
                        type="number"
                        value={brushWidth}
                        onChange={handleBrushWidthChange}
                        onWheel={handleBrushWidthWheel}
                        min="1"
                        disabled={!activeTool}
                    />
                    <span>px</span>
                </BrushWidthInputContainer>
            </EditDrawBrushWidthList>
            <EditDrawColorList>
                {COLORS.map(color => (
                    <EditDrawColor
                        key={color}
                        color={color}
                        onClick={() => activeTool && setBrushColor(color)}
                        $active={activeTool && brushColor === color}
                        disabled={!activeTool}
                    />
                ))}
                {/* 자유 색상 선택을 위한 컬러 피커 */}
                <ColorPickerLabel
                    htmlFor="draw-custom-color-picker"
                    // 펜이 활성화 상태이고, 선택된 색이 기본 팔레트에 없을 때만 테두리 표시
                    $active={activeTool && !COLORS.includes(brushColor)}
                    // 커스텀 색상일 경우 해당 색을 배경으로, 아닐 경우 무지개 배경 표시
                    customColor={!COLORS.includes(brushColor) ? brushColor : null}
                >
                    <ColorPickerInput
                        id="draw-custom-color-picker"
                        value={brushColor}
                        onChange={(e) => activeTool && setBrushColor(e.target.value)}
                    />
                </ColorPickerLabel>
            </EditDrawColorList>
            {/* 🔹 React 아이콘 삭제 버튼 */}
            {deleteBtnPos.visible && (
                <TiDelete
                    size={iconSize}
                    color="red"
                    style={{
                        position: "fixed",
                        left: deleteBtnPos.x,
                        top: deleteBtnPos.y,
                        cursor: "pointer",
                        background: "white",
                        borderRadius: "50%",
                        boxShadow: "0 2px 6px rgba(0,0,0,0.3)"
                    }}
                    onClick={() => {
                        if (selectedObj) {
                            canvas.remove(selectedObj);
                            setSelectedObj(null);
                            setDeleteBtnPos({x: 0, y: 0, visible: false});
                            canvas.requestRenderAll();
                        }
                    }}
                />
            )}
        </div>
    );
};

export default Draw;
