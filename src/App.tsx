import { BrowserRouter, Navigate, Route, Routes } from 'react-router'
import { AuthProvider } from './contexts/AuthContext'
import AppLayout from './layouts/AppLayout'
import ProtectedRoute from './components/ProtectedRoute'
import './App.css'
import LoginPage from './features/auth/LoginPage'
import RegisterPage from './features/auth/RegisterPage'
import ServicesPage from './features/services/ServicesPage'
import VehiclesPage from './features/vehicles/VehiclesPage'
import CartPage from './features/cart/CartPage'
import AdminDashboardPage from './features/admin/AdminDashboardPage'
import TechnicianAppointmentsPage from './features/technician/TechnicianAppointmentsPage'
import CustomerAppointmentsPage from './features/appointments/CustomerAppointmentsPage'
import NotFoundPage from './features/not-found/NotFoundPage'
import { useAuth } from './contexts/useAuth'

function RoleHomeRedirect() {
  const { role } = useAuth()
  const destination = role === 'Admin'
    ? '/admin'
    : role === 'Technician'
      ? '/technician/appointments'
      : '/services'

  return <Navigate to={destination} replace />
}

function App() {
  return (
    <div className="text-white bg-black h-full w-full">
    <BrowserRouter>
      <AuthProvider>
        <Routes >
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Routes>
                    <Route path="services" element={<ServicesPage />} />
                    <Route path="vehicles" element={<VehiclesPage />} />
                    <Route path="appointments" element={<CustomerAppointmentsPage />} />
                    <Route path="cart/*" element={<CartPage />} />
                    <Route path="admin" element={<AdminDashboardPage />} />
                    <Route path="admin/appointments" element={<Navigate to="/admin" replace />} />
                    <Route path="admin/users" element={<Navigate to="/admin" replace />} />
                    <Route path="admin/roles" element={<Navigate to="/admin" replace />} />
                    <Route path="admin/schedules" element={<Navigate to="/admin" replace />} />
                    <Route path="technician/appointments" element={<TechnicianAppointmentsPage />} />
                    <Route path="" element={<RoleHomeRedirect />} />
                    <Route path="*" element={<NotFoundPage />} />
                  </Routes>
                </AppLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter></div>
  )
}

export default App
