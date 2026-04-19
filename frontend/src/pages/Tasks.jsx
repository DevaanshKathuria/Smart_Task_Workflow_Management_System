import { useState, useEffect } from 'react';
import { projectAPI, taskAPI, userAPI } from '../api';
import { useAuth } from '../context/AuthContext';

const STATUS_OPTIONS = ['TODO', 'IN_PROGRESS', 'REVIEW', 'COMPLETED'];
const PRIORITY_OPTIONS = ['LOW', 'MEDIUM', 'HIGH'];
const STATUS_LABELS = { TODO: 'To Do', IN_PROGRESS: 'In Progress', REVIEW: 'Review', COMPLETED: 'Completed' };

export default function Tasks() {
  const { user, isManager } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', status: 'TODO', priority: 'MEDIUM', dueDate: '', projectId: '', assignedToId: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('ALL');

  const load = async () => {
    setLoading(true);
    try {
      const [tRes, pRes, uRes] = await Promise.all([
        isManager ? taskAPI.getAll() : taskAPI.getMyTasks(),
        projectAPI.getAll(),
        userAPI.getAll().catch(() => ({ data: [] })),
      ]);
      setTasks(tRes.data);
      setProjects(pRes.data);
      setUsers(uRes.data || []);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [isManager]);

  const openCreate = () => {
    setEditing(null);
    setForm({ title: '', description: '', status: 'TODO', priority: 'MEDIUM', dueDate: '', projectId: projects[0]?.id || '', assignedToId: '' });
    setError('');
    setShowModal(true);
  };

  const openEdit = (t) => {
    setEditing(t);
    setForm({
      title: t.title, description: t.description || '', status: t.status,
      priority: t.priority, dueDate: t.dueDate ? t.dueDate.split('T')[0] : '',
      projectId: t.projectId, assignedToId: t.assignedToId || '',
    });
    setError('');
    setShowModal(true);
  };

  const save = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.projectId) { setError('Title and project are required'); return; }
    setSaving(true); setError('');
    try {
      const data = {
        title: form.title, description: form.description || undefined,
        status: form.status, priority: form.priority,
        dueDate: form.dueDate || undefined,
        projectId: Number(form.projectId),
        assignedToId: form.assignedToId ? Number(form.assignedToId) : undefined,
      };
      editing ? await taskAPI.update(editing.id, data) : await taskAPI.create(data);
      setShowModal(false); load();
    } catch (err) { setError(err.response?.data?.message || 'Failed to save'); }
    finally { setSaving(false); }
  };

  const del = async (id) => {
    if (!confirm('Delete this task?')) return;
    try { await taskAPI.delete(id); load(); } catch (err) { alert(err.response?.data?.message || 'Failed'); }
  };

  const changeStatus = async (id, status) => {
    try { await taskAPI.update(id, { status }); load(); } catch {}
  };

  const filtered = filter === 'ALL' ? tasks : tasks.filter(t => t.status === filter);

  if (loading) return <div className="page-loader"><span className="spinner" /> Loading...</div>;

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-title-row">
          <div>
            <div className="page-title">Tasks</div>
            <div className="page-subtitle">
              {tasks.length} task{tasks.length !== 1 ? 's' : ''} {isManager ? '' : 'assigned to you'}
            </div>
          </div>
          {isManager && (
            <button id="btn-create-task" className="btn btn-primary" onClick={openCreate}>New task</button>
          )}
        </div>
      </div>

      <div className="filter-row">
        {['ALL', ...STATUS_OPTIONS].map(s => (
          <button
            key={s}
            className={`filter-btn ${filter === s ? 'active' : ''}`}
            onClick={() => setFilter(s)}
          >
            {s === 'ALL' ? 'All' : STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-title">No tasks</div>
          <div className="empty-sub">No tasks match this filter</div>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Task</th>
                <th>Project</th>
                <th>Assigned to</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Due</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(t => (
                <tr key={t.id}>
                  <td>
                    <div style={{ fontWeight: 500 }}>{t.title}</div>
                    {t.description && (
                      <div className="text-dim text-xs mt-4">
                        {t.description.length > 60 ? t.description.slice(0, 60) + '...' : t.description}
                      </div>
                    )}
                  </td>
                  <td className="text-muted text-sm">{t.project?.name}</td>
                  <td>
                    {t.assignedTo
                      ? <div className="flex-center gap-8">
                          <div className="avatar" style={{ width: 24, height: 24, fontSize: 10 }}>
                            {t.assignedTo.name[0]}
                          </div>
                          <span className="text-sm">{t.assignedTo.name}</span>
                        </div>
                      : <span className="text-dim text-sm">Unassigned</span>
                    }
                  </td>
                  <td>
                    <select
                      className="form-select"
                      style={{ padding: '4px 8px', fontSize: 12, width: 'auto' }}
                      value={t.status}
                      onChange={e => changeStatus(t.id, e.target.value)}
                    >
                      {STATUS_OPTIONS.map(s => (
                        <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                      ))}
                    </select>
                  </td>
                  <td><span className={`badge badge-${t.priority.toLowerCase()}`}>{t.priority}</span></td>
                  <td className="text-dim text-sm">
                    {t.dueDate ? new Date(t.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '—'}
                  </td>
                  <td>
                    <div className="flex gap-6">
                      <button className="btn btn-ghost btn-xs" onClick={() => openEdit(t)}>Edit</button>
                      {isManager && (
                        <button className="btn btn-danger btn-xs" onClick={() => del(t.id)}>Delete</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h2 className="modal-title">{editing ? 'Edit task' : 'New task'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>x</button>
            </div>
            {error && <div className="alert alert-error">{error}</div>}
            <form onSubmit={save}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Title</label>
                  <input id="task-title" className="form-input" placeholder="Task title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea id="task-desc" className="form-textarea" placeholder="Optional description..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Project</label>
                  <select id="task-project" className="form-select" value={form.projectId} onChange={e => setForm({ ...form, projectId: e.target.value })} required>
                    <option value="">Select project...</option>
                    {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Assign to</label>
                  <select id="task-assign" className="form-select" value={form.assignedToId} onChange={e => setForm({ ...form, assignedToId: e.target.value })}>
                    <option value="">Unassigned</option>
                    {users.map(u => <option key={u.id} value={u.id}>{u.name} — {u.role}</option>)}
                  </select>
                </div>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <select id="task-status" className="form-select" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                      {STATUS_OPTIONS.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Priority</label>
                    <select id="task-priority" className="form-select" value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
                      {PRIORITY_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Due date</label>
                  <input id="task-due" type="date" className="form-input" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button id="task-save" type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <><span className="spinner" /> Saving...</> : (editing ? 'Update' : 'Create task')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
