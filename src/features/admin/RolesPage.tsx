import { ShieldCheck, UserRound, Wrench } from 'lucide-react'
import { ThemedPanel } from '../../components/Panel'
import AdminSectionHeader from './components/AdminSectionHeader'

const systemRoles = [
  {
    name: 'Customer',
    label: 'Cliente',
    description: 'Reserva servicios, administra sus vehículos y consulta sus citas.',
    icon: UserRound,
  },
  {
    name: 'Technician',
    label: 'Técnico',
    description: 'Consulta las citas asignadas y actualiza el avance de cada servicio.',
    icon: Wrench,
  },
  {
    name: 'Admin',
    label: 'Administrador',
    description: 'Gestiona usuarios, horarios, servicios, técnicos y citas.',
    icon: ShieldCheck,
  },
] as const

export default function RolesPage() {
  return (
    <section className="admin-section admin-section--roles" aria-labelledby="admin-roles-title">
      <AdminSectionHeader
        id="admin-roles-title"
        title="Roles del sistema"
        description="AutoCare utiliza tres perfiles fijos. La asignación se realiza desde Usuarios."
      />

      <div className="admin-role-list">
        {systemRoles.map((role) => {
          const Icon = role.icon
          return (
            <ThemedPanel key={role.name} className="admin-record">
              <div className="admin-role">
                <span className="admin-role__icon">
                  <Icon size={19} aria-hidden="true" />
                </span>
                <div>
                  <h3>{role.label}</h3>
                  <p className="admin-role__name">{role.name}</p>
                  <p className="admin-role__description">{role.description}</p>
                </div>
              </div>
            </ThemedPanel>
          )
        })}
      </div>
    </section>
  )
}
