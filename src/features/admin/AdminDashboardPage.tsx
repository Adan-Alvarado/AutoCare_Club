import AdminAppointmentsPage from './AdminAppointmentsPage'
import AdminServicesPage from './AdminServicesPage'
import AdminUsersPage from './AdminUsersPage'
import RolesPage from './RolesPage'
import SchedulesPage from './SchedulesPage'
import './admin.css'

export default function AdminDashboardPage() {
  return (
    <main className="admin-dashboard">
      <header className="admin-dashboard__header">
        <div>
          <h1>Administración</h1>
          <p>Servicios, citas y accesos del taller organizados en una sola vista.</p>
        </div>
      </header>

      <div className="admin-dashboard__sections">
        <AdminServicesPage />
        <AdminAppointmentsPage />
        <AdminUsersPage />
        <SchedulesPage />
        <RolesPage />
      </div>
    </main>
  )
}
