import * as fabric from "fabric";

const Emoji = ({canvas}) => {

    const addEmoji = () => {
        const text = new fabric.Text("😊", {left: 100, top: 100});
        canvas.add(text);
    };

    const loadImage = (url) => {
        return new Promise((resolve, reject) => {
            fabric.Image.fromURL(url, (img) => {
                if (img) resolve(img);
                else reject(new Error("이미지 로드 실패"));
            });
        });
    };

    const addEmoji2 = async () => {
        const stickerurl = "/images/emoji/emojidemo.png";
        const img = await fabric.Image.fromURL(stickerurl);
        img.set({
            left: 100,
            top: 100,
            scaleX: 0.2,
            scaleY: 0.2,
        });
        canvas.add(img);
    };

    const addEmoji3 = async () => {
        const stickerurl = "/images/emoji/emoji2.png";
        const img = await fabric.Image.fromURL(stickerurl);
        img.set({
            left: 100,
            top: 100,
            scaleX: 0.2,
            scaleY: 0.2,
        });
        canvas.add(img);
    };


    return (
        // <button onClick={addEmoji}>😊</button>,
        <button onClick={addEmoji2}>이모지</button>);
};

export default Emoji;

