import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { notificationAPI } from '../api';

export default function Layout({ currentPage, setCurrentPage, children }) {
  const { user, logout, isAdmin, isManager } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await notificationAPI.getAll();
        setUnreadCount(res.data.filter(n => !n.isRead).length);
      } catch {}
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
    { id: 'projects', label: 'Projects', icon: '📁' },
    { id: 'tasks', label: 'Tasks', icon: '📋' },
    { id: 'notifications', label: 'Notifications', icon: '🔔', badge: unreadCount },
    ...(isAdmin ? [{ id: 'users', label: 'Users', icon: '👥' }] : []),
  ];

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <h1>STWMS</h1>
          <p>Workflow Management</p>
        </div>
        <nav className="sidebar-nav">
          {navItems.map(item => (
            <button
              key={item.id}
              id={`nav-${item.id}`}
              className={`nav-item ${currentPage === item.id ? 'active' : ''}`}
              onClick={() => setCurrentPage(item.id)}
            >
              <span className="icon">{item.icon}</span>
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.badge > 0 && (
                <span style={{ background: 'var(--danger)', color: 'white', borderRadius: '20px', padding: '1px 7px', fontSize: 11, fontWeight: 700 }}>
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>
        <div className="sidebar-user">
          <div className="sidebar-user-info">
            <div className="avatar">{user?.name?.[0] || 'U'}</div>
            <div>
              <div className="sidebar-user-name">{user?.name}</div>
              <div className="sidebar-user-role">{user?.role}</div>
            </div>
          </div>
          <button id="btn-logout" className="btn btn-secondary w-full btn-sm" onClick={logout}>
            ⎋ Sign Out
          </button>
        </div>
      </aside>
      <main className="main-content">
        <div className="topbar">
          <span className="topbar-left">Smart Task & Workflow Management System</span>
          <div className="topbar-right">
            <button
              className="btn btn-secondary btn-sm notif-badge"
              onClick={() => setCurrentPage('notifications')}
              id="topbar-notif"
            >
              🔔
              {unreadCount > 0 && <span className="notif-badge-count">{unreadCount}</span>}
            </button>
            <div className="avatar">{user?.name?.[0] || 'U'}</div>
          </div>
        </div>
        {children}
      </main>
    </div>
  );
}
