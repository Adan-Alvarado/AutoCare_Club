import { useEffect, useState, type FormEvent } from 'react'
import { useAuth } from '../../contexts/useAuth'
import { createService, getServices } from '../../services/api'
import Loading from '../../components/Loading'
import EmptyState from '../../components/EmptyState'
import type { ServiceItem } from '../../services/api'
import { FilledButton } from '../../components/Buttons'
import { ThemedPanel } from '../../components/Panel'
import { Plus } from 'lucide-react'

function getCartStorageKey(userEmail?: string | null) {
  return userEmail ? `autocare_cart_services_${userEmail}` : 'autocare_cart_services_guest'
}

const initialServiceForm = {
  name: '',
  description: '',
  price: '',
  durationMinutes: '',
  imageUrl: '',
}

export default function ServicesPage() {
  const { role } = useAuth()
  const isAdmin = role === 'Admin'
  const [services, setServices] = useState<ServiceItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [feedback, setFeedback] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState(initialServiceForm)
  const [isCreateOpen, setIsCreateOpen] = useState(false)

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

  async function handleCreateService(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)
    setError('')
    setFeedback('')

    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        price: Number(form.price),
        durationMinutes: Number(form.durationMinutes),
        imageUrl: form.imageUrl.trim() ? form.imageUrl.trim() : null,
      }

      await createService(payload)
      setForm(initialServiceForm)
      setIsCreateOpen(false)
      setFeedback('Servicio creado correctamente.')
      await loadServices()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo crear el servicio')
    } finally {
      setSubmitting(false)
    }
  }

  function addServiceToCart(service: ServiceItem) {
    if (typeof window === 'undefined') return

    const userEmail = window.localStorage.getItem('auth_email') ?? ''
    const cartStorageKey = getCartStorageKey(userEmail)
    const stored = window.localStorage.getItem(cartStorageKey)
    let currentServices: ServiceItem[] = []

    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        currentServices = Array.isArray(parsed) ? parsed : []
      } catch {
        currentServices = []
      }
    }

    // const alreadyAdded = currentServices.some((item) => item.id === service.id)
    console.log(service.id, currentServices.map((item) => item.id))
    const nextServices = [...currentServices, service]

    window.localStorage.setItem(cartStorageKey, JSON.stringify(nextServices))
    setFeedback(`${service.name} agregado al carrito.`)
  }

  return (
    <main className="content-page m-8">
      <div className="page-header">
        <div>
          <p className="eyebrow">Catálogo</p>
          <h1 className="text-4xl font-bold text-gray-200 mb-4">Servicios disponibles</h1>
        </div>
        <div className="flex gap-2">
          {isAdmin ? (
            <FilledButton onClick={() => setIsCreateOpen(true)}>
              Crear servicio
            </FilledButton>
          ) : null}
          <FilledButton onClick={() => void loadServices()} disabled={loading}>
            Actualizar
          </FilledButton>
        </div>
      </div>

      {isCreateOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-gray-800 bg-gray-950 p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-gray-200">Crear servicio</h2>
                <p className="text-sm text-gray-400">Completa los datos para agregar un nuevo servicio al catálogo.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="rounded-lg border border-gray-700 px-3 py-2 text-sm text-gray-300"
              >
                Cerrar
              </button>
            </div>

            <form onSubmit={handleCreateService} className="flex flex-col gap-3">
              <div className="grid gap-3 md:grid-cols-2">
                <label className="flex flex-col gap-1 text-sm text-gray-300">
                  Nombre
                  <input
                    className="rounded-xl border border-gray-700 bg-black px-3 py-2 text-gray-100"
                    value={form.name}
                    onChange={(event) => setForm({ ...form, name: event.target.value })}
                    required
                  />
                </label>

                <label className="flex flex-col gap-1 text-sm text-gray-300">
                  Precio
                  <input
                    className="rounded-xl border border-gray-700 bg-black px-3 py-2 text-gray-100"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.price}
                    onChange={(event) => setForm({ ...form, price: event.target.value })}
                    required
                  />
                </label>

                <label className="flex flex-col gap-1 text-sm text-gray-300 md:col-span-2">
                  Descripción
                  <textarea
                    className="rounded-xl border border-gray-700 bg-black px-3 py-2 text-gray-100"
                    rows={3}
                    value={form.description}
                    onChange={(event) => setForm({ ...form, description: event.target.value })}
                    required
                  />
                </label>

                <label className="flex flex-col gap-1 text-sm text-gray-300">
                  Duración (minutos)
                  <input
                    className="rounded-xl border border-gray-700 bg-black px-3 py-2 text-gray-100"
                    type="number"
                    min="10"
                    step="1"
                    value={form.durationMinutes}
                    onChange={(event) => setForm({ ...form, durationMinutes: event.target.value })}
                    required
                  />
                </label>

                <label className="flex flex-col gap-1 text-sm text-gray-300">
                  URL de imagen
                  <input
                    className="rounded-xl border border-gray-700 bg-black px-3 py-2 text-gray-100"
                    type="url"
                    value={form.imageUrl}
                    onChange={(event) => setForm({ ...form, imageUrl: event.target.value })}
                  />
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="rounded-xl border border-gray-700 px-4 py-2 text-sm text-gray-300"
                >
                  Cancelar
                </button>
                <FilledButton type="submit" disabled={submitting}>
                  {submitting ? 'Guardando...' : 'Crear servicio'}
                </FilledButton>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {feedback ? (
        <p className="text-sm text-emerald-300 mb-4">{feedback}</p>
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
                <FilledButton onClick={() => addServiceToCart(service)}>
                  <span className="flex flex-row items-center gap-1">
                  <Plus size={16}></Plus>
                  Reservar
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
