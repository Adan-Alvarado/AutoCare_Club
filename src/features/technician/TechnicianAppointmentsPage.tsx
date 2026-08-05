import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CalendarDays } from 'lucide-react'
import Loading from '../../components/Loading'
import EmptyState from '../../components/EmptyState'
import { FilledButton } from '../../components/Buttons'
import { ThemedPanel } from '../../components/Panel'
import { getServices, getTechnicianAppointments, updateTechnicianAppointmentStatus, type AppointmentDto, type AppointmentStatus, type ServiceItem } from '../../services/api'
import { queryKeys } from '../../services/queryKeys'

const labels: Record<AppointmentStatus, string> = {
  Pending: 'Pendiente', Confirmed: 'Confirmada', InProgress: 'En proceso', Completed: 'Completada', Cancelled: 'Cancelada',
}

function nextStatus(status: AppointmentStatus): AppointmentStatus | null {
  if (status === 'Pending') return 'Confirmed'
  if (status === 'Confirmed') return 'InProgress'
  if (status === 'InProgress') return 'Completed'
  return null
}

export default function TechnicianAppointmentsPage() {
  const [error, setError] = useState('')
  const queryClient = useQueryClient()
  const appointmentsQuery = useQuery({ queryKey: queryKeys.technicianAppointments, queryFn: getTechnicianAppointments })
  const servicesQuery = useQuery({ queryKey: queryKeys.services, queryFn: getServices })
  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: AppointmentStatus }) => updateTechnicianAppointmentStatus(id, status),
  })
  const appointments: AppointmentDto[] = appointmentsQuery.data ?? []
  const services: ServiceItem[] = servicesQuery.data ?? []
  const loading = appointmentsQuery.isLoading || servicesQuery.isLoading
  const savingId = statusMutation.isPending ? statusMutation.variables?.id ?? null : null

  async function refreshData() {
    setError('')
    await Promise.all([appointmentsQuery.refetch(), servicesQuery.refetch()])
  }

  async function advance(appointment: AppointmentDto) {
    const status = nextStatus(appointment.status)
    if (!status) return
    setError('')
    try {
      await statusMutation.mutateAsync({ id: appointment.id, status })
      await queryClient.invalidateQueries({ queryKey: queryKeys.technicianAppointments })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo actualizar la cita')
    }
  }

  return (
    <main className="content-page m-8">
      <div className="page-header">
        <div>
          <h1 className="mb-2 text-4xl font-bold text-gray-200">Mis citas asignadas</h1>
          <p className="text-gray-400">Actualiza cada trabajo a medida que avanza.</p>
        </div>
        <FilledButton onClick={() => void refreshData()} disabled={appointmentsQuery.isFetching || servicesQuery.isFetching}>Actualizar</FilledButton>
      </div>
      {error || appointmentsQuery.error || servicesQuery.error ? <p className="error" role="alert">{error || 'No se pudieron cargar tus citas'}</p> : null}
      {loading ? <Loading /> : null}
      {!loading && appointments.length === 0 ? <EmptyState message="No tienes citas asignadas." /> : null}
      {!loading ? (
        <div className="mt-5 space-y-4">
          {appointments.map((appointment) => {
            const service = services.find((entry) => entry.id === appointment.serviceId)
            const next = nextStatus(appointment.status)
            return (
              <ThemedPanel key={appointment.id} className="flex flex-wrap items-center justify-between gap-5 rounded-2xl">
                <div>
                  <div className="flex items-center gap-2 text-sm text-gray-400"><CalendarDays size={17} />{appointment.appointmentDate} · {appointment.startTime.slice(0, 5)}</div>
                  <h2 className="mt-2 text-xl font-bold text-gray-100">{service?.name ?? 'Servicio'}</h2>
                  <p className="mt-1 text-sm text-gray-400">Estado: {labels[appointment.status]}</p>
                </div>
                {next ? <FilledButton onClick={() => void advance(appointment)} disabled={savingId === appointment.id}>{savingId === appointment.id ? 'Actualizando...' : `Marcar como ${labels[next].toLowerCase()}`}</FilledButton> : null}
              </ThemedPanel>
            )
          })}
        </div>
      ) : null}
    </main>
  )
}
