import { useEffect, useState, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Clock3, Pencil, Plus, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router'
import { useAuth } from '../../contexts/useAuth'
import Loading from '../../components/Loading'
import EmptyState from '../../components/EmptyState'
import { FilledButton } from '../../components/Buttons'
import { ThemedPanel } from '../../components/Panel'
import { createSchedule, deleteSchedule, getSchedules, updateSchedule, type ScheduleDto, type SchedulePayload } from '../../services/api'
import { queryKeys } from '../../services/queryKeys'
import AdminSectionHeader from './components/AdminSectionHeader'

const dayLabels = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

const emptyForm = {
  dayOfWeek: 1,
  startTime: '08:00',
  endTime: '17:00',
  isAvailable: true,
}

function toInputTime(value?: string | null) {
  if (!value) return ''
  return value.length > 5 ? value.slice(0, 5) : value
}

export default function SchedulesPage() {
  const { role } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const isAdmin = role === 'Admin'
  const [form, setForm] = useState(emptyForm)
  const [editing, setEditing] = useState<ScheduleDto | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [error, setError] = useState('')
  const [feedback, setFeedback] = useState('')

  useEffect(() => {
    if (!isAdmin) {
      navigate('/services', { replace: true })
    }
  }, [isAdmin, navigate])

  const schedulesQuery = useQuery({ queryKey: queryKeys.adminSchedules, queryFn: getSchedules })
  const saveMutation = useMutation({
    mutationFn: ({ id, payload }: { id?: string; payload: SchedulePayload }) => (
      id ? updateSchedule(id, payload) : createSchedule(payload)
    ),
  })
  const deleteMutation = useMutation({ mutationFn: (id: string) => deleteSchedule(id) })

  const schedules = schedulesQuery.data ?? []
  const loading = schedulesQuery.isLoading
  const saving = saveMutation.isPending || deleteMutation.isPending

  function closeForm() {
    setFormOpen(false)
    setEditing(null)
    setForm(emptyForm)
  }

  function openEdit(schedule: ScheduleDto) {
    setEditing(schedule)
    setForm({
      dayOfWeek: schedule.dayOfWeek,
      startTime: toInputTime(schedule.startTime),
      endTime: toInputTime(schedule.endTime),
      isAvailable: schedule.isAvailable,
    })
    setFormOpen(true)
  }

  async function saveSchedule(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setFeedback('')

    if (form.startTime >= form.endTime) {
      setError('La hora de inicio debe ser anterior a la hora final.')
      return
    }

    try {
      const payload: SchedulePayload = {
        dayOfWeek: form.dayOfWeek,
        startTime: form.startTime,
        endTime: form.endTime,
        isAvailable: form.isAvailable,
      }

      await saveMutation.mutateAsync({ id: editing?.id, payload })
      await queryClient.invalidateQueries({ queryKey: queryKeys.adminSchedules })
      setFeedback(editing ? 'Horario actualizado correctamente.' : 'Horario creado correctamente.')
      closeForm()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar el horario')
    }
  }

  async function removeSchedule(schedule: ScheduleDto) {
    if (!window.confirm(`¿Eliminar el horario de ${dayLabels[schedule.dayOfWeek]} ${toInputTime(schedule.startTime)}-${toInputTime(schedule.endTime)}?`)) return

    setError('')
    try {
      await deleteMutation.mutateAsync(schedule.id)
      setFeedback('Horario eliminado correctamente.')
      await queryClient.invalidateQueries({ queryKey: queryKeys.adminSchedules })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo eliminar el horario')
    }
  }

  return (
    <section className="admin-section admin-section--schedules" aria-labelledby="admin-schedules-title">
      <AdminSectionHeader
        id="admin-schedules-title"
        title="Horarios"
        description="Administra los bloques de atención disponibles para las citas."
        action={(
          <FilledButton className="admin-action" onClick={() => { setEditing(null); setForm(emptyForm); setFormOpen(true) }}>
            <Plus size={16} />
            <span className="ml-2">Crear horario</span>
          </FilledButton>
        )}
      />

      {feedback ? <p className="admin-feedback" role="status">{feedback}</p> : null}
      {error || schedulesQuery.error ? <p className="admin-error" role="alert">{error || (schedulesQuery.error instanceof Error ? schedulesQuery.error.message : 'No se pudieron cargar los horarios')}</p> : null}
      {loading ? <Loading /> : null}
      {!loading && schedules.length === 0 ? <EmptyState message="No hay horarios registrados." /> : null}

      {!loading ? (
        <div className="admin-list">
          {schedules.map((schedule) => (
            <ThemedPanel key={schedule.id} className="admin-record">
              <div className="admin-record__layout admin-record__layout--simple">
                <div className="admin-schedule__lead">
                  <div className="admin-schedule__icon"><Clock3 size={20} /></div>
                  <div className="admin-record__identity">
                    <h3>{dayLabels[schedule.dayOfWeek] ?? 'Día no definido'}</h3>
                    <p>{toInputTime(schedule.startTime)}–{toInputTime(schedule.endTime)}</p>
                    <p className="admin-record__accent">{schedule.isAvailable ? 'Disponible' : 'No disponible'}</p>
                  </div>
                </div>

                <div className="admin-icon-actions">
                  <button type="button" onClick={() => openEdit(schedule)} className="admin-icon-button" aria-label={`Editar ${dayLabels[schedule.dayOfWeek]}`}>
                    <Pencil size={16} />
                  </button>
                  <button type="button" onClick={() => void removeSchedule(schedule)} disabled={saving} className="admin-icon-button admin-icon-button--danger" aria-label={`Eliminar ${dayLabels[schedule.dayOfWeek]}`}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </ThemedPanel>
          ))}
        </div>
      ) : null}

      {formOpen ? (
        <div className="admin-modal" role="dialog" aria-modal="true" aria-labelledby="schedule-form-title">
          <form onSubmit={saveSchedule} className="admin-modal__form">
            <h3 id="schedule-form-title">{editing ? 'Editar horario' : 'Crear horario'}</h3>

            <label className="admin-field">
              Día
              <select value={form.dayOfWeek} onChange={(event) => setForm({ ...form, dayOfWeek: Number(event.target.value) })}>
                {dayLabels.map((label, index) => (
                  <option key={label} value={index}>{label}</option>
                ))}
              </select>
            </label>

            <div className="admin-modal__grid">
              <label className="admin-field">
                Hora de inicio
                <input type="time" value={form.startTime} onChange={(event) => setForm({ ...form, startTime: event.target.value })} required />
              </label>
              <label className="admin-field">
                Hora final
                <input type="time" value={form.endTime} onChange={(event) => setForm({ ...form, endTime: event.target.value })} required />
              </label>
            </div>

            <label className="admin-modal__availability">
              <input type="checkbox" checked={form.isAvailable} onChange={(event) => setForm({ ...form, isAvailable: event.target.checked })} />
              Disponible para reservas
            </label>

            <div className="admin-modal__actions">
              <button type="button" onClick={closeForm} className="admin-text-button">Cancelar</button>
              <FilledButton className="admin-action" type="submit" disabled={saving}>{saving ? 'Guardando…' : 'Guardar horario'}</FilledButton>
            </div>
          </form>
        </div>
      ) : null}
    </section>
  )
}
