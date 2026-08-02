import { Link, useLocation, useNavigate } from 'react-router'
import { useAuth } from '../contexts/useAuth'
import { BorderButton } from './Buttons'
import { LogOut, ShoppingBag } from 'lucide-react'

export default function NavBar() {
  const { isAuthenticated, userEmail, signOut } = useAuth()
    const navigate = useNavigate()

  

  return (
    <div className="service-grid flex flex-col sm:flex-row gap-4 py-4 justify-between items-center px-4 shadow-md border-b border-gray-800 mr-4 ml-4">
      <div className="brand">
        <span className="text-lg font-bold text-gray-200">
          AutoCare Club
          
          </span>
      </div>
     
      <div className="app-actions flex flex-row items-center justify-center">
        {isAuthenticated ? (
          <div className="flex flex-row items-center gap-2">

            
          
            <BorderButton onClick={() => navigate('/cart')} type="button">
              <ShoppingBag size={16}></ShoppingBag>
            </BorderButton>
            
            
            
            <BorderButton type="button" onClick={signOut}>

              <LogOut size={16}></LogOut>
            </BorderButton>
            <span className="text-gray-200 ">{userEmail}</span>
          </div>
        ) : (
          <Link to="/login" className="button-secondary">
            Iniciar sesión
          </Link>
        )}
      </div> 
    </div>
  )
}


export const NavButton = ({ to, children }: { to: string; children: React.ReactNode }) => {
  const location = useLocation();
  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }

    return location.pathname.startsWith(path);
  };
  return (
    <Link
      to={to}
      className={`px-3 py-2 rounded-md text-sm font-medium text-gray-200 ${!isActive(to) ? "hover:bg-gray-800" : ""}  ${isActive(to) ? "bg-gray-200 text-gray-900" : ""}`}
    >
      {children}
    </Link>
  )
}