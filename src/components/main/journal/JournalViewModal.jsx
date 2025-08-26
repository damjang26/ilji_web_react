import {useNavigate} from "react-router-dom";
import Modal from "./Modal.jsx";
import JournalView from "./JournalView.jsx";

const JournalViewModal = () => {
    const navigate = useNavigate();

    const handleClose = () => {
        navigate(-1); // 이전 페이지로 돌아가기
    };

    return (
        <Modal isOpen={true} onClose={handleClose}>
            <JournalView/>
        </Modal>
    );
};

export default JournalViewModal;