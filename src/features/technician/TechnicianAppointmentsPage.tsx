import { useEffect, useState } from 'react'
import { CalendarDays } from 'lucide-react'
import Loading from '../../components/Loading'
import EmptyState from '../../components/EmptyState'
import { FilledButton } from '../../components/Buttons'
import { ThemedPanel } from '../../components/Panel'
import { getServices, getTechnicianAppointments, updateTechnicianAppointmentStatus, type AppointmentDto, type AppointmentStatus, type ServiceItem } from '../../services/api'

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
  const [appointments, setAppointments] = useState<AppointmentDto[]>([])
  const [services, setServices] = useState<ServiceItem[]>([])
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [error, setError] = useState('')

  async function loadData() {
    setLoading(true)
    setError('')
    try {
      const [appointmentData, serviceData] = await Promise.all([getTechnicianAppointments(), getServices()])
      setAppointments(appointmentData)
      setServices(serviceData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron cargar tus citas')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let active = true
    void Promise.all([getTechnicianAppointments(), getServices()])
      .then(([appointmentData, serviceData]) => {
        if (!active) return
        setAppointments(appointmentData)
        setServices(serviceData)
      })
      .catch((err: unknown) => { if (active) setError(err instanceof Error ? err.message : 'No se pudieron cargar tus citas') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  async function advance(appointment: AppointmentDto) {
    const status = nextStatus(appointment.status)
    if (!status) return
    setSavingId(appointment.id)
    setError('')
    try {
      await updateTechnicianAppointmentStatus(appointment.id, status)
      await loadData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo actualizar la cita')
    } finally {
      setSavingId(null)
    }
  }

  return (
    <main className="content-page m-8">
      <div className="page-header">
        <div>
          <h1 className="mb-2 text-4xl font-bold text-gray-200">Mis citas asignadas</h1>
          <p className="text-gray-400">Actualiza cada trabajo a medida que avanza.</p>
        </div>
        <FilledButton onClick={() => void loadData()} disabled={loading}>Actualizar</FilledButton>
      </div>
      {error ? <p className="error" role="alert">{error}</p> : null}
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
