import { useMemo, useState, type ReactNode } from 'react'
import { AuthContext } from './useAuth'
import { loginUser } from '../services/api'
import type { LoginFormState } from '../types'


export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => Boolean(localStorage.getItem('auth_token')))
  const [userEmail, setUserEmail] = useState(() => localStorage.getItem('auth_email') ?? '')

  const value = useMemo(
    () => ({
      isAuthenticated,
      userEmail,
      async signIn(form: LoginFormState) {
        const data = await loginUser(form.email, form.password)
        localStorage.setItem('auth_token', data.token)
        localStorage.setItem('auth_email', data.email)
        setUserEmail(data.email)
        setIsAuthenticated(true)
      },
      signOut() {
        localStorage.removeItem('auth_token')
        localStorage.removeItem('auth_email')
        setUserEmail('')
        setIsAuthenticated(false)
      },
    }),
    [isAuthenticated, userEmail],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

