import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Spinner from '../Spinner/Spinner';

/**
 * Component bảo vệ route.
 * - Nếu không có requiredRole: Yêu cầu đăng nhập.
 * - Nếu có requiredRole: Yêu cầu đăng nhập VÀ đúng vai trò.
 * @param {object} props
 * @param {React.ReactNode} props.children - Component con cần bảo vệ.
 * @param {string | string[]} [props.requiredRole] - Vai trò yêu cầu (tùy chọn).
 */
const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // 1. Xử lý trạng thái đang tải
  if (isLoading) {
    return (
       <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
            <Spinner size="large" />
       </div>
    );
  }

  // 2. Kiểm tra đã đăng nhập chưa (Luôn cần thiết)
  if (!isAuthenticated) {
    console.log('ProtectedRoute: Chưa đăng nhập, chuyển đến /login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. Chỉ kiểm tra vai trò *nếu* requiredRole được cung cấp
  if (requiredRole) {
    const rolesToCheck = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    if (!user || !user.role || !rolesToCheck.includes(user.role.toLowerCase())) {
      console.log(`ProtectedRoute: Không đủ quyền. Yêu cầu: ${requiredRole}, User có: ${user?.role}`);
      return <Navigate to="/unauthorized" replace />;
    }
     console.log(`ProtectedRoute: Đủ quyền (vai trò ${requiredRole})`);
  } else {
     // Nếu không yêu cầu vai trò cụ thể, chỉ cần đăng nhập là đủ
     console.log('ProtectedRoute: Đủ quyền (chỉ yêu cầu đăng nhập)');
  }


  // 4. Đã đăng nhập (và đủ quyền nếu có yêu cầu vai trò) -> Render component con
  return children;
};

export default ProtectedRoute;