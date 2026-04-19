import { useState, useEffect } from 'react';
import { projectAPI, taskAPI, userAPI } from '../api';
import { useAuth } from '../context/AuthContext';

export default function Tasks() {
  const { user, isManager } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', status: 'TODO', priority: 'MEDIUM', dueDate: '', projectId: '', assignedToId: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('ALL');

  const STATUS_OPTIONS = ['TODO', 'IN_PROGRESS', 'REVIEW', 'COMPLETED'];
  const PRIORITY_OPTIONS = ['LOW', 'MEDIUM', 'HIGH'];
  const STATUS_LABELS = { TODO: 'To Do', IN_PROGRESS: 'In Progress', REVIEW: 'Review', COMPLETED: 'Completed' };

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
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [isManager]);

  const openCreate = () => {
    setEditTask(null);
    setForm({ title: '', description: '', status: 'TODO', priority: 'MEDIUM', dueDate: '', projectId: projects[0]?.id || '', assignedToId: '' });
    setError('');
    setShowModal(true);
  };

  const openEdit = (t) => {
    setEditTask(t);
    setForm({
      title: t.title, description: t.description || '', status: t.status,
      priority: t.priority, dueDate: t.dueDate ? t.dueDate.split('T')[0] : '',
      projectId: t.projectId, assignedToId: t.assignedToId || '',
    });
    setError('');
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.projectId) { setError('Title and project are required'); return; }
    setSaving(true); setError('');
    try {
      const data = {
        title: form.title, description: form.description || undefined,
        status: form.status, priority: form.priority,
        dueDate: form.dueDate || undefined, projectId: Number(form.projectId),
        assignedToId: form.assignedToId ? Number(form.assignedToId) : undefined,
      };
      if (editTask) { await taskAPI.update(editTask.id, data); }
      else { await taskAPI.create(data); }
      setShowModal(false); load();
    } catch (err) { setError(err.response?.data?.message || 'Failed to save task'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this task?')) return;
    try { await taskAPI.delete(id); load(); }
    catch (err) { alert(err.response?.data?.message || 'Failed to delete'); }
  };

  const handleStatusChange = async (id, status) => {
    try { await taskAPI.update(id, { status }); load(); }
    catch (e) { console.error(e); }
  };

  const filtered = filter === 'ALL' ? tasks : tasks.filter(t => t.status === filter);

  if (loading) return <div className="page-loader"><div className="spinner" /><span>Loading tasks...</span></div>;

  return (
    <>
      <div className="page-header">
        <div className="flex-between">
          <div>
            <h1 className="page-title">📋 Tasks</h1>
            <p className="page-subtitle">{tasks.length} task{tasks.length !== 1 ? 's' : ''} {isManager ? 'total' : 'assigned to you'}</p>
          </div>
          {isManager && (
            <button id="btn-create-task" className="btn btn-primary" onClick={openCreate}>＋ New Task</button>
          )}
        </div>
        <div className="page-actions">
          {['ALL', ...STATUS_OPTIONS].map(s => (
            <button key={s} className={`btn btn-sm ${filter === s ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilter(s)}>
              {s === 'ALL' ? 'All' : STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      </div>

      <div className="page-body">
        {filtered.length === 0 ? (
          <div className="card"><div className="empty-state"><div className="empty-icon">✅</div><div className="empty-title">No tasks</div><div className="empty-desc">No tasks match this filter.</div></div></div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr><th>Task</th><th>Project</th><th>Assigned To</th><th>Status</th><th>Priority</th><th>Due Date</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {filtered.map(t => (
                  <tr key={t.id}>
                    <td><strong>{t.title}</strong>{t.description && <div className="text-sm text-muted">{t.description.substring(0, 50)}{t.description.length > 50 ? '...' : ''}</div>}</td>
                    <td className="text-muted text-sm">{t.project?.name}</td>
                    <td>{t.assignedTo ? <div className="flex gap-8" style={{ alignItems: 'center' }}><div className="avatar" style={{ width: 24, height: 24, fontSize: 10 }}>{t.assignedTo.name[0]}</div><span className="text-sm">{t.assignedTo.name}</span></div> : <span className="text-muted text-sm">Unassigned</span>}</td>
                    <td>
                      <select className="form-select" style={{ padding: '4px 8px', fontSize: 12, width: 'auto' }} value={t.status} onChange={e => handleStatusChange(t.id, e.target.value)}>
                        {STATUS_OPTIONS.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                      </select>
                    </td>
                    <td><span className={`badge badge-${t.priority.toLowerCase()}`}>{t.priority}</span></td>
                    <td className="text-muted text-sm">{t.dueDate ? new Date(t.dueDate).toLocaleDateString() : '—'}</td>
                    <td>
                      <div className="flex gap-8">
                        <button className="btn btn-secondary btn-sm btn-icon" onClick={() => openEdit(t)}>✏️</button>
                        {isManager && <button className="btn btn-danger btn-sm btn-icon" onClick={() => handleDelete(t.id)}>🗑️</button>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}>
          <div className="modal">
            <div className="modal-header">
              <h2 className="modal-title">{editTask ? 'Edit Task' : 'New Task'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            {error && <div className="alert alert-error mb-16">{error}</div>}
            <form className="modal-form" onSubmit={handleSave}>
              <div className="form-group">
                <label className="form-label">Title *</label>
                <input id="task-title" className="form-input" placeholder="Task title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea id="task-desc" className="form-textarea" placeholder="Task description..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Project *</label>
                <select id="task-project" className="form-select" value={form.projectId} onChange={e => setForm({ ...form, projectId: e.target.value })} required>
                  <option value="">Select project...</option>
                  {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Assign To</label>
                <select id="task-assign" className="form-select" value={form.assignedToId} onChange={e => setForm({ ...form, assignedToId: e.target.value })}>
                  <option value="">Unassigned</option>
                  {users.map(u => <option key={u.id} value={u.id}>{u.name} ({u.role})</option>)}
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
                <label className="form-label">Due Date</label>
                <input id="task-due" type="date" className="form-input" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button id="task-save" type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <><span className="spinner" /> Saving...</> : (editTask ? 'Update Task' : 'Create Task')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
