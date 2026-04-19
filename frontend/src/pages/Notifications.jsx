import { useState, useEffect } from 'react';
import { notificationAPI } from '../api';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await notificationAPI.getAll();
      setNotifications(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleMarkRead = async (id) => {
    try { await notificationAPI.markAsRead(id); load(); } catch (e) { console.error(e); }
  };

  const handleMarkAll = async () => {
    try { await notificationAPI.markAllAsRead(); load(); } catch (e) { console.error(e); }
  };

  const handleDelete = async (id) => {
    try { await notificationAPI.delete(id); load(); } catch (e) { console.error(e); }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (loading) return <div className="page-loader"><div className="spinner" /><span>Loading notifications...</span></div>;

  return (
    <>
      <div className="page-header">
        <div className="flex-between">
          <div>
            <h1 className="page-title">🔔 Notifications</h1>
            <p className="page-subtitle">{unreadCount} unread of {notifications.length} total</p>
          </div>
          {unreadCount > 0 && (
            <button id="btn-mark-all-read" className="btn btn-secondary" onClick={handleMarkAll}>
              ✓ Mark all as read
            </button>
          )}
        </div>
      </div>
      <div className="page-body">
        {notifications.length === 0 ? (
          <div className="card">
            <div className="empty-state">
              <div className="empty-icon">🔕</div>
              <div className="empty-title">No notifications</div>
              <div className="empty-desc">You're all caught up!</div>
            </div>
          </div>
        ) : (
          <div>
            {notifications.map(n => (
              <div key={n.id} className={`notif-item ${!n.isRead ? 'unread' : ''}`}>
                {!n.isRead && <div className="notif-dot" />}
                <div style={{ flex: 1 }}>
                  <div className="notif-msg">{n.message}</div>
                  <div className="notif-time">{new Date(n.createdAt).toLocaleString()}</div>
                </div>
                <div className="flex gap-8">
                  {!n.isRead && (
                    <button className="btn btn-secondary btn-sm" onClick={() => handleMarkRead(n.id)}>✓ Read</button>
                  )}
                  <button className="btn btn-danger btn-sm btn-icon" onClick={() => handleDelete(n.id)}>🗑️</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
