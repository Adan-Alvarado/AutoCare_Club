import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import { loginUser } from '../services/api'
import type { LoginFormState } from '../types'

interface AuthContextValue {
  isAuthenticated: boolean
  userEmail: string
  signIn: (form: LoginFormState) => Promise<void>
  signOut: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

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

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }

  return context
}
