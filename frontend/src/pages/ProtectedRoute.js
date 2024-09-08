import React from 'react';
import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const ProtectedRoute = ({ allowedRoles, children }) => {
  const token = localStorage.getItem('token');

  if (token) {
    try {
      const decodedUser = jwtDecode(token);

      if (allowedRoles.includes(decodedUser.role)) {
        return children;
      } else {
        return <Navigate to="/unauthorized" replace />;
      }
    } catch (error) {
      console.error('Error decoding token:', error);
      return <Navigate to="/" replace />;
    }
  } else {
    return <Navigate to="/" replace />;
  }
};

export default ProtectedRoute;
