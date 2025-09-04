import React, {createContext, useState, useContext, useCallback, useEffect} from 'react';
import {api} from '../api'; // ❗ axios 대신, 인터셉터가 설정된 공용 api 인스턴스를 사용합니다.
import {useAuth} from "../AuthContext.jsx";

const JournalContext = createContext(null);

export const useJournal = () => {
    const context = useContext(JournalContext);
    if (!context) {
        throw new Error('useJournal must be used within a JournalProvider');
    }
    return context;
};

export const JournalProvider = ({children}) => {
    // 실제 DB와 연동하므로, 초기 상태는 비어있는 Map으로 시작합니다.
    // 나중에 조회 기능을 구현하면, 이 상태는 API를 통해 불러온 데이터로 채워집니다.
    const [journals, setJournals] = useState(new Map());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const {user} = useAuth(); // 인증 컨텍스트에서 사용자 정보를 가져옵니다.

    // --- [신규] 일기 데이터 조회 로직 ---
    // user 정보가 변경될 때 (로그인/로그아웃 시) 이 useEffect가 실행됩니다.
    useEffect(() => {
        const fetchJournals = async () => {
            // 로그인한 사용자가 없으면, 데이터를 비우고 함수를 종료합니다.
            if (!user) {
                setJournals(new Map());
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
                // ❗ 백엔드에 현재 로그인한 유저의 모든 일기를 반환하는 API가 있다고 가정합니다.
                const response = await api.get('/api/i-log');
                const userJournals = response.data; // [{...}, {...}] 형태의 배열

                // 배열을 Map으로 변환하여 상태를 업데이트합니다. key는 날짜, value는 일기 객체입니다.
                const journalsMap = new Map(userJournals.map(j => [j.ilogDate.split('T')[0], j]));
                setJournals(journalsMap);
                setError(null);
            } catch (err) {
                console.error("일기 목록 로딩 실패:", err);
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchJournals();
    }, [user]); // user 객체가 변경될 때마다 이 로직을 다시 실행합니다.

    /**
     * 서버에 새로운 일기를 생성하는 함수 (이미지 업로드 포함)
     * @param {object} journalPayload - { images, content, selectedDate, isPrivate, user }
     */
        // ✅ [수정] 백엔드에서 이미지와 데이터를 한번에 처리하도록 로직 변경
    const createJournalEntry = useCallback(async (journalPayload) => {
            const {images, content, selectedDate, isPrivate, user} = journalPayload;

            // --- 1단계: 서버에 보낼 FormData 객체 생성 ---
            const formData = new FormData();

            // 이미지 파일들을 formData에 추가합니다.
            if (images && images.length > 0) {
                images.forEach(image => {
                    // 백엔드의 @RequestPart("images")와 키 이름을 일치시킵니다.
                    formData.append("images", image.file);
                });
            }

            // 일기 데이터(JSON)를 formData에 추가합니다.
            // 백엔드의 ILogCreateRequest DTO와 필드를 맞춥니다.
            const requestData = {
                userId: user.id,
                ilogDate: new Date(selectedDate).toISOString().split('T')[0], // DTO 필드명 'ilogDate'에 맞춤
                content: content,
                visibility: isPrivate ? 2 : 0,
            };

            // JSON 객체를 Blob으로 변환하여 "request" 키로 추가합니다.
            formData.append("request", new Blob([JSON.stringify(requestData)], {type: "application/json"}));

            // --- 2단계: 통합된 FormData를 서버에 한번만 POST 요청합니다. ---
            const response = await api.post('/api/i-log', formData, {
                headers: {'Content-Type': 'multipart/form-data'},
            });
            const newJournalEntry = response.data; // 서버가 생성된 일기 데이터를 반환한다고 가정

            // --- 3단계: UI 즉시 업데이트 ---
            // DB 저장 성공 후, 화면을 새로고침하지 않아도 바로 일기가 보이도록 Context의 상태를 업데이트합니다.
            setJournals(prev => {
                const newJournals = new Map(prev);
                // 서버 응답에 있는 날짜(newJournalEntry.ilogDate)를 사용하는 것이 더 안전합니다.
                newJournals.set(newJournalEntry.ilogDate, newJournalEntry);
                return newJournals;
            });

            return newJournalEntry; // 생성된 일기 데이터 반환
        }, [user]); // `user`가 변경될 때 함수가 최신 `user` 정보를 참조하도록 의존성 배열에 추가합니다.

    const deleteJournal = useCallback(async (logId, date) => {
        try {
            // 1. 백엔드에 삭제 요청을 보냅니다. (컨트롤러: @DeleteMapping("/{logId}"))
            await api.delete(`/api/i-log/${logId}`);

            // 2. 요청 성공 시, 로컬 상태(journals Map)에서도 해당 일기를 제거하여 UI를 즉시 업데이트합니다.
            setJournals(prev => {
                const newJournals = new Map(prev);
                newJournals.delete(date);
                return newJournals;
            });
        } catch (err) {
            console.error("일기 삭제 실패:", err);
            // 컴포넌트에서 에러를 인지하고 후속 처리(예: alert)를 할 수 있도록 에러를 다시 던집니다.
            throw err;
        }
    }, [setJournals]); // ✅ [수정] useCallback 의존성 배열에 setJournals를 추가하여 함수가 항상 최신 상태를 참조하도록 합니다.

    const hasJournal = useCallback((date) => journals.has(date), [journals]);
    // ✅ 특정 날짜의 일기 데이터를 가져오는 함수 추가
    const getJournal = useCallback((date) => journals.get(date), [journals]);

    const value = {journals, loading, error, createJournalEntry, deleteJournal, hasJournal, getJournal};

    return (
        <JournalContext.Provider value={value}>
            {children}
        </JournalContext.Provider>
    );
};