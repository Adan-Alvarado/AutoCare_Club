import { Link, useLocation } from "react-router";
import { useAuth } from '../contexts/useAuth'

export const RoutesBar = () => {
  const { role } = useAuth()

  if (role === 'Technician') {
    return (
      <nav className="flex items-center justify-center" aria-label="Navegación del técnico">
        <NavButton to="/technician/appointments">Citas</NavButton>
      </nav>
    )
  }

  if (role === 'Admin') {
    return (
      <nav className="flex items-center justify-center" aria-label="Navegación de administración">
        <NavButton to="/admin">Administración</NavButton>
      </nav>
    )
  }

  return (
    <nav className="flex flex-row items-center justify-around gap-4 md:justify-center" aria-label="Navegación principal">
      <NavButton to="/services">Servicios</NavButton>
      {role === 'Customer' ? <NavButton to="/vehicles">Vehículos</NavButton> : null}
      {role === 'Customer' ? <NavButton to="/appointments">Mis citas</NavButton> : null}
    </nav>
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
      className={`whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium text-gray-200 active:translate-y-px ${!isActive(to) ? "hover:bg-gray-800" : ""} ${isActive(to) ? "bg-gray-200 text-gray-900" : ""}`}
    >
      {children}
    </Link>
  )
}
