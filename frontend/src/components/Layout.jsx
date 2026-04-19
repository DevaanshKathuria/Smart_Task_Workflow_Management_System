import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { notificationAPI } from '../api';

export default function Layout({ currentPage, setCurrentPage, children }) {
  const { user, logout, isAdmin } = useAuth();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await notificationAPI.getAll();
        setUnread(res.data.filter(n => !n.isRead).length);
      } catch {}
    };
    fetch();
    const iv = setInterval(fetch, 30000);
    return () => clearInterval(iv);
  }, []);

  const nav = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'projects', label: 'Projects' },
    { id: 'tasks', label: 'Tasks' },
    { id: 'notifications', label: 'Notifications', badge: unread },
    ...(isManager ? [{ id: 'users', label: 'Users' }] : []),
  ];

  const pageLabels = {
    dashboard: 'Dashboard', projects: 'Projects', tasks: 'Tasks',
    notifications: 'Notifications', users: 'Users',
  };

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-brand-name">STWMS</div>
          <div className="sidebar-brand-sub">Workflow Management</div>
        </div>

        <nav className="sidebar-nav">
          {nav.map(item => (
            <button
              key={item.id}
              id={`nav-${item.id}`}
              className={`nav-item ${currentPage === item.id ? 'active' : ''}`}
              onClick={() => setCurrentPage(item.id)}
            >
              {item.label}
              {item.badge > 0 && (
                <span className="nav-badge">{item.badge}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="avatar">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div>
              <div className="sidebar-user-name">{user?.name}</div>
              <div className="sidebar-user-role">{user?.role}</div>
            </div>
          </div>
          <button id="btn-logout" className="btn btn-ghost w-full btn-sm" onClick={logout}>
            Sign out
          </button>
        </div>
      </aside>

      <main className="main-content">
        <div className="topbar">
          <span className="topbar-breadcrumb">
            {pageLabels[currentPage] || 'Dashboard'}
          </span>
          <div className="topbar-actions">
            <button
              id="topbar-notif"
              className="btn btn-ghost btn-sm"
              onClick={() => setCurrentPage('notifications')}
              style={{ position: 'relative' }}
            >
              Notifications
              {unread > 0 && (
                <span className="nav-badge" style={{ position: 'absolute', top: -4, right: -4 }}>
                  {unread}
                </span>
              )}
            </button>
          </div>
        </div>
        {children}
      </main>
    </div>
  );
}
