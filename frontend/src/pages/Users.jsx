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
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleRoleChange = async (id, role) => {
    if (id === me.id) { alert("You can't change your own role."); return; }
    setUpdatingId(id);
    try { await userAPI.updateRole(id, role); load(); }
    catch (e) { alert(e.response?.data?.message || 'Failed to update role'); }
    finally { setUpdatingId(null); }
  };

  if (loading) return <div className="page-loader"><div className="spinner" /><span>Loading users...</span></div>;

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">👥 Users</h1>
        <p className="page-subtitle">{users.length} user{users.length !== 1 ? 's' : ''} registered</p>
      </div>
      <div className="page-body">
        <div className="table-wrapper">
          <table>
            <thead>
              <tr><th>User</th><th>Email</th><th>Role</th><th>Joined</th>{isAdmin && <th>Actions</th>}</tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td>
                    <div className="flex gap-8" style={{ alignItems: 'center' }}>
                      <div className="avatar" style={{ width: 32, height: 32, fontSize: 13 }}>{u.name[0]}</div>
                      <span style={{ fontWeight: 600 }}>{u.name}{u.id === me.id && <span className="text-muted text-sm"> (you)</span>}</span>
                    </div>
                  </td>
                  <td className="text-muted">{u.email}</td>
                  <td><span className={`badge badge-${u.role.toLowerCase()}`}>{u.role}</span></td>
                  <td className="text-muted text-sm">{new Date(u.createdAt).toLocaleDateString()}</td>
                  {isAdmin && (
                    <td>
                      {u.id !== me.id ? (
                        <select
                          className="form-select"
                          style={{ padding: '4px 8px', fontSize: 12, width: 'auto' }}
                          value={u.role}
                          disabled={updatingId === u.id}
                          onChange={e => handleRoleChange(u.id, e.target.value)}
                        >
                          <option value="EMPLOYEE">EMPLOYEE</option>
                          <option value="MANAGER">MANAGER</option>
                          <option value="ADMIN">ADMIN</option>
                        </select>
                      ) : <span className="text-muted text-sm">—</span>}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
