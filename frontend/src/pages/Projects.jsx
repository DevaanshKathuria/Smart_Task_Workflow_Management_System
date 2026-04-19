import { useState, useEffect } from 'react';
import { projectAPI, userAPI } from '../api';
import { useAuth } from '../context/AuthContext';

export default function Projects() {
  const { user, isAdmin, isManager } = useAuth();
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', managerId: '', startDate: '', endDate: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const [pRes, uRes] = await Promise.all([
        projectAPI.getAll(),
        isAdmin ? userAPI.getAll().catch(() => ({ data: [] })) : Promise.resolve({ data: [] }),
      ]);
      setProjects(pRes.data);
      setUsers(uRes.data || []);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', description: '', managerId: String(user.id), startDate: '', endDate: '' });
    setError('');
    setShowModal(true);
  };

  const openEdit = (p) => {
    setEditing(p);
    setForm({
      name: p.name, description: p.description || '',
      managerId: String(p.managerId),
      startDate: p.startDate ? p.startDate.split('T')[0] : '',
      endDate: p.endDate ? p.endDate.split('T')[0] : '',
    });
    setError('');
    setShowModal(true);
  };

  const save = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setError('Project name is required'); return; }
    setSaving(true); setError('');
    try {
      const data = {
        name: form.name,
        description: form.description || undefined,
        managerId: Number(form.managerId) || user.id,
        startDate: form.startDate || undefined,
        endDate: form.endDate || undefined,
      };
      editing ? await projectAPI.update(editing.id, data) : await projectAPI.create(data);
      setShowModal(false);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save');
    } finally { setSaving(false); }
  };

  const del = async (id) => {
    if (!confirm('Delete this project and all its tasks?')) return;
    try { await projectAPI.delete(id); load(); }
    catch (err) { alert(err.response?.data?.message || 'Failed'); }
  };

  if (loading) return <div className="page-loader"><span className="spinner" /> Loading...</div>;

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-title-row">
          <div>
            <div className="page-title">Projects</div>
            <div className="page-subtitle">{projects.length} project{projects.length !== 1 ? 's' : ''}</div>
          </div>
          {isManager && (
            <button id="btn-create-project" className="btn btn-primary" onClick={openCreate}>
              New project
            </button>
          )}
        </div>
      </div>

      {projects.length === 0 ? (
        <div className="empty-state">
          <div className="empty-title">No projects yet</div>
          <div className="empty-sub">Create your first project to get started</div>
        </div>
      ) : (
        <div className="project-grid">
          {projects.map(p => (
            <div key={p.id} className="project-card">
              <div className="project-card-header">
                <div className="project-card-name">{p.name}</div>
                {isManager && (
                  <div className="flex gap-6">
                    <button className="btn btn-ghost btn-xs" onClick={() => openEdit(p)}>Edit</button>
                    {isAdmin && (
                      <button className="btn btn-danger btn-xs" onClick={() => del(p.id)}>Delete</button>
                    )}
                  </div>
                )}
              </div>

              {p.description && (
                <div className="project-card-desc">{p.description}</div>
              )}

              <div className="project-card-meta">
                <div>
                  <div className="project-meta-label">Manager</div>
                  <div className="project-meta-value">{p.manager?.name}</div>
                </div>
                <div>
                  <div className="project-meta-label">Tasks</div>
                  <div className="project-meta-value">{p.tasks?.length || 0}</div>
                </div>
                {p.endDate && (
                  <div>
                    <div className="project-meta-label">Due</div>
                    <div className="project-meta-value">
                      {new Date(p.endDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' })}
                    </div>
                  </div>
                )}
              </div>

              {p.tasks && p.tasks.length > 0 && (
                <div className="flex gap-6" style={{ flexWrap: 'wrap' }}>
                  {p.tasks.slice(0, 4).map(t => (
                    <span key={t.id} className={`badge badge-${t.status.toLowerCase()}`}>{t.title}</span>
                  ))}
                  {p.tasks.length > 4 && (
                    <span className="badge badge-todo">+{p.tasks.length - 4} more</span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h2 className="modal-title">{editing ? 'Edit project' : 'New project'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>x</button>
            </div>
            {error && <div className="alert alert-error">{error}</div>}
            <form onSubmit={save}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Project name</label>
                  <input id="project-name" className="form-input" placeholder="e.g. Website Redesign" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea id="project-desc" className="form-textarea" placeholder="Brief description..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                </div>
                {isAdmin && users.length > 0 && (
                  <div className="form-group">
                    <label className="form-label">Manager</label>
                    <select id="project-manager" className="form-select" value={form.managerId} onChange={e => setForm({ ...form, managerId: e.target.value })}>
                      {users.map(u => <option key={u.id} value={u.id}>{u.name} — {u.role}</option>)}
                    </select>
                  </div>
                )}
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Start date</label>
                    <input id="project-start" type="date" className="form-input" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">End date</label>
                    <input id="project-end" type="date" className="form-input" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button id="project-save" type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <><span className="spinner" /> Saving...</> : (editing ? 'Update' : 'Create project')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
