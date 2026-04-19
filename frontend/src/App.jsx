import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import Tasks from './pages/Tasks';
import Notifications from './pages/Notifications';
import Users from './pages/Users';
import Layout from './components/Layout';

function AppContent() {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');

  if (!user) return <AuthPage />;

  const pages = {
    dashboard: <Dashboard />,
    projects: <Projects />,
    tasks: <Tasks />,
    notifications: <Notifications />,
    users: <Users />,
  };

  return (
    <Layout currentPage={currentPage} setCurrentPage={setCurrentPage}>
      {pages[currentPage] || <Dashboard />}
    </Layout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
