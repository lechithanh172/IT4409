import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Spinner from '../Spinner/Spinner';
const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) 
  {
    return (
       <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
            <Spinner size="large" />
       </div>
    );
  }

  if (!isAuthenticated) 
  {
    console.log('ProtectedRoute: Chưa đăng nhập, chuyển đến /login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole) 
  {
    const rolesToCheck = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    if (!user || !user.role || !rolesToCheck.includes(user.role.toLowerCase())) {
      console.log(`ProtectedRoute: Không đủ quyền. Yêu cầu: ${requiredRole}, User có: ${user?.role}`);
      return <Navigate to="/unauthorized" replace />;
    }
  } 
  return children;
};

export default ProtectedRoute;