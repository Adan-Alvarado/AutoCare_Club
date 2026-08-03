import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import type { ServiceItem } from '../../services/api'
import { BorderButton, FilledButton } from '../../components/Buttons'
import { ThemedPanel } from '../../components/Panel'
import { Trash } from 'lucide-react'

function getCartStorageKey(userEmail?: string | null) {
  return userEmail ? `autocare_cart_services_${userEmail}` : 'autocare_cart_services_guest'
}

export default function CartPage() {
  const navigate = useNavigate()
  const [services, setServices] = useState<ServiceItem[]>([])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const executePromise = async () => {
    const userEmail = window.localStorage.getItem('auth_email') ?? ''
    const cartStorageKey = getCartStorageKey(userEmail)
    const stored = window.localStorage.getItem(cartStorageKey)
    if (!stored) {
    setServices([])
      return
    }

    try {
      const parsed = JSON.parse(stored)
      setServices(Array.isArray(parsed) ? parsed : [])
    } catch {
      setServices([])
    }}
    executePromise()
  }, [])

  function clearCart() {
    const userEmail = window.localStorage.getItem('auth_email') ?? ''
    const cartStorageKey = getCartStorageKey(userEmail)
    window.localStorage.removeItem(cartStorageKey)
    setServices([])
  }

  function removeServiceFromCart(index: number) {
    if (typeof window === 'undefined') return

    const userEmail = window.localStorage.getItem('auth_email') ?? ''
    const cartStorageKey = getCartStorageKey(userEmail)
    const stored = window.localStorage.getItem(cartStorageKey)
    if (!stored) {
      setServices([])
      return
    }

    try {
      const parsed = JSON.parse(stored)
      const currentServices: ServiceItem[] = Array.isArray(parsed) ? parsed : []
      const nextServices = currentServices.filter((_, itemIndex) => itemIndex !== index)
      window.localStorage.setItem(cartStorageKey, JSON.stringify(nextServices))
      setServices(nextServices)
    } catch {
      setServices([])
    }
  }

  return (
    <main className="content-page m-8">
      <div className="page-header">
        <div>
          <p className="eyebrow">Reserva</p>
          <h1 className="text-4xl font-bold text-gray-200 mb-4">Carrito</h1>
        </div>
        <div className="flex justify-between items-center">
            <div className="flex gap-2">
                <FilledButton onClick={() => navigate('/services')}>Regresa a los servicios</FilledButton>
                <BorderButton onClick={clearCart} >
                    Vaciar carrito
                </BorderButton>
            </div>
            <div className="flex flex-row gap-4 p-1 items-center justify-center border border-gray-800 rounded-2xl">
                <span className="text-gray-200 mx-5">Total: ${services.reduce((total, service) => total + service.price, 0).toFixed(2)}</span>
                <span className="h-4 w-px bg-gray-800"></span>
                <FilledButton >
                    Proceder al pago
                </FilledButton>
            </div>
          
          

        </div>
      </div>

      {services.length === 0 ? (
        <ThemedPanel className="mt-4 flex flex-col gap-2 w-full items-center justify-center">
          <p className="text-gray-300 font-bold text-2xl">Tu carrito está vacío.</p>
        </ThemedPanel>
      ) : (
        <div className="service-grid grid gap-4 mt-4 grid-cols-[repeat(auto-fill,minmax(260px,1fr))]">
          {services.map((service, index) => (
            <article key={`${service.id}-${index}`} className="service-card mb-4">
              <ThemedPanel className="flex flex-col gap-2 w-full">
                <h2 className="text-xl font-bold text-gray-200">{service.name}</h2>
                <p className="text-gray-300">{service.description}</p>
                <div className="flex justify-between items-center mt-4">
                  <span className="text-gray-400">{service.durationMinutes} min</span>
                  <span className="text-lg font-bold text-green-200">${service.price.toFixed(2)}</span>
                </div>
                <BorderButton onClick={() => removeServiceFromCart(index)} className="mt-2 gap-2  w-full">
                    <Trash size={16}></Trash>
                  Eliminar
                </BorderButton>
              </ThemedPanel>
            </article>
          ))}
        </div>
      )}
    </main>
  )
}
