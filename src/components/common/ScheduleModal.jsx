
import React, { useState, useRef, useLayoutEffect } from 'react';
import ReactDOM from 'react-dom';
import {
    ModalBackdrop,
    ModalContainer,
    ModalHeader,
    CloseButton,
    ModalContent
} from '../../styled_components/common/ScheduleModalStyled';
import ScheduleTab from '../right_side_bar/ScheduleTab';
import ScheduleForm from '../right_side_bar/schedule_tab/ScheduleForm'; // 폼 컴포넌트를 직접 import
import { useSchedule } from '../../contexts/ScheduleContext';

const ScheduleModal = () => {
    // 필요한 함수들을 context에서 모두 가져옵니다.
    const { scheduleModalData, closeScheduleModal, goBackInSchedulePanel, openSchedulePanelForRRule } = useSchedule();
    const { isOpen, position, title, view, initialEvent } = scheduleModalData || {}; // initialEvent 가져오기

    const modalRef = useRef(null);
    const headerRef = useRef(null);

    const [modalStyle, setModalStyle] = useState({
        visibility: 'hidden',
    });

    useLayoutEffect(() => {
        if (!isOpen || !modalRef.current) return;

        const modalElem = modalRef.current;

        const updatePosition = () => {
            const { width, height } = modalElem.getBoundingClientRect();
            const { innerWidth, innerHeight } = window;
            const { x, y } = position;

            let top;
            let left;
            const gap = 15; // 커서와 모달 사이의 간격

            // 1. 커서의 사분면에 따라 초기 위치 결정
            if (y > innerHeight / 2) {
                top = y - height - gap; // 커서 위에 배치
            } else {
                top = y + gap; // 커서 아래에 배치
            }

            if (x > innerWidth / 2) {
                left = x - width - gap; // 커서 왼쪽에 배치
            } else {
                left = x + gap; // 커서 오른쪽에 배치
            }

            // 2. 화면 경계를 벗어나지 않도록 보정
            if (left < 10) left = 10;
            if (top < 10) top = 10;
            if (left + width > innerWidth) left = innerWidth - width - 10;
            if (top + height > innerHeight) top = innerHeight - height - 10;

            setModalStyle({ top: `${top}px`, left: `${left}px`, visibility: 'visible' });
        };

        // 초기 위치 계산
        updatePosition();

        // ResizeObserver로 크기 변경 감지 및 위치 재조정
        const resizeObserver = new ResizeObserver(updatePosition);
        resizeObserver.observe(modalElem);

        // 컴포넌트 언마운트 시 Observer 해제
        return () => {
            resizeObserver.disconnect();
        };
    }, [isOpen, position]);

    if (!isOpen) {
        return null;
    }

    return ReactDOM.createPortal(
        <ModalBackdrop onMouseDown={closeScheduleModal}>
            <ModalContainer
                ref={modalRef}
                style={modalStyle}
                onMouseDown={(e) => e.stopPropagation()}
            >
                <ModalHeader ref={headerRef}>
                    <h2>{title || "schedule management"}</h2>
                    <CloseButton onClick={closeScheduleModal}>&times;</CloseButton>
                </ModalHeader>
                <ModalContent>
                    {view === 'form' 
                        ? <ScheduleForm onBack={goBackInSchedulePanel} onShowRRuleForm={openSchedulePanelForRRule} isInsideModal={true} /> 
                        : <ScheduleTab isInsideModal={true} initialEvent={initialEvent} />}                </ModalContent>
            </ModalContainer>
        </ModalBackdrop>,
        document.body
    );
};

export default ScheduleModal;
