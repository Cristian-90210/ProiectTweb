import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

// Layout
import { MainLayout } from './layout/MainLayout';

// Pages
import { Landing } from './pages/Landing';
import { Courses } from './pages/Courses';
import { Coaches } from './pages/Coaches';
import { Students } from './pages/Students';
import { StudentDashboard } from './pages/StudentDashboard';
import { CoachDashboard } from './pages/CoachDashboard';
import { AdminProfile } from './pages/AdminProfile';
import { UsersManagement } from './pages/admin/Users';
import { Reservations } from './pages/admin/Reservations';
import { Announcements } from './pages/admin/Announcements';
import { Login } from './pages/Login';
import { CartPage } from './pages/Cart';
import { Checkout } from './pages/Checkout';
import { NotFound } from './pages/NotFound';
import { Unauthorized } from './pages/Unauthorized';
import { Forbidden } from './pages/Forbidden';
import { InternalServerError } from './pages/InternalServerError';
import { ServerStatus } from './pages/ServerStatus';

// Protected Route Wrapper
const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles?: string[] }> = ({ children, allowedRoles }) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/403" replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <ThemeProvider>
      <CartProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/404" element={<NotFound />} />
              <Route path="/401" element={<Unauthorized />} />
              <Route path="/403" element={<Forbidden />} />
              <Route path="/500" element={<InternalServerError />} />

              {/* Public Landing Page */}
              <Route path="/" element={<MainLayout />}>
                <Route index element={<Landing />} />

                <Route path="student" element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <StudentDashboard />
                  </ProtectedRoute>
                } />
                <Route path="coach" element={
                  <ProtectedRoute allowedRoles={['coach']}>
                    <CoachDashboard />
                  </ProtectedRoute>
                } />
                <Route path="admin" element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminProfile />
                  </ProtectedRoute>
                } />

                {/* Admin Management Routes */}
                <Route path="admin/users" element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <UsersManagement />
                  </ProtectedRoute>
                } />
                <Route path="admin/reservations" element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <Reservations />
                  </ProtectedRoute>
                } />
                <Route path="admin/announcements" element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <Announcements />
                  </ProtectedRoute>
                } />

                <Route path="courses" element={<Courses />} />
                <Route path="server-status" element={<ServerStatus />} />
                <Route path="coaches" element={<Coaches />} />
                <Route path="cart" element={<CartPage />} />
                <Route path="checkout" element={<Checkout />} />

                {/* Admin Only Routes */}
                <Route path="students" element={
                  <ProtectedRoute allowedRoles={['admin', 'coach']}>
                    <Students />
                  </ProtectedRoute>
                } />
              </Route>

              <Route path="*" element={<Navigate to="/404" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </CartProvider>
    </ThemeProvider>
  );
}

export default App;
