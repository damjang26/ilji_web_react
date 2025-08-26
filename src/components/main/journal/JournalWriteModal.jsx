import {useNavigate, useLocation} from "react-router-dom";
import JournalWrite from "./JournalWrite.jsx";
import Modal from "./Modal.jsx";

const JournalWriteModal = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const selectedDate = location.state?.selectedDate;

    // "모달이 열릴 때, location.state에 날짜가 잘 도착했는가?"
    // console.log('JournalWriteModal이 받은 location state:', location.state);

    // 모달을 닫을 때, 이전 페이지로 돌아갑니다.
    const handleClose = () => {
        navigate(-1);
    };

    return (
        <Modal isOpen={true} onClose={handleClose}>
            <JournalWrite onClose={handleClose} selectedDate={selectedDate}/>
        </Modal>
    );
};

export default JournalWriteModal;