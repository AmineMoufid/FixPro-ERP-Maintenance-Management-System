import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './auth/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import AdminDashboard from './pages/admin/Dashboard';
import Users from './pages/admin/Users';
import Clients from './pages/admin/Clients';
import Machines from './pages/admin/Machines';
import AdminInterventions from './pages/admin/Interventions';
import TechnicianInterventions from './pages/technician/MyInterventions';

const AppContent = () => {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/" element={!user ? <Login /> : <Navigate to={user.role === 'ADMIN' ? '/admin/dashboard' : '/technician/interventions'} />} />

      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <Users />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/clients"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <Clients />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/machines"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <Machines />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/interventions"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminInterventions />
          </ProtectedRoute>
        }
      />

      <Route
        path="/technician/interventions"
        element={
          <ProtectedRoute allowedRoles={['TECHNICIAN']}>
            <TechnicianInterventions />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
