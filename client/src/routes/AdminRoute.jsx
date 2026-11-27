import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader } from '../components/common/Loader';

export const AdminRoute = ({ children }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black text-light-body dark:text-dark-body p-6">
        <Loader
          size="lg"
          label="Verifying Administrative Privileges..."
          sublabel="Checking role-based access control and token permissions"
        />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Strictly enforce role === 'admin'
  if (user?.role !== 'admin') {
    return <Navigate to="/dashboard" state={{ unauthorized: true, from: location }} replace />;
  }

  return children ? children : <Outlet />;
};

export default AdminRoute;
