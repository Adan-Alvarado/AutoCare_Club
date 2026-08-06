import { Link, useNavigate } from 'react-router'
import { useAuth } from '../contexts/useAuth'
import { BorderButton } from './Buttons'
import { LogOut, ShoppingBag } from 'lucide-react'
import { RoutesBar } from './Routes'

export default function NavBar() {
  const { isAuthenticated, userEmail, role, signOut } = useAuth()
  const navigate = useNavigate()
  const isAdmin = role === 'Admin'
  const isTechnician = role === 'Technician'
  const homePath = isTechnician ? '/technician/appointments' : isAdmin ? '/admin' : '/services'

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#040607]/90 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-3">
          <Link to={homePath} className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 p-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-300 text-sm font-semibold text-[#040607]">
              AC
            </div>
            <div>
              <p className="text-sm font-semibold text-white mr-2">AutoCare Club</p>
            </div>
          </Link>
        </div>

        <div className="hidden md:flex">
          <RoutesBar />
        </div>

        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <>
              {(isAdmin || isTechnician) ? null : (
                <BorderButton onClick={() => navigate('/cart')} type="button" className="!rounded-full">
                  <ShoppingBag size={16} />
                </BorderButton>
              )}

              <BorderButton type="button" onClick={signOut} className="!rounded-full">
                <LogOut size={16} />
              </BorderButton>

              <div className="hidden flex-col items-end sm:flex">
                <span className="text-sm font-medium text-white">{userEmail}</span>
                <span className="text-[11px] uppercase tracking-[0.24em] text-gray-400">{role ?? 'Sin Rol'}</span>
              </div>
            </>
          ) : (
            <Link to="/login" className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-gray-100 transition hover:bg-white/10">
              Iniciar sesión
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
