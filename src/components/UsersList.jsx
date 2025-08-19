import { useEffect, useState } from "react";
import { api } from "../api";

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

    if (loading) return <div>로딩중...</div>;
    if (err) return <div>{err}</div>;

    return (
        <div>
            <h2>Users</h2>
            {users.length === 0 ? (
                <div>데이터 없음</div>
            ) : (
                <ul>
                    {users.map(u => (
                        <li key={u.id}>
                            #{u.id} — {u.name}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}