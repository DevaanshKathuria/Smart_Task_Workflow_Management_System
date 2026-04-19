import { useState, useEffect } from 'react';
import { projectAPI, userAPI } from '../api';
import { useAuth } from '../context/AuthContext';

export default function Projects() {
  const { user, isAdmin, isManager } = useAuth();
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editProject, setEditProject] = useState(null);
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
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditProject(null);
    setForm({ name: '', description: '', managerId: String(user.id), startDate: '', endDate: '' });
    setError('');
    setShowModal(true);
  };

  const openEdit = (p) => {
    setEditProject(p);
    setForm({
      name: p.name, description: p.description || '',
      managerId: String(p.managerId),
      startDate: p.startDate ? p.startDate.split('T')[0] : '',
      endDate: p.endDate ? p.endDate.split('T')[0] : '',
    });
    setError('');
    setShowModal(true);
  };

  const handleSave = async (e) => {
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
      if (editProject) { await projectAPI.update(editProject.id, data); }
      else { await projectAPI.create(data); }
      setShowModal(false);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save project');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this project and all its tasks?')) return;
    try { await projectAPI.delete(id); load(); }
    catch (err) { alert(err.response?.data?.message || 'Failed to delete'); }
  };

  if (loading) return <div className="page-loader"><div className="spinner" /><span>Loading projects...</span></div>;

  return (
    <>
      <div className="page-header">
        <div className="flex-between">
          <div>
            <h1 className="page-title">📁 Projects</h1>
            <p className="page-subtitle">{projects.length} project{projects.length !== 1 ? 's' : ''} total</p>
          </div>
          {isManager && (
            <button id="btn-create-project" className="btn btn-primary" onClick={openCreate}>
              ＋ New Project
            </button>
          )}
        </div>
      </div>

      <div className="page-body">
        {projects.length === 0 ? (
          <div className="card">
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <div className="empty-title">No projects yet</div>
              <div className="empty-desc">Create your first project to get started.</div>
            </div>
          </div>
        ) : (
          <div className="grid-auto">
            {projects.map(p => (
              <div key={p.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div className="flex-between">
                  <h3 style={{ fontSize: '16px', fontWeight: '700' }}>{p.name}</h3>
                  {isManager && (
                    <div className="flex gap-8">
                      <button className="btn btn-secondary btn-sm btn-icon" onClick={() => openEdit(p)} title="Edit">✏️</button>
                      {isAdmin && (
                        <button className="btn btn-danger btn-sm btn-icon" onClick={() => handleDelete(p.id)} title="Delete">🗑️</button>
                      )}
                    </div>
                  )}
                </div>
                {p.description && <p className="text-sm text-muted">{p.description}</p>}
                <div className="flex gap-8" style={{ flexWrap: 'wrap' }}>
                  <span className="badge badge-employee">👤 {p.manager?.name}</span>
                  <span className="badge badge-in_progress">📋 {p.tasks?.length || 0} tasks</span>
                </div>
                {(p.startDate || p.endDate) && (
                  <div className="flex gap-8 text-sm text-muted">
                    {p.startDate && <span>🗓 {new Date(p.startDate).toLocaleDateString()}</span>}
                    {p.endDate && <span>→ {new Date(p.endDate).toLocaleDateString()}</span>}
                  </div>
                )}
                {p.tasks && p.tasks.length > 0 && (
                  <div style={{ marginTop: 'auto', paddingTop: 8, borderTop: '1px solid var(--border)' }}>
                    <div className="flex gap-8" style={{ flexWrap: 'wrap' }}>
                      {p.tasks.slice(0, 3).map(t => (
                        <span key={t.id} className={`badge badge-${t.status.toLowerCase()}`}>{t.title}</span>
                      ))}
                      {p.tasks.length > 3 && <span className="badge badge-employee">+{p.tasks.length - 3} more</span>}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}>
          <div className="modal">
            <div className="modal-header">
              <h2 className="modal-title">{editProject ? 'Edit Project' : 'New Project'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            {error && <div className="alert alert-error mb-16">{error}</div>}
            <form className="modal-form" onSubmit={handleSave}>
              <div className="form-group">
                <label className="form-label">Project Name *</label>
                <input id="project-name" className="form-input" placeholder="e.g. Website Redesign" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea id="project-desc" className="form-textarea" placeholder="What is this project about?" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>
              {isAdmin && users.length > 0 && (
                <div className="form-group">
                  <label className="form-label">Manager</label>
                  <select id="project-manager" className="form-select" value={form.managerId} onChange={e => setForm({ ...form, managerId: e.target.value })}>
                    {users.map(u => <option key={u.id} value={u.id}>{u.name} ({u.role})</option>)}
                  </select>
                </div>
              )}
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Start Date</label>
                  <input id="project-start" type="date" className="form-input" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">End Date</label>
                  <input id="project-end" type="date" className="form-input" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button id="project-save" type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <><span className="spinner" /> Saving...</> : (editProject ? 'Update Project' : 'Create Project')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
