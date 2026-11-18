import { Navigate, Outlet } from 'react-router-dom';

export default function ProtectedRoute() {
  if (!localStorage.getItem('token')) return <Navigate to="/login" replace />;
  return <Outlet />;
}
