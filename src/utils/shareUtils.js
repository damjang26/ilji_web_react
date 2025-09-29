import { getOrCreateShareId } from '../api.js';
import { message } from 'antd';

/**
 * 일기를 공유하는 로직을 처리하는 유틸리티 함수입니다.
 * Web Share API를 우선적으로 사용하고, 지원되지 않는 환경에서는 클립보드에 링크를 복사합니다.
 * @param {object} journal - 공유할 일기 객체. { id, writerNickname } 속성을 포함해야 합니다.
 */
export const shareJournal = async (journal) => {
    if (!journal?.id) {
        // journal 객체나 id가 유효하지 않을 경우 사용자에게 알림
        message.error("Cannot share: Invalid journal data.");
        return;
    }

    try {
        // 1. 백엔드에서 공유 ID를 가져오거나 생성합니다.
        const response = await getOrCreateShareId(journal.id);
        const shareId = response.data.shareId;

        if (!shareId) {
            throw new Error("Could not retrieve share ID.");
        }

        // 2. 공유할 URL과 텍스트를 생성합니다.
        const shareUrl = `${window.location.origin}/i-log/${shareId}`;
        const shareTitle = `"${journal.writerNickname}"'s journal`;
        const shareText = `Check out ${shareTitle} on [Ilji]!`;

        // 3. Web Share API (주로 모바일)를 시도합니다.
        if (navigator.share) {
            await navigator.share({ title: shareTitle, text: shareText, url: shareUrl });
        } else {
            // 4. API가 없으면 (주로 데스크탑) 클립보드에 복사하고 알림을 띄웁니다.
            await navigator.clipboard.writeText(shareUrl);
            message.success("Journal link copied to clipboard!");
        }
    } catch (error) {
        console.error("Error during sharing process:", error);
        // 사용자가 공유 창을 직접 닫은 경우는 에러 메시지를 띄우지 않습니다.
        if (error.name !== 'AbortError') {
            message.error("Failed to create a share link.");
        }
    }
};