import { useState, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import Loading from '../../components/Loading'
import EmptyState from '../../components/EmptyState'
import { FilledButton } from '../../components/Buttons'
import { ThemedPanel } from '../../components/Panel'
import { createRole, deleteRole, getRoles, updateRole, type RoleDto } from '../../services/api'
import { queryKeys } from '../../services/queryKeys'

const emptyForm = { name: '', description: '' }

export default function RolesPage() {
  const [form, setForm] = useState(emptyForm)
  const [editing, setEditing] = useState<RoleDto | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [error, setError] = useState('')
  const [feedback, setFeedback] = useState('')
  const queryClient = useQueryClient()
  const rolesQuery = useQuery({ queryKey: queryKeys.roles, queryFn: getRoles })
  const saveMutation = useMutation({
    mutationFn: ({ id, payload }: { id?: string; payload: typeof form }) => (
      id ? updateRole(id, payload) : createRole(payload)
    ),
  })
  const deleteMutation = useMutation({ mutationFn: (id: string) => deleteRole(id) })
  const roles = rolesQuery.data ?? []
  const loading = rolesQuery.isLoading
  const saving = saveMutation.isPending || deleteMutation.isPending

  function closeForm() {
    setFormOpen(false)
    setEditing(null)
    setForm(emptyForm)
  }

  function openEdit(role: RoleDto) {
    setEditing(role)
    setForm({ name: role.name, description: role.description })
    setFormOpen(true)
  }

  async function saveRole(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setFeedback('')
    try {
      const payload = { name: form.name.trim(), description: form.description.trim() }
      await saveMutation.mutateAsync({ id: editing?.id, payload })
      await queryClient.invalidateQueries({ queryKey: queryKeys.roles })
      setFeedback(editing ? 'Rol actualizado correctamente.' : 'Rol creado correctamente.')
      closeForm()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar el rol')
    }
  }

  async function removeRole(role: RoleDto) {
    if (!window.confirm(`¿Eliminar el rol ${role.name}?`)) return
    setError('')
    try {
      await deleteMutation.mutateAsync(role.id)
      setFeedback('Rol eliminado correctamente.')
      await queryClient.invalidateQueries({ queryKey: queryKeys.roles })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo eliminar el rol')
    }
  }

  return (
    <main className="content-page m-8">
      <div className="page-header">
        <div>
          <h1 className="mb-2 text-4xl font-bold text-gray-200">Roles</h1>
          <p className="text-gray-400">Administra los perfiles disponibles en el sistema.</p>
        </div>
        <FilledButton onClick={() => { setEditing(null); setForm(emptyForm); setFormOpen(true) }}><Plus size={16} /><span className="ml-2">Crear rol</span></FilledButton>
      </div>

      {feedback ? <p className="mb-4 text-sm text-emerald-300" role="status">{feedback}</p> : null}
      {error || rolesQuery.error ? <p className="error" role="alert">{error || (rolesQuery.error instanceof Error ? rolesQuery.error.message : 'No se pudieron cargar los roles')}</p> : null}
      {loading ? <Loading /> : null}
      {!loading && roles.length === 0 ? <EmptyState message="No hay roles registrados." /> : null}

      {!loading ? (
        <div className="mt-5 space-y-3">
          {roles.map((role) => (
            <ThemedPanel key={role.id} className="flex items-center justify-between rounded-2xl">
              <div>
                <h2 className="text-lg font-bold text-gray-100">{role.name}</h2>
                <p className="mt-1 text-sm text-gray-400">{role.description || 'Sin descripción'}</p>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => openEdit(role)} className="rounded-xl border border-gray-700 p-3 hover:bg-gray-800" aria-label={`Editar ${role.name}`}><Pencil size={16} /></button>
                <button type="button" onClick={() => void removeRole(role)} disabled={saving} className="rounded-xl border border-red-900 p-3 text-red-300 hover:bg-red-950" aria-label={`Eliminar ${role.name}`}><Trash2 size={16} /></button>
              </div>
            </ThemedPanel>
          ))}
        </div>
      ) : null}

      {formOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <form onSubmit={saveRole} className="w-full max-w-lg rounded-2xl border border-gray-800 bg-gray-950 p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-gray-100">{editing ? 'Editar rol' : 'Crear rol'}</h2>
            <label className="mt-5 flex flex-col gap-1 text-sm text-gray-300">Nombre
              <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="rounded-xl border border-gray-700 bg-black px-3 py-2 text-gray-100" required />
            </label>
            <label className="mt-3 flex flex-col gap-1 text-sm text-gray-300">Descripción
              <textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} className="rounded-xl border border-gray-700 bg-black px-3 py-2 text-gray-100" rows={3} />
            </label>
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={closeForm} className="rounded-xl border border-gray-700 px-4 py-2 text-sm text-gray-300">Cancelar</button>
              <FilledButton type="submit" disabled={saving}>{saving ? 'Guardando...' : 'Guardar rol'}</FilledButton>
            </div>
          </form>
        </div>
      ) : null}
    </main>
  )
}
