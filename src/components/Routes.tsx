import { Link, useLocation } from "react-router";
import { useAuth } from '../contexts/useAuth'

export const RoutesBar = () => {
  const { role } = useAuth()
  const isAdmin = role === 'Admin'
  const isTechnician = role === 'Technician'

  return (
    <div className="space-x-4 flex flex-row items-center justify-around md:justify-center gap-4">
      <NavButton to="/services">Servicios</NavButton>
      {(isAdmin || isTechnician) ? <NavButton to="/vehicles">Vehículos</NavButton> : null}
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