import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router'
import { useAuth } from '../../contexts/useAuth'
import Loading from '../../components/Loading'
import EmptyState from '../../components/EmptyState'
import { FilledButton } from '../../components/Buttons'
import { ThemedPanel } from '../../components/Panel'
import { getUsers, getTechnicians, updateUserRole, type UserAdminDto } from '../../services/api'
import { queryKeys } from '../../services/queryKeys'

const roleOptions = ['Customer', 'Technician', 'Admin'] as const

type RoleOption = (typeof roleOptions)[number]

interface AdminUserRow extends UserAdminDto {
  selectedRole: RoleOption
  specialty: string
}

interface UserDraft {
  selectedRole: RoleOption
  specialty: string
}

export default function AdminUsersPage() {
  const { role } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const isAdmin = role === 'Admin'
  const [drafts, setDrafts] = useState<Record<string, UserDraft>>({})
  const [error, setError] = useState('')
  const [feedback, setFeedback] = useState('')

  const usersQuery = useQuery({ queryKey: queryKeys.adminUsers, queryFn: getUsers })
  const techniciansQuery = useQuery({ queryKey: queryKeys.technicians, queryFn: getTechnicians })
  const saveMutation = useMutation({
    mutationFn: ({ user, draft }: { user: UserAdminDto; draft: UserDraft }) => updateUserRole(user.id, draft.selectedRole, draft.specialty, {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
    }),
  })

  const techniciansByUserId = useMemo(
    () => new Map((techniciansQuery.data ?? []).map((technician) => [technician.userId, technician])),
    [techniciansQuery.data],
  )

  const users = useMemo(() => {
    return (usersQuery.data ?? []).map((user) => {
      const normalizedRoles = Array.isArray(user.roles) ? user.roles : []
      const currentRole = normalizedRoles.includes('Admin')
        ? 'Admin'
        : normalizedRoles.includes('Technician')
          ? 'Technician'
          : 'Customer'

      const technician = techniciansByUserId.get(user.id)
      const draft = drafts[user.id] ?? {
        selectedRole: currentRole as RoleOption,
        specialty: technician?.specialty ?? '',
      }

      return {
        ...user,
        roles: normalizedRoles,
        selectedRole: draft.selectedRole,
        specialty: draft.specialty,
      } as AdminUserRow
    })
  }, [drafts, techniciansByUserId, usersQuery.data])

  const loading = usersQuery.isLoading || techniciansQuery.isLoading
  const savingUserId = saveMutation.isPending ? saveMutation.variables?.user.id ?? null : null

  useEffect(() => {
    if (!isAdmin) {
      navigate('/services', { replace: true })
    }
  }, [isAdmin, navigate])

  async function refreshUsers() {
    setError('')
    setFeedback('')
    await Promise.all([usersQuery.refetch(), techniciansQuery.refetch()])
  }

  function updateDraft(userId: string, values: Partial<UserDraft>) {
    setDrafts((current) => ({
      ...current,
      [userId]: {
        selectedRole: current[userId]?.selectedRole ?? 'Customer',
        specialty: current[userId]?.specialty ?? '',
        ...values,
      },
    }))
  }

  async function handleSave(user: AdminUserRow) {
    const draft = drafts[user.id] ?? { selectedRole: user.selectedRole, specialty: user.specialty }
    setError('')
    setFeedback('')

    try {
      await saveMutation.mutateAsync({ user, draft })
      await Promise.all([usersQuery.refetch(), techniciansQuery.refetch()])
      await queryClient.invalidateQueries({ queryKey: queryKeys.adminUsers })
      setFeedback(`Se actualizó el perfil de ${user.firstName} ${user.lastName}.`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar el cambio')
    }
  }

  return (
    <main className="content-page m-8">
      <div className="page-header">
        <div>
          <h1 className="mb-2 text-4xl font-bold text-gray-200">Usuarios</h1>
          <p className="text-gray-400">Administra los roles y la especialidad de los técnicos.</p>
        </div>
        <FilledButton onClick={() => void refreshUsers()} disabled={loading || usersQuery.isFetching || techniciansQuery.isFetching}>Actualizar</FilledButton>
      </div>

      {feedback ? <p className="mb-4 text-sm text-emerald-300" role="status">{feedback}</p> : null}
      {error || usersQuery.error || techniciansQuery.error ? <p className="error" role="alert">{error || 'No se pudieron cargar los usuarios'}</p> : null}
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
                  <p className="mt-1 text-sm font-medium text-amber-300">Rol actual: {user.selectedRole}</p>
                </div>

                <div className="flex flex-col gap-3 md:flex-row md:items-end">
                  <label className="flex flex-col gap-1 text-sm text-gray-300">
                    Rol
                    <select
                      value={user.selectedRole}
                      onChange={(event) => {
                        const nextRole = event.target.value as RoleOption
                        updateDraft(user.id, { selectedRole: nextRole })
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
                          updateDraft(user.id, { specialty: event.target.value })
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
