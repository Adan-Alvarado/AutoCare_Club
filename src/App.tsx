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
                    <Route path="cart" element={<CartPage />} />
                    <Route path="" element={<Navigate to="services" replace />} />
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
