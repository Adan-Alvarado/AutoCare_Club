import type { ReactNode } from 'react'
import NavBar from '../components/NavBar'
import { RoutesBar } from '../components/Routes'

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="app-shell">
      <NavBar />
      
      <div className="app-content">{children}</div>
      <div className="app-footer md:hidden fixed bottom-0 w-full py-6 bg-black px-4 border-t justify-center items-center border-gray-800">
        <RoutesBar></RoutesBar>
      </div>
    </div>
  )
}
