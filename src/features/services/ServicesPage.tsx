import { useEffect, useState } from 'react'
import { addCartItem, getServices } from '../../services/api'
import Loading from '../../components/Loading'
import EmptyState from '../../components/EmptyState'
import type { ServiceItem } from '../../services/api'
import { FilledButton } from '../../components/Buttons'
import { ThemedPanel } from '../../components/Panel'
import { Plus } from 'lucide-react'

export default function ServicesPage() {
  const [services, setServices] = useState<ServiceItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [feedback, setFeedback] = useState('')
  const [addingServiceId, setAddingServiceId] = useState<string | null>(null)

  useEffect(() => {
    void loadServices()
  }, [])

  async function loadServices() {
    setLoading(true)
    setError('')

    try {
      const data = await getServices()
      setServices(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron cargar los servicios')
    } finally {
      setLoading(false)
    }
  }

  async function addServiceToCart(service: ServiceItem) {
    setAddingServiceId(service.id)
    setFeedback('')

    try {
      await addCartItem(service.id)
      setFeedback(`${service.name} agregado al carrito.`)
    } catch (err) {
      setFeedback(err instanceof Error ? err.message : 'No se pudo agregar el servicio')
    } finally {
      setAddingServiceId(null)
    }
  }

  return (
    <main className="content-page m-8">
      <div className="page-header">
        <div>
          <p className="eyebrow">Catálogo</p>
          <h1 className="text-4xl font-bold text-gray-200 mb-4">Servicios disponibles</h1>
        </div>
        <FilledButton onClick={() => void loadServices()} disabled={loading}>
          Actualizar
        </FilledButton>
      </div>

      {feedback ? (
        <p className="text-sm text-emerald-300 mb-4" role="status">{feedback}</p>
      ) : null}

      {loading ? (
        <Loading />
      ) : error ? (
        <p className="error">{error}</p>
      ) : services.length === 0 ? (
        <EmptyState message="No hay servicios disponibles." />
      ) : (
        <div className="service-grid grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-4 mt-4">
          {services.map((service) => (
            <article key={service.id} className="service-card mb-4">
              <ThemedPanel>
             
              <h2 className="text-xl font-bold text-gray-200">{service.name}</h2>
              <p className="text-gray-300">{service.description}</p>
              <span className="text-gray-400">{service.durationMinutes} min</span>
              <div className='h-10'></div>
              <div className="service-meta flex flex-row justify-between items-center mt-2 gap-10">
                <span className="text-lg font-bold text-green-200">${service.price.toFixed(2)}</span>
                <FilledButton
                  onClick={() => void addServiceToCart(service)}
                  disabled={addingServiceId === service.id}
                >
                  <span className="flex flex-row items-center gap-1">
                  <Plus size={16}></Plus>
                  {addingServiceId === service.id ? 'Agregando...' : 'Reservar'}
                  </span></FilledButton>
              </div>
              </ThemedPanel>
            </article>
          ))}
        </div>
      )}
    </main>
  )
}
