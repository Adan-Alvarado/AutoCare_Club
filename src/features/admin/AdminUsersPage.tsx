import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { useAuth } from '../../contexts/useAuth'
import Loading from '../../components/Loading'
import EmptyState from '../../components/EmptyState'
import { FilledButton } from '../../components/Buttons'
import { ThemedPanel } from '../../components/Panel'
import { getUsers, getTechnicians, updateUserRole, type UserAdminDto, type TechnicianDto } from '../../services/api'

const roleOptions = ['Customer', 'Technician', 'Admin'] as const

type RoleOption = (typeof roleOptions)[number]

interface AdminUserRow extends UserAdminDto {
  selectedRole: RoleOption
  specialty: string
}

export default function AdminUsersPage() {
  const { role } = useAuth()
  const navigate = useNavigate()
  const isAdmin = role === 'Admin'
  const [users, setUsers] = useState<AdminUserRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [feedback, setFeedback] = useState('')
  const [savingUserId, setSavingUserId] = useState<string | null>(null)

  useEffect(() => {
    if (!isAdmin) {
      navigate('/services', { replace: true })
      return
    }

    void loadUsers()
  }, [isAdmin, navigate])

  async function loadUsers() {
    setLoading(true)
    setError('')
    setFeedback('')

    try {
      const [userList, technicianList] = await Promise.all([getUsers(), getTechnicians()])
      const technicianByUserId = new Map<string, TechnicianDto>()
      technicianList.forEach((technician) => technicianByUserId.set(technician.userId, technician))

      setUsers(
        userList.map((user) => {
          const normalizedRoles = Array.isArray(user.roles) ? user.roles : []
          const currentRole = normalizedRoles.includes('Admin')
            ? 'Admin'
            : normalizedRoles.includes('Technician')
              ? 'Technician'
              : 'Customer'

          const technician = technicianByUserId.get(user.id)

          return {
            ...user,
            roles: normalizedRoles,
            selectedRole: currentRole as RoleOption,
            specialty: technician?.specialty ?? '',
          }
        }),
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron cargar los usuarios')
    } finally {
      setLoading(false)
    }
  }

  async function handleSave(user: AdminUserRow) {
    setSavingUserId(user.id)
    setError('')
    setFeedback('')

    try {
      await updateUserRole(user.id, user.selectedRole, user.specialty, {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      })
      setFeedback(`Se actualizó el perfil de ${user.firstName} ${user.lastName}.`)
      await loadUsers()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar el cambio')
    } finally {
      setSavingUserId(null)
    }
  }

  return (
    <main className="content-page m-8">
      <div className="page-header">
        <div>
          <h1 className="mb-2 text-4xl font-bold text-gray-200">Usuarios</h1>
          <p className="text-gray-400">Administra los roles y la especialidad de los técnicos.</p>
        </div>
        <FilledButton onClick={() => void loadUsers()} disabled={loading}>Actualizar</FilledButton>
      </div>

      {feedback ? <p className="mb-4 text-sm text-emerald-300" role="status">{feedback}</p> : null}
      {error ? <p className="error" role="alert">{error}</p> : null}
      {loading ? <Loading /> : null}
      {!loading && users.length === 0 ? <EmptyState message="No hay usuarios para mostrar." /> : null}

      {!loading ? (
        <div className="mt-5 space-y-3">
          {users.map((user) => (
            <ThemedPanel key={user.id} className="rounded-2xl">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <h2 className="text-lg font-bold text-gray-100">{user.firstName} {user.lastName}</h2>
                  <p className="mt-1 text-sm text-gray-400">{user.email}</p>
                </div>

                <div className="flex flex-col gap-3 md:flex-row md:items-end">
                  <label className="flex flex-col gap-1 text-sm text-gray-300">
                    Rol
                    <select
                      value={user.selectedRole}
                      onChange={(event) => {
                        const nextRole = event.target.value as RoleOption
                        setUsers((current) => current.map((item) => item.id === user.id ? { ...item, selectedRole: nextRole } : item))
                      }}
                      className="rounded-xl border border-gray-700 bg-black px-3 py-2 text-gray-100"
                    >
                      {roleOptions.map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </label>

                  {user.selectedRole === 'Technician' ? (
                    <label className="flex flex-col gap-1 text-sm text-gray-300 min-w-60">
                      Especialidad
                      <input
                        value={user.specialty}
                        onChange={(event) => {
                          setUsers((current) => current.map((item) => item.id === user.id ? { ...item, specialty: event.target.value } : item))
                        }}
                        placeholder="Ej. Mecánica general"
                        className="rounded-xl border border-gray-700 bg-black px-3 py-2 text-gray-100"
                      />
                    </label>
                  ) : null}

                  <FilledButton onClick={() => void handleSave(user)} disabled={savingUserId === user.id}>
                    {savingUserId === user.id ? 'Guardando...' : 'Guardar'}
                  </FilledButton>
                </div>
              </div>
            </ThemedPanel>
          ))}
        </div>
      ) : null}
    </main>
  )
}
