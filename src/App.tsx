import { BrowserRouter, Route, Routes } from 'react-router'
import { AuthProvider } from './contexts/AuthContext'
import './App.css'
import LoginPage from './features/auth/LoginPage'


function App() {
  return (
    <div className="text-white bg-black h-full w-full">
    <BrowserRouter>
      <AuthProvider>
        <Routes >
          <Route path="/login" element={<LoginPage />} />
          
        </Routes>
      </AuthProvider>
    </BrowserRouter></div>
  )
}

export default App
