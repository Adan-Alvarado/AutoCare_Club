import { useState, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Clock3, ImageOff, Pencil, Plus, RefreshCw, Trash2 } from 'lucide-react'
import Loading from '../../components/Loading'
import EmptyState from '../../components/EmptyState'
import { FilledButton } from '../../components/Buttons'
import { ThemedPanel } from '../../components/Panel'
import {
  createService,
  deleteService,
  getServices,
  updateService,
  type ServiceItem,
} from '../../services/api'
import { queryKeys } from '../../services/queryKeys'
import { formatMoney } from '../cart/cart.utils'
import AdminSectionHeader from './components/AdminSectionHeader'

const emptyForm = {
  name: '',
  description: '',
  price: '',
  durationMinutes: '',
  imageUrl: '',
}

export default function AdminServicesPage() {
  const queryClient = useQueryClient()
  const [form, setForm] = useState(emptyForm)
  const [editingService, setEditingService] = useState<ServiceItem | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [error, setError] = useState('')
  const [feedback, setFeedback] = useState('')

  const servicesQuery = useQuery({ queryKey: queryKeys.services, queryFn: getServices })
  const saveMutation = useMutation({
    mutationFn: ({ service, payload }: { service: ServiceItem | null; payload: Parameters<typeof createService>[0] }) => (
      service
        ? updateService(service.id, { ...payload, isActive: service.isActive })
        : createService(payload)
    ),
  })
  const deleteMutation = useMutation({ mutationFn: (id: string) => deleteService(id) })
  const services = servicesQuery.data ?? []
  const submitting = saveMutation.isPending || deleteMutation.isPending

  function openCreate() {
    setEditingService(null)
    setForm(emptyForm)
    setFormOpen(true)
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
    setFormOpen(true)
  }

  function closeForm() {
    setEditingService(null)
    setForm(emptyForm)
    setFormOpen(false)
  }

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setFeedback('')

    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        price: Number(form.price),
        durationMinutes: Number(form.durationMinutes),
        imageUrl: form.imageUrl.trim() || null,
      }

      await saveMutation.mutateAsync({ service: editingService, payload })
      await queryClient.invalidateQueries({ queryKey: queryKeys.services })
      setFeedback(editingService ? 'Servicio actualizado correctamente.' : 'Servicio creado correctamente.')
      closeForm()
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'No se pudo guardar el servicio.')
    }
  }

  async function handleDelete(service: ServiceItem) {
    if (!window.confirm(`¿Eliminar el servicio ${service.name}?`)) return

    setError('')
    setFeedback('')
    try {
      await deleteMutation.mutateAsync(service.id)
      await queryClient.invalidateQueries({ queryKey: queryKeys.services })
      setFeedback('Servicio eliminado correctamente.')
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'No se pudo eliminar el servicio.')
    }
  }

  return (
    <section className="admin-section admin-section--services" aria-labelledby="admin-services-title">
      <AdminSectionHeader
        id="admin-services-title"
        title="Servicios"
        description="Administra el catálogo que los clientes pueden agregar a sus reservas."
        action={(
          <div className="admin-section__actions">
            <button
              type="button"
              className="admin-icon-button"
              onClick={() => void servicesQuery.refetch()}
              disabled={servicesQuery.isFetching}
              aria-label="Actualizar servicios"
              title="Actualizar servicios"
            >
              <RefreshCw size={17} aria-hidden="true" />
            </button>
            <FilledButton type="button" onClick={openCreate} className="admin-action">
              <span className="admin-button-content">
                <Plus size={17} aria-hidden="true" />
                Nuevo servicio
              </span>
            </FilledButton>
          </div>
        )}
      />

      {feedback ? <p className="admin-feedback" role="status">{feedback}</p> : null}
      {error || servicesQuery.error ? (
        <p className="admin-error" role="alert">
          {error || (servicesQuery.error instanceof Error ? servicesQuery.error.message : 'No se pudieron cargar los servicios.')}
        </p>
      ) : null}

      {servicesQuery.isLoading ? (
        <Loading />
      ) : services.length === 0 ? (
        <EmptyState message="No hay servicios registrados." />
      ) : (
        <div className="admin-list admin-service-list">
          {services.map((service) => (
            <ThemedPanel key={service.id} className="admin-record admin-service-record">
              <div className="admin-service-record__layout">
                <div className="admin-service-record__image">
                  {service.imageUrl ? (
                    <img src={service.imageUrl} alt="" />
                  ) : (
                    <ImageOff size={20} aria-hidden="true" />
                  )}
                </div>

                <div className="admin-record__identity">
                  <h3>{service.name}</h3>
                  <p>{service.description}</p>
                </div>

                <div className="admin-service-record__details">
                  <span className="admin-record__meta">
                    <Clock3 size={16} aria-hidden="true" />
                    {service.durationMinutes} min
                  </span>
                  <strong>{formatMoney(service.price)}</strong>
                </div>

                <div className="admin-icon-actions">
                  <button
                    type="button"
                    className="admin-icon-button"
                    onClick={() => openEdit(service)}
                    aria-label={`Editar ${service.name}`}
                    title={`Editar ${service.name}`}
                  >
                    <Pencil size={17} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    className="admin-icon-button admin-icon-button--danger"
                    onClick={() => void handleDelete(service)}
                    disabled={submitting}
                    aria-label={`Eliminar ${service.name}`}
                    title={`Eliminar ${service.name}`}
                  >
                    <Trash2 size={17} aria-hidden="true" />
                  </button>
                </div>
              </div>
            </ThemedPanel>
          ))}
        </div>
      )}

      {formOpen ? (
        <div className="admin-modal" role="dialog" aria-modal="true" aria-labelledby="admin-service-form-title">
          <form className="admin-modal__form" onSubmit={handleSave}>
            <h3 id="admin-service-form-title">{editingService ? 'Editar servicio' : 'Nuevo servicio'}</h3>

            <div className="admin-modal__grid">
              <label className="admin-field">
                Nombre
                <input
                  value={form.name}
                  onChange={(event) => setForm({ ...form, name: event.target.value })}
                  required
                />
              </label>
              <label className="admin-field">
                Precio
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={(event) => setForm({ ...form, price: event.target.value })}
                  required
                />
              </label>
              <label className="admin-field admin-field--wide">
                Descripción
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(event) => setForm({ ...form, description: event.target.value })}
                  required
                />
              </label>
              <label className="admin-field">
                Duración (minutos)
                <input
                  type="number"
                  min="10"
                  step="1"
                  value={form.durationMinutes}
                  onChange={(event) => setForm({ ...form, durationMinutes: event.target.value })}
                  required
                />
              </label>
              <label className="admin-field">
                URL de imagen
                <input
                  type="url"
                  value={form.imageUrl}
                  onChange={(event) => setForm({ ...form, imageUrl: event.target.value })}
                />
              </label>
            </div>

            <div className="admin-modal__actions">
              <button type="button" className="admin-text-button" onClick={closeForm}>Cancelar</button>
              <FilledButton type="submit" disabled={submitting} className="admin-action">
                {submitting ? 'Guardando...' : 'Guardar servicio'}
              </FilledButton>
            </div>
          </form>
        </div>
      ) : null}
    </section>
  )
}
