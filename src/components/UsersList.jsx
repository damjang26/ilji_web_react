import { useEffect, useState } from "react";
import { api } from "../api";
import { Spin } from 'antd';
import styled from 'styled-components';

const LoadingWrapper = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100px; /* Adjust height as needed */
`;

export default function UsersList() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState(null);

    useEffect(() => {
        (async () => {
            try {
                const res = await api.get("/api/users");
                setUsers(res.data);
            } catch (e) {
                console.error(e);
                setErr("불러오기 실패");
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    if (loading) return <LoadingWrapper><Spin /></LoadingWrapper>;
    if (err) return <div>{err}</div>;

    return (
        <div>
            <h2>Users</h2>
            {users.length === 0 ? (
                <div>데이터 없음</div>
            ) : (
                <ul>
                    {users.map(u => (
                        <span key={u.id}>
                            #{u.id} — {u.name} <br/>
                        </span>
                    ))}
                </ul>
            )}
        </div>
    );
}