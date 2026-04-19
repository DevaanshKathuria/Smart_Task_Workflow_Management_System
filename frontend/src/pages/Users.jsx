import { useState, useEffect } from 'react';
import { userAPI } from '../api';
import { useAuth } from '../context/AuthContext';

export default function Users() {
  const { user: me, isAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await userAPI.getAll();
      setUsers(res.data);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const changeRole = async (id, role) => {
    if (id === me.id) { alert("You cannot change your own role."); return; }
    setUpdatingId(id);
    try { await userAPI.updateRole(id, role); load(); }
    catch (err) { alert(err.response?.data?.message || 'Failed'); }
    finally { setUpdatingId(null); }
  };

  if (loading) return <div className="page-loader"><span className="spinner" /> Loading...</div>;

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-title">Users</div>
        <div className="page-subtitle">{users.length} registered user{users.length !== 1 ? 's' : ''}</div>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Joined</th>
              {isAdmin && <th>Change role</th>}
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td>
                  <div className="flex-center gap-8">
                    <div className="avatar" style={{ width: 28, height: 28, fontSize: 11 }}>
                      {u.name[0].toUpperCase()}
                    </div>
                    <span style={{ fontWeight: 500 }}>
                      {u.name}
                      {u.id === me.id && (
                        <span className="text-dim text-xs" style={{ marginLeft: 6 }}>(you)</span>
                      )}
                    </span>
                  </div>
                </td>
                <td className="text-muted">{u.email}</td>
                <td><span className={`badge badge-${u.role.toLowerCase()}`}>{u.role}</span></td>
                <td className="text-dim text-sm">
                  {new Date(u.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </td>
                {isAdmin && (
                  <td>
                    {u.id !== me.id ? (
                      <select
                        className="form-select"
                        style={{ padding: '4px 10px', fontSize: 12, width: 'auto' }}
                        value={u.role}
                        disabled={updatingId === u.id}
                        onChange={e => changeRole(u.id, e.target.value)}
                      >
                        <option value="EMPLOYEE">Employee</option>
                        <option value="MANAGER">Manager</option>
                        <option value="ADMIN">Admin</option>
                      </select>
                    ) : (
                      <span className="text-dim text-sm">—</span>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
