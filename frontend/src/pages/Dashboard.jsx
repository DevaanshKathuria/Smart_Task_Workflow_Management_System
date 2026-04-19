import { useState, useEffect } from 'react';
import { projectAPI, taskAPI } from '../api';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user, isAdmin, isManager } = useAuth();
  const [stats, setStats] = useState({ projects: 0, tasks: 0, myTasks: 0, completed: 0 });
  const [recentTasks, setRecentTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [projects, myTasks] = await Promise.all([
          projectAPI.getAll(),
          taskAPI.getMyTasks(),
        ]);
        const allMyTasks = myTasks.data;
        const completed = allMyTasks.filter(t => t.status === 'COMPLETED').length;

        let allTasks = allMyTasks;
        if (isManager) {
          const allRes = await taskAPI.getAll();
          allTasks = allRes.data;
        }

        setStats({
          projects: projects.data.length,
          tasks: allTasks.length,
          myTasks: allMyTasks.length,
          completed,
        });
        setRecentTasks(allMyTasks.slice(0, 5));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isManager]);

  const getStatusBadge = (status) => {
    const labels = { TODO: 'To Do', IN_PROGRESS: 'In Progress', REVIEW: 'Review', COMPLETED: 'Completed' };
    return <span className={`badge badge-${status.toLowerCase()}`}>{labels[status] || status}</span>;
  };

  const getPriorityBadge = (priority) => (
    <span className={`badge badge-${priority.toLowerCase()}`}>{priority}</span>
  );

  if (loading) return (
    <div className="page-loader">
      <div className="spinner" />
      <span>Loading dashboard...</span>
    </div>
  );

  return (
    <>
      <div className="page-header">
        <div className="flex-between">
          <div>
            <h1 className="page-title">👋 Welcome, {user?.name?.split(' ')[0]}!</h1>
            <p className="page-subtitle">Here's what's happening in your workspace today.</p>
          </div>
          <span className={`badge badge-${user?.role?.toLowerCase()}`}>{user?.role}</span>
        </div>
      </div>

      <div className="page-body">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'var(--accent-light)' }}>📁</div>
            <div>
              <div className="stat-value">{stats.projects}</div>
              <div className="stat-label">Total Projects</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'var(--info-light)' }}>📋</div>
            <div>
              <div className="stat-value">{isManager ? stats.tasks : stats.myTasks}</div>
              <div className="stat-label">{isManager ? 'All Tasks' : 'My Tasks'}</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'var(--success-light)' }}>✅</div>
            <div>
              <div className="stat-value">{stats.completed}</div>
              <div className="stat-label">Completed</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'var(--warning-light)' }}>⏳</div>
            <div>
              <div className="stat-value">{stats.myTasks - stats.completed}</div>
              <div className="stat-label">Pending</div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex-between mb-16">
            <h2 style={{ fontSize: '16px', fontWeight: '700' }}>My Recent Tasks</h2>
          </div>
          {recentTasks.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <div className="empty-title">No tasks assigned</div>
              <div className="empty-desc">You don't have any tasks yet.</div>
            </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Task</th>
                    <th>Project</th>
                    <th>Status</th>
                    <th>Priority</th>
                    <th>Due Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTasks.map(task => (
                    <tr key={task.id}>
                      <td><strong>{task.title}</strong></td>
                      <td className="text-muted">{task.project?.name}</td>
                      <td>{getStatusBadge(task.status)}</td>
                      <td>{getPriorityBadge(task.priority)}</td>
                      <td className="text-muted text-sm">
                        {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
