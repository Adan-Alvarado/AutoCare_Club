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
import AdminSectionHeader from './components/AdminSectionHeader'

const roleOptions = ['Customer', 'Technician', 'Admin'] as const

type RoleOption = (typeof roleOptions)[number]

const roleLabels: Record<RoleOption, string> = {
  Customer: 'Cliente',
  Technician: 'Técnico',
  Admin: 'Administrador',
}

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
      setDrafts((current) => {
        const next = { ...current }
        delete next[user.id]
        return next
      })
      setFeedback(`Se actualizó el perfil de ${user.firstName} ${user.lastName}.`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar el cambio')
    }
  }

  return (
    <section className="admin-section admin-section--users" aria-labelledby="admin-users-title">
      <AdminSectionHeader
        id="admin-users-title"
        title="Usuarios"
        description="Asigna uno de los tres roles del sistema y la especialidad de los técnicos."
        action={<FilledButton className="admin-action" onClick={() => void refreshUsers()} disabled={loading || usersQuery.isFetching || techniciansQuery.isFetching}>Actualizar</FilledButton>}
      />

      {feedback ? <p className="admin-feedback" role="status">{feedback}</p> : null}
      {error || usersQuery.error || techniciansQuery.error ? <p className="admin-error" role="alert">{error || 'No se pudieron cargar los usuarios'}</p> : null}
      {loading ? <Loading /> : null}
      {!loading && users.length === 0 ? <EmptyState message="No hay usuarios para mostrar." /> : null}

      {!loading ? (
        <div className="admin-list">
          {users.map((user) => (
            <ThemedPanel key={user.id} className="admin-record">
              <div className="admin-record__layout">
                <div className="admin-record__identity">
                  <h3>{user.firstName} {user.lastName}</h3>
                  <p>{user.email}</p>
                  <p className="admin-record__accent">Rol seleccionado: {roleLabels[user.selectedRole]}</p>
                </div>

                <div className="admin-record__controls">
                  <label className="admin-field">
                    Rol
                    <select
                      value={user.selectedRole}
                      onChange={(event) => {
                        const nextRole = event.target.value as RoleOption
                        updateDraft(user.id, { selectedRole: nextRole })
                      }}
                    >
                      {roleOptions.map((option) => (
                        <option key={option} value={option}>{roleLabels[option]}</option>
                      ))}
                    </select>
                  </label>

                  {user.selectedRole === 'Technician' ? (
                    <label className="admin-field">
                      Especialidad
                      <input
                        value={user.specialty}
                        onChange={(event) => {
                          updateDraft(user.id, { specialty: event.target.value })
                        }}
                        placeholder="Ej. Mecánica general"
                      />
                    </label>
                  ) : null}

                  <FilledButton className="admin-action" onClick={() => void handleSave(user)} disabled={savingUserId === user.id}>
                    {savingUserId === user.id ? 'Guardando...' : 'Guardar'}
                  </FilledButton>
                </div>
              </div>
            </ThemedPanel>
          ))}
        </div>
      ) : null}
    </section>
  )
}
