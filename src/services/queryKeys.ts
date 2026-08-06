export const queryKeys = {
  services: ['services'] as const,
  vehicles: ['vehicles'] as const,
  cart: ['cart'] as const,
  roles: ['roles'] as const,
  technicians: ['technicians'] as const,
  adminUsers: ['users', 'admin'] as const,
  adminAppointments: ['appointments', 'admin'] as const,
  customerAppointments: ['appointments', 'customer'] as const,
  technicianAppointments: ['appointments', 'technician'] as const,
  schedules: (serviceId: string, date: string) => ['schedules', serviceId, date] as const,
}
