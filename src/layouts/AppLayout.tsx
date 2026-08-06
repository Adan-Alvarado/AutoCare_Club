import type { ReactNode } from 'react'
import NavBar from '../components/NavBar'
import { RoutesBar } from '../components/Routes'

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#040607]">
      <NavBar />

      <div className="mx-auto flex w-full max-w-7xl flex-col px-3 py-4 sm:px-6 lg:px-8">
        {children}
      </div>

      <div className="app-footer fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-black/90 px-4 py-4 backdrop-blur md:hidden">
        <RoutesBar />
      </div>
    </div>
  )
}
