import * as fabric from "fabric";
import {EditStickerBtn} from "../../../../../styled_components/main/journal/JournalWriteStyled.jsx";
import {useEffect, useState} from "react";
import {TiDelete} from "react-icons/ti";

const Sticker = ({canvas}) => {
    const [selectedObj, setSelectedObj] = useState(null);
    const [deleteBtnPos, setDeleteBtnPos] = useState({x: 0, y: 0, visible: false});
    const iconSize = 28; // 삭제 아이콘 크기를 상수로 관리하면 유지보수가 편해집니다.

    const stickers = [
        "/images/emoji/sticker1.png",
        "/images/emoji/sticker2.png",
        "/images/emoji/sticker3.png",
        "/images/emoji/sticker4.png",
        "/images/emoji/sticker5.png",
    ];

    const addSticker = async (url) => {
        if (!canvas) return;
        try {
            // fabric.Image.fromURL은 Promise를 반환하므로 await와 함께 사용할 수 있습니다.
            // crossOrigin 옵션은 다른 도메인의 이미지를 불러올 때 발생할 수 있는 문제를 방지합니다.
            const img = await fabric.Image.fromURL(url, {crossOrigin: 'anonymous'});
            img.set({
                left: 100,
                top: 100,
                scaleX: 0.2,
                scaleY: 0.2,
            });
            canvas.add(img);
            canvas.setActiveObject(img); // 추가된 스티커를 바로 활성화합니다.
            canvas.renderAll();
        } catch (error) {
            console.error("스티커를 추가하는 데 실패했습니다:", error);
        }
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

    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.key === "Delete" || e.key === "Backspace") && canvas) {
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
        <div>
            <div style={{
                display: "flex",
                gap: "10px",
                justifyContent: "center",
                alignItems: "center",
                flexWrap: "wrap"
            }}>
                {stickers.map((url, index) => (
                    <EditStickerBtn key={index} onClick={() => addSticker(url)}>
                        <img src={url} alt={`sticker-${index}`}/>
                    </EditStickerBtn>
                ))}
            </div>

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
}
export default Sticker;
