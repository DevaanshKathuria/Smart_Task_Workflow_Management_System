import { useState, useEffect } from 'react';
import { projectAPI, taskAPI } from '../api';
import { useAuth } from '../context/AuthContext';

const STATUS_LABELS = { TODO: 'To Do', IN_PROGRESS: 'In Progress', REVIEW: 'Review', COMPLETED: 'Completed' };

export default function Dashboard() {
  const { user, isManager } = useAuth();
  const [stats, setStats] = useState({ projects: 0, total: 0, mine: 0, done: 0 });
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [pRes, myRes] = await Promise.all([projectAPI.getAll(), taskAPI.getMyTasks()]);
        const mine = myRes.data;
        let total = mine.length;
        if (isManager) {
          const all = await taskAPI.getAll();
          total = all.data.length;
        }
        setStats({
          projects: pRes.data.length,
          total,
          mine: mine.length,
          done: mine.filter(t => t.status === 'COMPLETED').length,
        });
        setRecent(mine.slice(0, 8));
      } catch {}
      finally { setLoading(false); }
    };
    load();
  }, [isManager]);

  if (loading) return (
    <div className="page-loader"><span className="spinner" /> Loading...</div>
  );

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-title-row">
          <div>
            <div className="page-title">
              Welcome back, {user?.name?.split(' ')[0]}
            </div>
            <div className="page-subtitle">Here's an overview of your workspace</div>
          </div>
          <span className={`badge badge-${user?.role?.toLowerCase()}`}>{user?.role}</span>
        </div>
      </div>

      <div className="stats-row">
        <div className="stat-cell">
          <div className="stat-value">{stats.projects}</div>
          <div className="stat-label">Projects</div>
        </div>
        <div className="stat-cell">
          <div className="stat-value">{isManager ? stats.total : stats.mine}</div>
          <div className="stat-label">{isManager ? 'Total tasks' : 'My tasks'}</div>
        </div>
        <div className="stat-cell">
          <div className="stat-value stat-accent">{stats.done}</div>
          <div className="stat-label">Completed</div>
        </div>
        <div className="stat-cell">
          <div className="stat-value">{stats.mine - stats.done}</div>
          <div className="stat-label">Pending</div>
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <div className="flex-between mb-16">
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)' }}>
            My assigned tasks
          </div>
        </div>
        {recent.length === 0 ? (
          <div className="empty-state">
            <div className="empty-title">No tasks assigned</div>
            <div className="empty-sub">Tasks assigned to you will appear here</div>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Task</th>
                  <th>Project</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Due</th>
                </tr>
              </thead>
              <tbody>
                {recent.map(t => (
                  <tr key={t.id}>
                    <td style={{ fontWeight: 500 }}>{t.title}</td>
                    <td className="text-muted">{t.project?.name}</td>
                    <td><span className={`badge badge-${t.status.toLowerCase()}`}>{STATUS_LABELS[t.status]}</span></td>
                    <td><span className={`badge badge-${t.priority.toLowerCase()}`}>{t.priority}</span></td>
                    <td className="text-dim text-sm">
                      {t.dueDate ? new Date(t.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
