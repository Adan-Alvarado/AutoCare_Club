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
    <main className="content-page m-8">
      <div className="page-header">
        <div>
          <h1 className="mb-2 text-4xl font-bold text-gray-200">Horarios</h1>
          <p className="text-gray-400">Administra los bloques de atención disponibles para las citas.</p>
        </div>
        <FilledButton onClick={() => { setEditing(null); setForm(emptyForm); setFormOpen(true) }}>
          <Plus size={16} />
          <span className="ml-2">Crear horario</span>
        </FilledButton>
      </div>

      {feedback ? <p className="mb-4 text-sm text-emerald-300" role="status">{feedback}</p> : null}
      {error || schedulesQuery.error ? <p className="error" role="alert">{error || (schedulesQuery.error instanceof Error ? schedulesQuery.error.message : 'No se pudieron cargar los horarios')}</p> : null}
      {loading ? <Loading /> : null}
      {!loading && schedules.length === 0 ? <EmptyState message="No hay horarios registrados." /> : null}

      {!loading ? (
        <div className="mt-5 space-y-3">
          {schedules.map((schedule) => (
            <ThemedPanel key={schedule.id} className="flex flex-col gap-4 rounded-2xl md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-3">
                <div className="rounded-2xl border border-gray-800 bg-gray-900/70 p-3 text-amber-300">
                  <Clock3 size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-100">{dayLabels[schedule.dayOfWeek] ?? 'Día no definido'}</h2>
                  <p className="mt-1 text-sm text-gray-400">
                    {toInputTime(schedule.startTime)} - {toInputTime(schedule.endTime)}
                  </p>
                  <p className="mt-1 text-sm text-amber-300">{schedule.isAvailable ? 'Disponible' : 'No disponible'}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <button type="button" onClick={() => openEdit(schedule)} className="rounded-xl border border-gray-700 p-3 hover:bg-gray-800" aria-label={`Editar ${dayLabels[schedule.dayOfWeek]}`}>
                  <Pencil size={16} />
                </button>
                <button type="button" onClick={() => void removeSchedule(schedule)} disabled={saving} className="rounded-xl border border-red-900 p-3 text-red-300 hover:bg-red-950" aria-label={`Eliminar ${dayLabels[schedule.dayOfWeek]}`}>
                  <Trash2 size={16} />
                </button>
              </div>
            </ThemedPanel>
          ))}
        </div>
      ) : null}

      {formOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <form onSubmit={saveSchedule} className="w-full max-w-lg rounded-2xl border border-gray-800 bg-gray-950 p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-gray-100">{editing ? 'Editar horario' : 'Crear horario'}</h2>

            <label className="mt-5 flex flex-col gap-1 text-sm text-gray-300">
              Día
              <select
                value={form.dayOfWeek}
                onChange={(event) => setForm({ ...form, dayOfWeek: Number(event.target.value) })}
                className="rounded-xl border border-gray-700 bg-black px-3 py-2 text-gray-100"
              >
                {dayLabels.map((label, index) => (
                  <option key={label} value={index}>{label}</option>
                ))}
              </select>
            </label>

            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <label className="flex flex-col gap-1 text-sm text-gray-300">
                Hora de inicio
                <input
                  type="time"
                  value={form.startTime}
                  onChange={(event) => setForm({ ...form, startTime: event.target.value })}
                  className="rounded-xl border border-gray-700 bg-black px-3 py-2 text-gray-100"
                  required
                />
              </label>
              <label className="flex flex-col gap-1 text-sm text-gray-300">
                Hora final
                <input
                  type="time"
                  value={form.endTime}
                  onChange={(event) => setForm({ ...form, endTime: event.target.value })}
                  className="rounded-xl border border-gray-700 bg-black px-3 py-2 text-gray-100"
                  required
                />
              </label>
            </div>

            <label className="mt-4 flex items-center gap-2 text-sm text-gray-300">
              <input
                type="checkbox"
                checked={form.isAvailable}
                onChange={(event) => setForm({ ...form, isAvailable: event.target.checked })}
                className="h-4 w-4 rounded border-gray-700 bg-black"
              />
              Disponible para reservas
            </label>

            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={closeForm} className="rounded-xl border border-gray-700 px-4 py-2 text-sm text-gray-300">Cancelar</button>
              <FilledButton type="submit" disabled={saving}>{saving ? 'Guardando...' : 'Guardar horario'}</FilledButton>
            </div>
          </form>
        </div>
      ) : null}
    </main>
  )
}
