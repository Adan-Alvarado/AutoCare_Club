import { useState, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../../contexts/useAuth'
import { addCartItem, createService, deleteService, getCart, getServices, updateService } from '../../services/api'
import Loading from '../../components/Loading'
import EmptyState from '../../components/EmptyState'
import type { ServiceItem } from '../../services/api'
import { FilledButton } from '../../components/Buttons'
import { ThemedPanel } from '../../components/Panel'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { queryKeys } from '../../services/queryKeys'
import { formatMoney } from '../cart/cart.utils'

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
  const [error, setError] = useState('')
  const [feedback, setFeedback] = useState('')
  const [form, setForm] = useState(initialServiceForm)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingService, setEditingService] = useState<ServiceItem | null>(null)
  const queryClient = useQueryClient()
  const servicesQuery = useQuery({ queryKey: queryKeys.services, queryFn: getServices })
  const saveServiceMutation = useMutation({
    mutationFn: ({ service, payload }: { service: ServiceItem | null; payload: Parameters<typeof createService>[0] }) => (
      service
        ? updateService(service.id, { ...payload, isActive: service.isActive })
        : createService(payload)
    ),
  })
  const deleteServiceMutation = useMutation({ mutationFn: (id: string) => deleteService(id) })
  const addCartMutation = useMutation({
    mutationFn: async (service: ServiceItem) => {
      const currentCart = await getCart()
      if (currentCart?.items.length) {
        throw new Error('Para esta versión solo puedes reservar un servicio por cita. Vacía el carrito antes de elegir otro.')
      }
      return addCartItem(service.id)
    },
  })
  const services = servicesQuery.data ?? []
  const loading = servicesQuery.isLoading
  const submitting = saveServiceMutation.isPending || deleteServiceMutation.isPending
  const addingServiceId = addCartMutation.isPending ? addCartMutation.variables?.id ?? null : null

  async function handleSaveService(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
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

      await saveServiceMutation.mutateAsync({ service: editingService, payload })
      await queryClient.invalidateQueries({ queryKey: queryKeys.services })
      setForm(initialServiceForm)
      setIsCreateOpen(false)
      setEditingService(null)
      setFeedback(editingService ? 'Servicio actualizado correctamente.' : 'Servicio creado correctamente.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo crear el servicio')
    }
  }

  function openCreate() {
    setEditingService(null)
    setForm(initialServiceForm)
    setIsCreateOpen(true)
  }

  function openEdit(service: ServiceItem) {
    setEditingService(service)
    setForm({
      name: service.name,
      description: service.description,
      price: String(service.price),
      durationMinutes: String(service.durationMinutes),
      imageUrl: service.imageUrl ?? '',
    })
    setIsCreateOpen(true)
  }

  function closeForm() {
    setIsCreateOpen(false)
    setEditingService(null)
    setForm(initialServiceForm)
  }

  async function handleDelete(service: ServiceItem) {
    if (!window.confirm(`¿Eliminar el servicio ${service.name}?`)) return
    setError('')
    try {
      await deleteServiceMutation.mutateAsync(service.id)
      setFeedback('Servicio eliminado correctamente.')
      await queryClient.invalidateQueries({ queryKey: queryKeys.services })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo eliminar el servicio')
    }
  }

  async function addServiceToCart(service: ServiceItem) {
    setError('')
    setFeedback('')

    try {
      await addCartMutation.mutateAsync(service)
      await queryClient.invalidateQueries({ queryKey: queryKeys.cart })
      setFeedback(`${service.name} agregado al carrito.`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo agregar el servicio')
    }
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
            <FilledButton onClick={openCreate}>
              Crear servicio
            </FilledButton>
          ) : null}
          <FilledButton onClick={() => void servicesQuery.refetch()} disabled={servicesQuery.isFetching}>
            Actualizar
          </FilledButton>
        </div>
      </div>

      {isCreateOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-gray-800 bg-gray-950 p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-gray-200">{editingService ? 'Editar servicio' : 'Crear servicio'}</h2>
                <p className="text-sm text-gray-400">Completa los datos del servicio que aparecerá en el catálogo.</p>
              </div>
              <button
                type="button"
                onClick={closeForm}
                className="rounded-lg border border-gray-700 px-3 py-2 text-sm text-gray-300"
              >
                Cerrar
              </button>
            </div>

            <form onSubmit={handleSaveService} className="flex flex-col gap-3">
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
                  onClick={closeForm}
                  className="rounded-xl border border-gray-700 px-4 py-2 text-sm text-gray-300"
                >
                  Cancelar
                </button>
                <FilledButton type="submit" disabled={submitting}>
                  {submitting ? 'Guardando...' : editingService ? 'Guardar cambios' : 'Crear servicio'}
                </FilledButton>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {feedback ? (
        <p className="text-sm text-emerald-300 mb-4" role="status">{feedback}</p>
      ) : null}

      {loading ? (
        <Loading />
      ) : error || servicesQuery.error ? (
        <p className="error">{error || (servicesQuery.error instanceof Error ? servicesQuery.error.message : 'No se pudieron cargar los servicios')}</p>
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
                <span className="text-lg font-bold text-green-200">{formatMoney(service.price)}</span>
                {isAdmin ? (
                  <div className="flex gap-2">
                    <button type="button" onClick={() => openEdit(service)} className="rounded-xl border border-gray-700 p-3 text-gray-200 hover:bg-gray-800" aria-label={`Editar ${service.name}`}>
                      <Pencil size={16} />
                    </button>
                    <button type="button" onClick={() => void handleDelete(service)} disabled={submitting} className="rounded-xl border border-red-900 p-3 text-red-300 hover:bg-red-950" aria-label={`Eliminar ${service.name}`}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                ) : (
                  <FilledButton
                    onClick={() => void addServiceToCart(service)}
                    disabled={addingServiceId === service.id}
                  >
                    <span className="flex flex-row items-center gap-1">
                    <Plus size={16}></Plus>
                    {addingServiceId === service.id ? 'Agregando...' : 'Reservar'}
                    </span></FilledButton>
                )}
              </div>
              </ThemedPanel>
            </article>
          ))}
        </div>
      )}
    </main>
  )
}
