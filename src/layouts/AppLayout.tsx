import type { ReactNode } from 'react'
import NavBar from '../components/NavBar'

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="app-shell">
      <NavBar />
      
      <div className="app-content">{children}</div>
      
    </div>
  )
}
