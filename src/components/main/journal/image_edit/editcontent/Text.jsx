import * as fabric from 'fabric';
import {useEffect, useState} from "react";
import {TiDelete} from "react-icons/ti";
import {
    AddButton,
    Description,
    TextContainer, ColorPickerLabel, ColorPickerInput,
    EditDrawColor, EditDrawColorList,
} from "../../../../../styled_components/main/journal/JournalWriteStyled.jsx";

// 폰트, 글자 크기, 색상
const FONTS = ["sans-serif", "serif", "monospace", "Arial", "Courier New", "Times New Roman"];
const FONT_SIZES = [12, 16, 20, 24, 32, 40, 48];
const COLORS = ["#000000", "#E53E3E", "#3182CE", "#38A169", "#D69E2E", "#ffffff", "#7B5FFF"];

const Text = ({canvas}) => {
    // UI 컨트롤(폰트, 크기, 색상)을 위한 상태
    const [selectedFont, setSelectedFont] = useState("sans-serif");
    const [selectedSize, setSelectedSize] = useState(40);
    const [selectedColor, setSelectedColor] = useState("#333333");

    // 캔버스 상태(선택된 텍스트, 텍스트 총 개수)를 추적하기 위한 상태
    const [activeText, setActiveText] = useState(null);
    const [textObjectCount, setTextObjectCount] = useState(0);
    const [deleteBtnPos, setDeleteBtnPos] = useState({x: 0, y: 0, visible: false});
    const iconSize = 28;

    const addText = () => {
        if (!canvas) return;

        const iText = new fabric.IText('텍스트를 입력하세요', {
            left: canvas.width / 2,
            top: canvas.height / 2,
            originX: 'center',
            originY: 'center',
            fontFamily: selectedFont,
            fontSize: selectedSize,
            fill: selectedColor,
            padding: 10,
            borderColor: '#7b5fff',
            cornerColor: '#7b5fff',
            cornerSize: 10,
            transparentCorners: false,
        });

        canvas.add(iText).setActiveObject(iText);
        iText.enterEditing();
        iText.selectAll();
        canvas.renderAll();
    };

    // 캔버스 이벤트를 감지하여 상태를 업데이트하는 메인 Effect
    useEffect(() => {
        if (!canvas) return;

        const updateDeleteBtnPos = (target) => {
            // 선택된 객체가 텍스트가 아니면 버튼을 숨깁니다.
            if (!target || target.type !== 'i-text') {
                setDeleteBtnPos({x: 0, y: 0, visible: false});
                return;
            }
            const canvasRect = canvas.getElement().getBoundingClientRect();
            const corner = target.oCoords.tr; // 회전/크기 조절에도 정확한 오른쪽 위 모서리 좌표

            setDeleteBtnPos({
                // 아이콘이 모서리 바깥쪽에 예쁘게 위치하도록 좌표 조정
                x: canvasRect.left + corner.x - (iconSize / 4),
                y: canvasRect.top + corner.y - (iconSize * 3 / 4),
                visible: true,
            });
        };

        // 캔버스에 있는 텍스트 객체의 수를 세는 함수
        const updateTextCount = () => {
            const textObjects = canvas.getObjects('i-text');
            setTextObjectCount(textObjects.length);
        };

        // 텍스트 객체가 선택/해제될 때 호출되는 함수
        const handleSelection = () => {
            const selected = canvas.getActiveObject();
            // 선택된 객체가 텍스트일 경우
            if (selected && selected.type === 'i-text') {
                setActiveText(selected);
                // UI 컨트롤의 상태를 선택된 텍스트의 속성과 동기화
                setSelectedFont(selected.fontFamily || "sans-serif");
                setSelectedSize(selected.fontSize || 40);
                setSelectedColor(selected.fill || "#333333");
            } else {
                // 다른 객체가 선택되거나 선택이 해제되면 activeText를 null로 설정
                setActiveText(null);
            }
            // 선택 상태가 변경될 때마다 삭제 버튼 위치를 업데이트합니다.
            updateDeleteBtnPos(selected);
        };

        const handleTransform = (e) => {
            updateDeleteBtnPos(e.target);
        };

        // 초기 상태 설정
        updateTextCount();
        handleSelection();

        // 이벤트 리스너 등록
        canvas.on('selection:created', handleSelection);
        canvas.on('selection:updated', handleSelection);
        canvas.on('selection:cleared', handleSelection);
        canvas.on('object:added', updateTextCount);
        canvas.on('object:removed', updateTextCount);
        canvas.on("object:moving", handleTransform);
        canvas.on("object:scaling", handleTransform);
        canvas.on("object:rotating", handleTransform);

        // 컴포넌트 언마운트 시 이벤트 리스너 제거
        return () => {
            canvas.off('selection:created', handleSelection);
            canvas.off('selection:updated', handleSelection);
            canvas.off('selection:cleared', handleSelection);
            canvas.off('object:added', updateTextCount);
            canvas.off('object:removed', updateTextCount);
            canvas.off("object:moving", handleTransform);
            canvas.off("object:scaling", handleTransform);
            canvas.off("object:rotating", handleTransform);
        };
    }, [canvas]);

    // UI 컨트롤(폰트, 크기, 색상)이 변경될 때, 선택된 텍스트 객체에 스타일을 적용하는 Effect
    useEffect(() => {
        if (activeText) {
            activeText.set({
                fontFamily: selectedFont,
                fontSize: selectedSize,
                fill: selectedColor,
            });
            canvas.requestRenderAll();
        }
    }, [selectedFont, selectedSize, selectedColor, activeText, canvas]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.key === "Delete") && canvas) {
                const activeObject = canvas.getActiveObject();
                if (activeObject) {
                    canvas.remove(activeObject);
                    canvas.discardActiveObject();
                    canvas.requestRenderAll();
                }
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [canvas]);

    return (
        <TextContainer>
            <AddButton onClick={addText}>텍스트 추가하기</AddButton>
            {/* 캔버스에 텍스트가 하나도 없을 때만 설명을 보여줌 */}
            {textObjectCount === 0 && (
                <Description>
                    버튼을 눌러 텍스트를 추가한 후,
                    <br/>
                    캔버스에서 직접 수정해 보세요.
                </Description>
            )}

            {/* 텍스트 객체가 선택되었을 때만 옵션 컨테이너를 보여줌 */}
            {activeText && (
                <div style={{display: "flex", gap: "15px", flexWrap: "wrap", marginTop: "20px"}}>
                    {/* 폰트 선택 */}
                    <select value={selectedFont} onChange={(e) => setSelectedFont(e.target.value)} style={{
                        padding: "6px 10px",
                        borderRadius: "5px",
                        border: "1px solid #ccc",
                        cursor: "pointer"
                    }}>
                        {FONTS.map(font => (<option key={font} value={font}>{font}</option>))}
                    </select>

                    {/* 글자 크기 선택 */}
                    <select value={selectedSize} onChange={(e) => setSelectedSize(parseInt(e.target.value))} style={{
                        padding: "6px 10px",
                        borderRadius: "5px",
                        border: "1px solid #ccc",
                        cursor: "pointer"
                    }}>
                        {FONT_SIZES.map(size => (<option key={size} value={size}>{size}px</option>))}
                    </select>

                    {/* 색상 선택 */}
                    <EditDrawColorList>
                        {COLORS.map(color => (
                            <EditDrawColor
                                key={color}
                                color={color}
                                $active={selectedColor === color}
                                onClick={() => setSelectedColor(color)}
                            />
                        ))}
                        {/* 자유 색상 선택을 위한 컬러 피커. Label을 통해 커스텀 UI를 제공합니다. */}
                        <ColorPickerLabel
                            htmlFor="custom-color-picker"
                            // 현재 선택된 색상이 커스텀 색상인지 확인하여 테두리를 표시합니다.
                            $active={!COLORS.includes(selectedColor)}
                            // 커스텀 색상일 경우, 해당 색상을 배경으로 표시합니다.
                            customColor={!COLORS.includes(selectedColor) ? selectedColor : null}
                        >
                            <ColorPickerInput
                                id="custom-color-picker"
                                value={selectedColor}
                                onChange={(e) => setSelectedColor(e.target.value)}
                            />
                        </ColorPickerLabel>
                    </EditDrawColorList>
                </div>
            )}

            {/* 텍스트 삭제 버튼 */}
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
                        if (activeText) {
                            canvas.remove(activeText);
                            canvas.discardActiveObject(); // 선택 해제 이벤트를 발생시켜 UI를 자동으로 업데이트
                            canvas.requestRenderAll();
                        }
                    }}
                />
            )}
        </TextContainer>
    );
};

export default Text;
