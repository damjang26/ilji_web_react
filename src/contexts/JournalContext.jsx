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
    const createJournalEntry = useCallback(async (journalPayload) => {
        const {images, content, selectedDate, isPrivate, user} = journalPayload;

        // --- 1단계: 이미지 업로드 (현재 비활성화) ---
        // ❗ 나중에 이미지 업로드 API가 준비되면 이 부분의 주석을 해제하세요.
        /*
        const uploadPromises = images.map(image => {
            const formData = new FormData();
            formData.append('image', image.file);
            return axios.post('/api/upload', formData, {
                headers: {'Content-Type': 'multipart/form-data'},
            });
        });
        const uploadResponses = await Promise.all(uploadPromises);
        const imageUrls = uploadResponses.map(res => res.data.url);
        */

        // --- 2단계: 일기 데이터를 최종적으로 조합하여 서버에 저장합니다. ---
        const journalDataToSave = {
            // ❗ 중요: user 객체에 DB의 숫자 ID인 'id'가 있다고 가정합니다.
            userId: user.id,
            // 'YYYY-MM-DD' 형식으로 날짜를 변환합니다.
            ilogDate: new Date(selectedDate).toISOString().split('T')[0],
            content: content,
            // ❗ 중요: 이미지 업로드 기능이 비활성화되었으므로, imgUrl을 null로 보냅니다.
            imgUrl: null,
            // isPrivate(boolean)를 visibility(숫자)로 변환합니다. (0: 공개, 2: 비공개)
            visibility: isPrivate ? 2 : 0,
        };

        // `axios`로 최종 일기 데이터를 서버에 POST 요청합니다.
        // 이제 api 인스턴스를 사용하므로, 인증 헤더가 자동으로 추가됩니다.
        const response = await api.post('/api/i-log', journalDataToSave);
        const newJournalEntry = response.data; // 서버가 생성된 일기 데이터를 반환한다고 가정

        // --- 3단계: UI 즉시 업데이트 ---
        // DB 저장 성공 후, 화면을 새로고침하지 않아도 바로 일기가 보이도록 Context의 상태를 업데이트합니다.
        setJournals(prev => {
            const newJournals = new Map(prev);
            newJournals.set(journalDataToSave.ilogDate, newJournalEntry);
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
    }, []);

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