import { useMemo, useState, type ReactNode } from 'react'
import { AuthContext } from './useAuth'
import { loginUser, registerUser } from '../services/api'
import type { LoginFormState, RegisterFormState, UserRole } from '../types'

function decodeUserRole(token: string | null): UserRole | null {
  if (!token) return null

  try {
    const payload = token.split('.')[1]
    if (!payload) return null

    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')))
    const rawRoles = decoded.role ?? decoded.roles ?? decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ?? decoded['role']

    if (Array.isArray(rawRoles)) {
      const firstRole = rawRoles.find((role): role is string => typeof role === 'string')
      return firstRole ? (firstRole.toLowerCase() === 'admin' ? 'Admin' : firstRole.toLowerCase() === 'technician' ? 'Technician' : 'Customer') : null
    }

    if (typeof rawRoles === 'string') {
      const normalizedRole = rawRoles.toLowerCase()
      if (normalizedRole.includes('admin')) return 'Admin'
      if (normalizedRole.includes('technician')) return 'Technician'
      return 'Customer'
    }

    return null
  } catch {
    return null
  }
}


export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => Boolean(localStorage.getItem('auth_token')))
  const [userEmail, setUserEmail] = useState(() => localStorage.getItem('auth_email') ?? '')
  const [role, setRole] = useState<UserRole | null>(() => decodeUserRole(localStorage.getItem('auth_token')))

  const value = useMemo(
    () => ({
      isAuthenticated,
      userEmail,
      role,
      async signIn(form: LoginFormState) {
        const data = await loginUser(form.email, form.password)
        localStorage.setItem('auth_token', data.token)
        localStorage.setItem('auth_email', data.email)
        setUserEmail(data.email)
        setRole(decodeUserRole(data.token))
        setIsAuthenticated(true)
      },
      async signUp(form: RegisterFormState) {
        await registerUser(form.firstName, form.lastName, form.email, form.password, form.confirmPassword)
        const authData = await loginUser(form.email, form.password)

        localStorage.setItem('auth_token', authData.token)
        localStorage.setItem('auth_email', authData.email)
        setUserEmail(authData.email)
        setRole(decodeUserRole(authData.token))
        setIsAuthenticated(true)
      },
      signOut() {
        localStorage.removeItem('auth_token')
        localStorage.removeItem('auth_email')
        setUserEmail('')
        setRole(null)
        setIsAuthenticated(false)
      },
    }),
    [isAuthenticated, userEmail, role],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

