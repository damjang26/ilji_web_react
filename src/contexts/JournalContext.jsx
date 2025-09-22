import React, {createContext, useState, useContext, useCallback, useEffect} from 'react';
import {api, getUserJournals} from '../api'; // ❗ getUserJournals 함수를 import 합니다.
import {useAuth} from "../AuthContext.jsx";

const JournalContext = createContext(null);

export const useJournal = () => {
    const context = useContext(JournalContext);
    if (!context) {
        throw new Error('useJournal must be used within a JournalProvider');
    }
    return context;
};

// [수정] userId prop을 받도록 변경합니다.
// 이 userId는 조회하려는 대상의 ID입니다. 없으면 '나'를 의미합니다.
export const JournalProvider = ({children, userId}) => {
    // 실제 DB와 연동하므로, 초기 상태는 비어있는 Map으로 시작합니다.
    // 나중에 조회 기능을 구현하면, 이 상태는 API를 통해 불러온 데이터로 채워집니다.
    const [journals, setJournals] = useState(new Map());
    const [loading, setLoading] = useState(true);
    // ✅ [신규] 캘린더에 현재 보여지는 날짜 범위를 관리하는 상태
    // { start: 'YYYY-MM-DD', end: 'YYYY-MM-DD' } 형태
    const [visibleDateRange, setVisibleDateRange] = useState(null);

    const [error, setError] = useState(null);
    const {user} = useAuth(); // 인증 컨텍스트에서 사용자 정보를 가져옵니다.

    // --- [신규] 일기 데이터 조회 로직 ---
    // [수정] user 또는 조회 대상 userId가 변경될 때 이 useEffect가 실행됩니다.
    useEffect(() => {
        const fetchJournals = async () => {
            // ✅ [수정] 사용자 정보나, 조회할 날짜 범위가 없으면 API를 호출하지 않습니다.
            // 조회 대상이 '나'인데 로그인을 안했거나, 날짜 범위가 설정되지 않았으면 종료합니다.
            if ((!userId && !user) || !visibleDateRange) {
                setJournals(new Map());
                setLoading(false);
                return;
            }

            setLoading(true);
            setError(null);
            try {
                // ✅ [신규] API 요청 시 보낼 쿼리 파라미터 설정
                const params = {
                    startDate: visibleDateRange.start,
                    endDate: visibleDateRange.end,
                };

                let response;
                // ✅ [수정] userId 유무에 따라 다른 엔드포인트를 호출하고, 날짜 범위 파라미터를 함께 전달합니다.
                if (userId) {
                    response = await getUserJournals(userId, { params });
                } else {
                    response = await api.get('/api/i-log', { params });
                }

                const userJournals = response.data; // [{...}, {...}] 형태의 배열
                console.log("일기 데이터", userJournals);

                // 배열을 Map으로 변환하여 상태를 업데이트합니다. key는 날짜, value는 일기 객체입니다.
                // ✅ [수정] 백엔드 응답 필드명 변경에 따라 'ilogDate'를 'logDate'로 수정합니다.
                const journalsMap = new Map(userJournals.map(j => [j.logDate.split('T')[0], j]));

                // ✅ [개선] 기존 데이터를 덮어쓰지 않고, 새로 불러온 데이터를 '병합'합니다.
                setJournals(prevJournals => {
                    const newJournals = new Map(prevJournals);
                    journalsMap.forEach((value, key) => newJournals.set(key, value));
                    return newJournals;
                });
            } catch (err) {
                console.error("일기 목록 로딩 실패:", err);
                setError(err);
                setJournals(new Map()); // 에러 발생 시 목록을 비웁니다.
            } finally {
                setLoading(false);
            }
        };

        fetchJournals();
    }, [user, userId, visibleDateRange]); // ✅ [수정] user, userId 또는 '날짜 범위'가 변경될 때마다 이 로직을 다시 실행합니다.

    /**
     * 서버에 새로운 일기를 생성하는 함수 (이미지 업로드 포함)
     * @param {object} journalPayload - { images, content, selectedDate, isPrivate, user }
     */
        // ✅ [수정] 백엔드에서 이미지와 데이터를 한번에 처리하도록 로직 변경
    const createJournalEntry = useCallback(async (journalPayload) => {
            const {images, content, logDate, visibility} = journalPayload;

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
                writerId: user.id,
                logDate: new Date(logDate).toISOString().split('T')[0], // ✅ [수정] DTO 필드명 'logDate'에 맞춤
                content: content,
                visibility: visibility, // ✅ [수정] isPrivate 대신 visibility 값을 직접 사용
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
                // ✅ [개선] Map의 key는 'YYYY-MM-DD' 형식이므로, 응답 데이터의 날짜도 형식을 통일해줍니다.
                const dateKey = newJournalEntry.logDate.split('T')[0];
                newJournals.set(dateKey, newJournalEntry);
                return newJournals;
            });

            return newJournalEntry; // 생성된 일기 데이터 반환
        }, [user]); // `user`가 변경될 때 함수가 최신 `user` 정보를 참조하도록 의존성 배열에 추가합니다.

    /**
     * 서버에 기존 일기를 수정하는 함수
     * @param {number} logId - 수정할 일기의 ID
     * @param {object} journalPayload - { images, content, isPrivate, user }
     */
    const updateJournalEntry = useCallback(async (logId, journalPayload) => {
        const {images, content, visibility} = journalPayload;

        const formData = new FormData();

        // ✅ [수정 로직] images 배열을 순회하며 기존 이미지(URL)와 새 이미지(File)를 구분합니다.
        const existingImageUrls = [];
        if (images && images.length > 0) {
            images.forEach(image => {
                // ✅ [수정] 최우선으로 기존 이미지인지(http URL) 확인합니다.
                if (image.preview.startsWith('http')) { // 기존 URL이면 'existingImageUrls'에 추가
                    existingImageUrls.push(image.preview);
                } else if (image.file) { // 새로운 파일(blob URL)이면 'images' 파트에 추가
                    formData.append("images", image.file);
                }
            });
        }

        const requestData = {
            content: content,
            visibility: visibility, // ✅ [수정] isPrivate 대신 visibility 값을 직접 사용
            existingImageUrls: existingImageUrls, // ✅ 백엔드에 유지할 이미지 URL 목록 전달
        };

        formData.append("request", new Blob([JSON.stringify(requestData)], {type: "application/json"}));

        // ✅ [수정 로직] POST 대신 PUT 메서드를 사용하고, URL에 logId를 포함합니다.
        const response = await api.put(`/api/i-log/${logId}`, formData, {
            headers: {'Content-Type': 'multipart/form-data'},
        });
        const updatedJournalEntry = response.data;

        // ✅ [수정 로직] 로컬 상태(Map)를 업데이트합니다.
        setJournals(prev => {
            const newJournals = new Map(prev);
            // ✅ [수정] 백엔드 응답 필드명 변경에 따라 'ilogDate'를 'logDate'로 수정합니다.
            const dateKey = updatedJournalEntry.logDate.split('T')[0];
            newJournals.set(dateKey, updatedJournalEntry);
            return newJournals;
        });

        return updatedJournalEntry;
    }, [user]);

    // ✅ [수정] onUpdate 콜백을 받아 다른 컴포넌트의 상태도 갱신할 수 있도록 수정
    const deleteJournal = useCallback(async (logId, date, onUpdate) => {
        try {
            // 1. 백엔드에 삭제 요청을 보냅니다. (컨트롤러: @DeleteMapping("/{logId}"))
            await api.delete(`/api/i-log/${logId}`);

            // 2. 요청 성공 시, 로컬 상태(journals Map)에서도 해당 일기를 제거하여 UI를 즉시 업데이트합니다.
            // (캘린더 뷰를 위한 업데이트)
            setJournals(prev => {
                const newJournals = new Map(prev);
                newJournals.delete(date);
                return newJournals;
            });

            // 3. (선택적) 외부 컴포넌트의 상태를 업데이트하기 위한 콜백 함수를 실행합니다.
            // (PostList, JournalList를 위한 업데이트)
            if (onUpdate) {
                onUpdate(logId);
            }

        } catch (err) {
            console.error("일기 삭제 실패:", err);
            // 컴포넌트에서 에러를 인지하고 후속 처리(예: alert)를 할 수 있도록 에러를 다시 던집니다.
            throw err;
        }
    }, [setJournals]);

    const hasJournal = useCallback((date) => journals.has(date), [journals]);
    // ✅ 특정 날짜의 일기 데이터를 가져오는 함수 추가
    const getJournal = useCallback((date) => journals.get(date), [journals]);

    // ✅ [신규] ID로 특정 일기 하나를 서버에서 직접 조회하는 함수
    const getJournalById = useCallback(async (id) => {
        try {
            const response = await api.get(`/api/i-log/${id}`);
            return response.data;
        } catch (err) {
            console.error(`ID(${id})로 일기 조회 실패:`, err);
            throw err; // 에러를 상위로 전파하여 컴포넌트에서 처리할 수 있도록 함
        }
    }, []);

    const value = {
        journals,
        loading,
        error,
        createJournalEntry,
        updateJournalEntry,
        deleteJournal,
        hasJournal,
        getJournal,
        getJournalById, // ✅ 내보내는 값에 추가
        setVisibleDateRange, // ✅ 캘린더 컴포넌트에서 날짜 범위를 설정할 수 있도록 함수를 내보냅니다.
    };

    return (
        <JournalContext.Provider value={value}>
            {children}
        </JournalContext.Provider>
    );
};