import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const PublicRoute = ({ children, redirectTo = '/chat' }) => {
  const { user, token, loading } = useAuth();

  // Don't redirect while loading
  if (loading) {
    return children;
  }

  // Redirect authenticated users away from login/signup pages
  if (user && token) {
    return <Navigate to={redirectTo} replace />;
  }

  return children;
};

export default PublicRoute;