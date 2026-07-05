import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

/**
 * Route guard component that checks if user is logged in.
 * Shows loading spinner while authentication status is being checked.
 */
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-main)] flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-[#82aeb1]/30 border-t-[#93c6d6] rounded-full animate-spin"></div>
          <p className="mt-4 text-[var(--text-secondary)] font-medium animate-pulse">
            Loading secure session...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
