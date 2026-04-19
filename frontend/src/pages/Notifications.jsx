import { useState, useEffect } from 'react';
import { notificationAPI } from '../api';

export default function Notifications() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await notificationAPI.getAll();
      setItems(res.data);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const markRead = async (id) => {
    try { await notificationAPI.markAsRead(id); load(); } catch {}
  };

  const markAll = async () => {
    try { await notificationAPI.markAllAsRead(); load(); } catch {}
  };

  const del = async (id) => {
    try { await notificationAPI.delete(id); load(); } catch {}
  };

  const unread = items.filter(n => !n.isRead).length;

  if (loading) return <div className="page-loader"><span className="spinner" /> Loading...</div>;

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-title-row">
          <div>
            <div className="page-title">Notifications</div>
            <div className="page-subtitle">
              {unread > 0 ? `${unread} unread` : 'All caught up'}
            </div>
          </div>
          {unread > 0 && (
            <button id="btn-mark-all-read" className="btn btn-ghost" onClick={markAll}>
              Mark all as read
            </button>
          )}
        </div>
      </div>

      {items.length === 0 ? (
        <div className="empty-state">
          <div className="empty-title">No notifications</div>
          <div className="empty-sub">You will be notified when tasks are assigned or updated</div>
        </div>
      ) : (
        <div className="notif-list">
          {items.map(n => (
            <div key={n.id} className="notif-item">
              <div className={`notif-indicator ${n.isRead ? 'notif-indicator-read' : ''}`} />
              <div style={{ flex: 1 }}>
                <div className="notif-msg">{n.message}</div>
                <div className="notif-time mt-4">
                  {new Date(n.createdAt).toLocaleString('en-GB', {
                    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                  })}
                </div>
              </div>
              <div className="flex gap-6">
                {!n.isRead && (
                  <button className="btn btn-ghost btn-xs" onClick={() => markRead(n.id)}>
                    Mark read
                  </button>
                )}
                <button className="btn btn-danger btn-xs" onClick={() => del(n.id)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
