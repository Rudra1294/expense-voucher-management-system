import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/authContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect unauthorized users to their respective dashboards
    const roleRoutes = {
      EMPLOYEE: '/employee',
      DIRECTOR: '/director',
      ACCOUNTS: '/accounts',
    };
    return <Navigate to={roleRoutes[user.role] || '/login'} replace />;
  }

  return children;
};

export default ProtectedRoute;