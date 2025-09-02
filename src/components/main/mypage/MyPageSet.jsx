import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../AuthContext'; // AuthContext에서 사용자 정보를 가져오기 위함
import { api } from '../../../api'; // 설정해두신 axios 인스턴스를 직접 가져옵니다.

const MyPageSet = () => {
    const { user } = useAuth(); // 로그인한 사용자 정보 (예: { id: 1, email: '...' })
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 프로필 정보를 서버에서 가져오는 함수
    const fetchProfile = useCallback(async () => {
        if (!user || !user.id) {
            setLoading(false);
            setError('로그인 정보가 없습니다.');
            return;
        }

        try {
            setLoading(true);
            // [API 호출] api 객체를 사용해 직접 프로필 정보를 요청합니다.
            const response = await api.get(`/api/profiles/user/${user.id}`);
            setProfile(response.data);
        } catch (err) {
            console.error("프로필 조회 실패:", err);
            setError('프로필 정보를 불러오는 데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    }, [user]);

    // 컴포넌트가 처음 화면에 나타날 때, 프로필 정보를 가져옵니다.
    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    // 입력 폼의 내용이 바뀔 때마다 profile 상태를 업데이트합니다.
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        const newValue = type === 'checkbox' ? checked : value;
        // [로그 1] 사용자가 입력/클릭할 때마다 값이 어떻게 변하는지 확인합니다.
        console.log(`[Input Change] 필드: '${name}', 새 값:`, newValue);
        setProfile(prevProfile => ({
            ...prevProfile,
            // 입력 필드 타입이 'checkbox'이면 checked 상태(true/false)를, 아니면 기존처럼 value를 저장합니다.
            [name]: newValue,
        }));
    };

    // '저장하기' 버튼을 눌렀을 때 실행되는 함수
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user || !user.id) {
            alert('사용자 정보가 없어 저장할 수 없습니다.');
            return;
        }
        // [로그 2] '저장하기' 버튼을 눌렀을 때, 서버로 전송될 최종 데이터를 확인합니다.
        console.log('[Submit] 서버로 전송할 최종 프로필 데이터:', profile);
        try {
            // [API 호출] api 객체를 사용해 수정된 프로필 정보를 서버에 전송합니다.
            await api.put(`/api/profiles/user/${user.id}`, profile);
            alert('프로필이 성공적으로 저장되었습니다.');
        } catch (err) {
            console.error("프로필 업데이트 실패:", err);
            alert('프로필 저장 중 오류가 발생했습니다.');
        }
    };

    if (loading) return <div>로딩 중...</div>;
    if (error) return <div style={{ color: 'red' }}>{error}</div>;
    if (!profile) return <div>프로필 정보가 없습니다.</div>;

    return (
        <form onSubmit={handleSubmit}>
            <h1>마이페이지 설정</h1>
            <div>
                <label>이메일: </label>
                <input type="email" value={profile.email || ''} disabled />
            </div>
            <div>
                <label>닉네임: </label>
                <input type="text" name="nickname" value={profile.nickname || ''} onChange={handleInputChange} />
            </div>
            <div>
                <label>생년월일: </label>
                <input type="date" name="birthdate" value={profile.birthdate || ''} onChange={handleInputChange} />
            </div>
            <div>
                <label>연락처: </label>
                <input type="tel" name="phoneNumber" value={profile.phoneNumber || ''} onChange={handleInputChange} placeholder="010-1234-5678" />
            </div>
            <div>
                <label>성별: </label>
                <select name="gender" value={profile.gender || ''} onChange={handleInputChange}>
                    <option value="">선택안함</option> 
                    <option value="M">남성</option>
                    <option value="F">여성</option>
                    <option value="O">기타</option>
                </select>
            </div>
            <div>
                <label>지역: </label>
                <input type="text" name="region" value={profile.region || ''} onChange={handleInputChange} />
            </div>
            <div>
                <label>설명: </label>
                <textarea name="bio" value={profile.bio || ''} onChange={handleInputChange} rows="4" />
            </div>
            <div>
                <label>관심사: </label>
                <input type="text" name="interests" value={profile.interests || ''} onChange={handleInputChange} placeholder="쉼표(,)로 구분하여 입력" />
            </div>
            <div>
                <label>배너 이미지 URL: </label>
                <input type="text" name="bannerImage" value={profile.bannerImage || ''} onChange={handleInputChange} />
            </div>
            <div>
                <label>계정 비공개: </label>
                <input type="checkbox" name="isPrivate" checked={profile.isPrivate || false} onChange={handleInputChange} />
            </div>
            <button type="submit">저장하기</button>
        </form>
    );
};

export default MyPageSet;