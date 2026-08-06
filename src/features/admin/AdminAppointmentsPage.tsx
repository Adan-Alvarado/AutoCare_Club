import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CalendarDays, Save } from 'lucide-react'
import Loading from '../../components/Loading'
import EmptyState from '../../components/EmptyState'
import { FilledButton } from '../../components/Buttons'
import { ThemedPanel } from '../../components/Panel'
import {
  getAppointments,
  getServices,
  getTechnicians,
  updateAppointment,
  type AppointmentDto,
  type AppointmentStatus,
  type TechnicianDto,
} from '../../services/api'
import { queryKeys } from '../../services/queryKeys'
import AdminSectionHeader from './components/AdminSectionHeader'

const statuses: AppointmentStatus[] = ['Pending', 'Confirmed', 'InProgress', 'Completed', 'Cancelled']
const statusLabels: Record<AppointmentStatus, string> = {
  Pending: 'Pendiente',
  Confirmed: 'Confirmada',
  InProgress: 'En proceso',
  Completed: 'Completada',
  Cancelled: 'Cancelada',
}

interface AppointmentDraft {
  status: AppointmentStatus
  technicianId: string
}

export default function AdminAppointmentsPage() {
  const [drafts, setDrafts] = useState<Record<string, AppointmentDraft>>({})
  const [error, setError] = useState('')
  const [feedback, setFeedback] = useState('')
  const queryClient = useQueryClient()
  const appointmentsQuery = useQuery({ queryKey: queryKeys.adminAppointments, queryFn: getAppointments })
  const servicesQuery = useQuery({ queryKey: queryKeys.services, queryFn: getServices })
  const techniciansQuery = useQuery({ queryKey: queryKeys.technicians, queryFn: getTechnicians })
  const saveMutation = useMutation({
    mutationFn: ({ appointment, draft }: { appointment: AppointmentDto; draft: AppointmentDraft }) => updateAppointment(appointment.id, {
      vehicleId: appointment.vehicleId,
      serviceId: appointment.serviceId,
      appointmentDate: appointment.appointmentDate,
      startTime: appointment.startTime,
      notes: appointment.notes ?? undefined,
      technicianId: draft.technicianId || null,
      status: draft.status,
    }),
  })
  const appointments = appointmentsQuery.data ?? []
  const technicians: TechnicianDto[] = techniciansQuery.data ?? []
  const loading = appointmentsQuery.isLoading || servicesQuery.isLoading || techniciansQuery.isLoading
  const savingId = saveMutation.isPending ? saveMutation.variables?.appointment.id ?? null : null

  const serviceNames = useMemo(
    () => new Map((servicesQuery.data ?? []).map((service) => [service.id, service.name])),
    [servicesQuery.data],
  )

  async function refreshData() {
    setError('')
    await Promise.all([appointmentsQuery.refetch(), servicesQuery.refetch(), techniciansQuery.refetch()])
  }

  function updateDraft(id: string, values: Partial<AppointmentDraft>) {
    setDrafts((current) => ({ ...current, [id]: { ...current[id], ...values } }))
  }

  async function saveAppointment(appointment: AppointmentDto) {
    const draft = drafts[appointment.id] ?? {
      status: appointment.status,
      technicianId: appointment.technicianId ?? '',
    }
    setError('')
    setFeedback('')
    try {
      await saveMutation.mutateAsync({ appointment, draft })
      await queryClient.invalidateQueries({ queryKey: queryKeys.adminAppointments })
      setDrafts((current) => {
        const next = { ...current }
        delete next[appointment.id]
        return next
      })
      setFeedback('Cita actualizada correctamente.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo actualizar la cita')
    }
  }

  return (
    <section className="admin-section admin-section--appointments" aria-labelledby="admin-appointments-title">
      <AdminSectionHeader
        id="admin-appointments-title"
        title="Citas"
        description="Asigna un técnico y actualiza el estado de cada servicio."
        action={<FilledButton className="admin-action" onClick={() => void refreshData()} disabled={appointmentsQuery.isFetching || servicesQuery.isFetching || techniciansQuery.isFetching}>Actualizar</FilledButton>}
      />

      {feedback ? <p className="admin-feedback" role="status">{feedback}</p> : null}
      {error || appointmentsQuery.error || servicesQuery.error || techniciansQuery.error ? <p className="admin-error" role="alert">{error || 'No se pudieron cargar los datos de las citas'}</p> : null}
      {loading ? <Loading /> : null}
      {!loading && appointments.length === 0 ? <EmptyState message="No hay citas registradas." /> : null}

      {!loading && appointments.length > 0 ? (
        <div className="admin-list">
          {appointments.map((appointment) => {
            const draft = drafts[appointment.id] ?? { status: appointment.status, technicianId: appointment.technicianId ?? '' }
            return (
              <ThemedPanel key={appointment.id} className="admin-record">
                <div className="admin-record__layout">
                  <div className="admin-record__identity">
                    <div className="admin-record__meta">
                      <CalendarDays size={17} />
                      <span>{appointment.appointmentDate} · {appointment.startTime.slice(0, 5)}</span>
                    </div>
                    <h3>{serviceNames.get(appointment.serviceId) ?? 'Servicio'}</h3>
                    <p>Cita {appointment.id.slice(0, 8)}</p>
                  </div>

                  {draft ? (
                    <div className="admin-record__controls">
                      <label className="admin-field">
                        Técnico
                        <select value={draft.technicianId} onChange={(event) => updateDraft(appointment.id, { technicianId: event.target.value })}>
                          <option value="">Sin asignar</option>
                          {technicians.map((technician) => (
                            <option key={technician.userId} value={technician.userId}>{technician.firstName} {technician.lastName}</option>
                          ))}
                        </select>
                      </label>
                      <label className="admin-field">
                        Estado
                        <select value={draft.status} onChange={(event) => updateDraft(appointment.id, { status: event.target.value as AppointmentStatus })}>
                          {statuses.map((status) => <option key={status} value={status}>{statusLabels[status]}</option>)}
                        </select>
                      </label>
                      <FilledButton className="admin-action" onClick={() => void saveAppointment(appointment)} disabled={savingId === appointment.id}>
                        <Save size={16} />
                        <span className="ml-2">{savingId === appointment.id ? 'Guardando...' : 'Guardar'}</span>
                      </FilledButton>
                    </div>
                  ) : null}
                </div>
              </ThemedPanel>
            )
          })}
        </div>
      ) : null}
    </section>
  )
}
