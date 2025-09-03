import React, {createContext, useState, useContext, useCallback} from 'react';

const JournalContext = createContext(null);

export const useJournal = () => {
    const context = useContext(JournalContext);
    if (!context) {
        throw new Error('useJournal must be used within a JournalProvider');
    }
    return context;
};

export const JournalProvider = ({children}) => {
    // 지금은 로컬 상태를 사용하지만, 나중에 API나 Firebase로 대체할 수 있습니다.
    // Map을 사용하여 날짜("YYYY-MM-DD")를 키로, 일기 객체를 값으로 저장합니다.
    const [journals, setJournals] = useState(new Map([
        ["2025-08-15", {content: "광복절 일기", images: [], authorId: 'test-user'}],
        ["2025-08-22", {content: "처서 일기", images: [], authorId: 'test-user'}],
    ]));

    const addJournal = useCallback(async (date, journalData) => {
        // 실제로는 여기서 API를 호출하여 서버에 데이터를 저장합니다.
        console.log("Saving journal for", date, ":", journalData);

        // 비동기 작업 시뮬레이션
        return new Promise((resolve) => {
            setTimeout(() => {
                setJournals(prevJournals => {
                    const newJournals = new Map(prevJournals);
                    newJournals.set(date, journalData);
                    return newJournals;
                });
                resolve();
            }, 500); // 0.5초 딜레이
        });
    }, []);

    const hasJournal = useCallback((date) => journals.has(date), [journals]);
    // ✅ 특정 날짜의 일기 데이터를 가져오는 함수 추가
    const getJournal = useCallback((date) => journals.get(date), [journals]);

    // const delJournal = useCallback(); 삭제기능 만들어야행

    const value = {journals, addJournal, hasJournal, getJournal};

    return (
        <JournalContext.Provider value={value}>
            {children}
        </JournalContext.Provider>
    );
};