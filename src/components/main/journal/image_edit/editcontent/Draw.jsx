import {useEffect, useState} from "react";
import {FaPenFancy} from "react-icons/fa";
import {
    EditDrawBrushWidthBtn,
    EditDrawBrushWidthList,
    EditDrawColor,
    EditDrawColorList,
    EditDrawPenButton
} from "../../../../../styled_components/main/journal/JournalWriteStyled.jsx";
import * as fabric from "fabric";

const BRUSH_WIDTHS = [3, 5, 10, 15];
const COLORS = ['#000000', '#E53E3E', '#3182CE', '#38A169', '#D69E2E', '#ffffff', '#7b5fff'];

const Draw = ({canvas}) => {
    const [isPenActive, setIsPenActive] = useState(false);
    const [brushWidth, setBrushWidth] = useState(5);
    const [brushColor, setBrushColor] = useState('#000000');

    useEffect(() => {
        // 캔버스 객체나 freeDrawingBrush가 준비되지 않았으면 아무것도 하지 않습니다.
        // 이 방어 코드는 부모 컴포넌트에서 캔버스가 비동기적으로 생성/파괴될 때 발생할 수 있는 오류를 방지합니다.
        if (!canvas) return;

        if (isPenActive) {
            canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
            canvas.isDrawingMode = true;
            canvas.selection = false; // 그리기 모드일 때는 객체 선택 비활성화
            canvas.freeDrawingBrush.width = brushWidth;
            canvas.freeDrawingBrush.color = brushColor;
        } else {
            canvas.isDrawingMode = false;
            canvas.selection = true; // 선택 모드 활성화
        }

        // 컴포넌트가 언마운트되거나, 탭이 변경될 때 캔버스를 초기 상태로 되돌립니다.
        // 이것이 없으면 다른 탭으로 이동해도 계속 그리기 모드가 유지될 수 있습니다.
        return () => {
            if (canvas) {
                canvas.isDrawingMode = false;
                canvas.selection = true;
            }
        };
    }, [canvas, isPenActive, brushWidth, brushColor]);

    const togglePen = () => {
        setIsPenActive(prev => !prev);
    };

    return (
        <div style={{padding: '15px', display: 'flex', flexDirection: 'column', gap: '20px'}}>
            <div>
                <EditDrawPenButton onClick={togglePen} $active={isPenActive}>
                    <FaPenFancy/>
                </EditDrawPenButton>
            </div>
            <EditDrawBrushWidthList>
                {BRUSH_WIDTHS.map(width => (
                    <EditDrawBrushWidthBtn
                        key={width}
                        onClick={() => setBrushWidth(width)}
                        $active={isPenActive && brushWidth === width}
                        disabled={!isPenActive}
                    >
                        {width}px
                    </EditDrawBrushWidthBtn>
                ))}
            </EditDrawBrushWidthList>
            <EditDrawColorList>
                {COLORS.map(color => (
                    <EditDrawColor
                        key={color}
                        color={color}
                        onClick={() => isPenActive && setBrushColor(color)}
                        $active={isPenActive && brushColor === color}
                        disabled={!isPenActive}
                    />
                ))}
            </EditDrawColorList>
        </div>
    );
};

export default Draw;
