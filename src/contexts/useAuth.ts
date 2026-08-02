import { createContext, useContext } from "react"
import type { LoginFormState } from "../types"

interface AuthContextValue {
  isAuthenticated: boolean
  userEmail: string
  signIn: (form: LoginFormState) => Promise<void>
  signOut: () => void
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }

  return context
}