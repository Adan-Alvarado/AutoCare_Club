import { httpRequest } from '../api/httpClient'

export interface LoginResponseData {
  email: string
  token: string
  refreshToken: string
}

export interface RegisterResponseData {
  id: string
}

export interface ServiceItem {
  id: string
  name: string
  description: string
  price: number
  durationMinutes: number
  imageUrl?: string | null
  isActive: boolean
}

export interface ServiceCreatePayload {
  name: string
  description: string
  price: number
  durationMinutes: number
  imageUrl?: string | null
}

export interface ServiceEditPayload extends ServiceCreatePayload {
  isActive: boolean
}

export interface VehicleDto {
  id: string
  userId: string
  brand: string
  year: number
  licensePlate: string
  vehicleType: string
  isActive: boolean
}

export interface VehicleForm {
  brand: string
  year: number
  licensePlate: string
  vehicleType: string
}

export interface CartItemDto {
  id: string
  serviceId: string
  serviceName: string
  quantity: number
  unitPrice: number
  subtotal: number
}

export interface OrderDto {
  id: string
  vehicleId: string | null
  appointmentId: string | null
  total: number
  status: string
  paymentStatus: string
  paidAt: string | null
  createdAt: string
  items: CartItemDto[]
}

export interface ScheduleAvailabilityDto {
  serviceId: string
  date: string
  startTime: string
  endTime: string
}

export interface AppointmentCreateData {
  vehicleId: string
  serviceId: string
  appointmentDate: string
  startTime: string
  notes?: string
}

export interface AppointmentActionResponseDto {
  id: string
}

export type AppointmentStatus = 'Pending' | 'Confirmed' | 'InProgress' | 'Completed' | 'Cancelled'

export interface AppointmentDto {
  id: string
  userId: string
  vehicleId: string
  serviceId: string
  technicianId: string | null
  appointmentDate: string
  startTime: string
  endTime: string
  status: AppointmentStatus
  notes: string | null
  createdAt: string
}

export interface AppointmentEditPayload extends AppointmentCreateData {
  technicianId: string | null
  status: AppointmentStatus
}

export interface PageDto<T> {
  currentPage: number
  hasNextPage: boolean
  hasPreviousPage: boolean
  pageSize: number
  totalItems: number
  totalPages: number
  items: T
}

export interface RoleDto {
  id: string
  name: string
  description: string
}

export interface RolePayload {
  name: string
  description: string
}

export interface ScheduleDto {
  id: string
  dayOfWeek: number
  startTime: string
  endTime: string
  isAvailable: boolean
}

export interface SchedulePayload {
  dayOfWeek: number
  startTime: string
  endTime: string
  isAvailable: boolean
}

export interface TechnicianDto {
  userId: string
  firstName: string
  lastName: string
  email: string
  specialty: string
  isActive: boolean
  createdAt: string
}

export interface UserAdminDto {
  id: string
  firstName: string
  lastName: string
  email: string
  createdAt: string
  roles?: string[] | null
}

export interface PaymentIntentDto {
  paymentIntentId: string
  clientSecret: string
  publishableKey: string
  amount: number
  currency: string
  status: string
}

export async function loginUser(email: string, password: string): Promise<LoginResponseData> {
  const result = await httpRequest<LoginResponseData>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })

  if (!result.status || !result.data) {
    throw new Error(result.message || 'No se pudo iniciar sesión')
  }

  return result.data
}

export async function registerUser(firstName: string, lastName: string, email: string, password: string, confirmPassword: string): Promise<RegisterResponseData> {
  const result = await httpRequest<RegisterResponseData>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ firstName, lastName, email, password, confirmPassword }),
  })

  if (!result.status || !result.data) {
    throw new Error(result.message || 'No se pudo crear la cuenta')
  }

  return result.data
}

export async function getServices(): Promise<ServiceItem[]> {
  const result = await httpRequest<ServiceItem[]>('/api/services', {
    method: 'GET',
  })

  return result.data ?? []
}

export async function createService(data: ServiceCreatePayload): Promise<ServiceItem> {
  const result = await httpRequest<ServiceItem>('/api/services', {
    method: 'POST',
    body: JSON.stringify(data),
  })

  if (!result.status || !result.data) {
    throw new Error(result.message || 'No se pudo crear el servicio')
  }

  return result.data
}

export async function updateService(id: string, data: ServiceEditPayload): Promise<ServiceItem> {
  const result = await httpRequest<ServiceItem>(`/api/services/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })

  if (!result.status || !result.data) {
    throw new Error(result.message || 'No se pudo actualizar el servicio')
  }

  return result.data
}

export async function deleteService(id: string): Promise<void> {
  const result = await httpRequest<void>(`/api/services/${id}`, { method: 'DELETE' })
  if (!result.status && result.statusCode !== 204) {
    throw new Error(result.message || 'No se pudo eliminar el servicio')
  }
}

export async function getVehicles(): Promise<VehicleDto[]> {
  const result = await httpRequest<VehicleDto[]>('/api/vehicles', {
    method: 'GET',
  })

  return result.data ?? []
}

export async function createVehicle(data: VehicleForm): Promise<VehicleDto> {
  const result = await httpRequest<VehicleDto>('/api/vehicles', {
    method: 'POST',
    body: JSON.stringify(data),
  })

  if (!result.status || !result.data) {
    throw new Error(result.message || 'No se pudo crear el vehículo')
  }

  return result.data
}

export async function updateVehicle(id: string, data: VehicleForm): Promise<VehicleDto> {
  const result = await httpRequest<VehicleDto>(`/api/vehicles/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })

  if (!result.status || !result.data) {
    throw new Error(result.message || 'No se pudo actualizar el vehículo')
  }

  return result.data
}

export async function deleteVehicle(id: string): Promise<void> {
  const result = await httpRequest<void>(`/api/vehicles/${id}`, {
    method: 'DELETE',
  })

  if (!result.status && result.statusCode !== 204) {
    throw new Error(result.message || 'No se pudo eliminar el vehículo')
  }
}

export async function getCart(): Promise<OrderDto | null> {
  try {
    const result = await httpRequest<OrderDto>('/api/cart', {
      method: 'GET',
    })

    return result.data
  } catch (error) {
    if (error instanceof Error && error.message === 'No hay un carrito activo.') {
      return null
    }

    throw error
  }
}

export async function addCartItem(serviceId: string, quantity = 1): Promise<OrderDto> {
  const result = await httpRequest<OrderDto>('/api/cart/items', {
    method: 'POST',
    body: JSON.stringify({ serviceId, quantity }),
  })

  if (!result.status || !result.data) {
    throw new Error(result.message || 'No se pudo agregar el servicio al carrito')
  }

  return result.data
}

export async function updateCartItem(id: string, quantity: number): Promise<OrderDto> {
  const result = await httpRequest<OrderDto>(`/api/cart/items/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ quantity }),
  })

  if (!result.status || !result.data) {
    throw new Error(result.message || 'No se pudo actualizar la cantidad')
  }

  return result.data
}

export async function deleteCartItem(id: string): Promise<void> {
  await httpRequest<void>(`/api/cart/items/${id}`, {
    method: 'DELETE',
  })
}

export async function getAvailableSchedules(
  serviceId: string,
  date: string,
): Promise<ScheduleAvailabilityDto[]> {
  const params = new URLSearchParams({ serviceId, date })
  const result = await httpRequest<ScheduleAvailabilityDto[]>(
    `/api/schedules/available?${params.toString()}`,
    { method: 'GET' },
  )

  return result.data ?? []
}

export async function createAppointment(
  data: AppointmentCreateData,
): Promise<AppointmentActionResponseDto> {
  const result = await httpRequest<AppointmentActionResponseDto>('/api/appointments', {
    method: 'POST',
    body: JSON.stringify(data),
  })

  if (!result.status || !result.data) {
    throw new Error(result.message || 'No se pudo crear la cita')
  }

  return result.data
}

export async function checkoutCart(
  vehicleId: string,
  appointmentId: string,
): Promise<OrderDto> {
  const result = await httpRequest<OrderDto>('/api/cart/checkout', {
    method: 'POST',
    body: JSON.stringify({ vehicleId, appointmentId }),
  })

  if (!result.status || !result.data) {
    throw new Error(result.message || 'No se pudo confirmar la orden')
  }

  return result.data
}

export async function getAppointments(): Promise<AppointmentDto[]> {
  const result = await httpRequest<AppointmentDto[]>('/api/appointments', { method: 'GET' })
  return result.data ?? []
}

export async function getMyAppointments(): Promise<AppointmentDto[]> {
  const result = await httpRequest<AppointmentDto[]>('/api/appointments/me', { method: 'GET' })
  return result.data ?? []
}

export async function cancelAppointment(id: string): Promise<void> {
  const result = await httpRequest<AppointmentActionResponseDto>(`/api/appointments/${id}/cancel`, {
    method: 'PATCH',
  })

  if (!result.status) {
    throw new Error(result.message || 'No se pudo cancelar la cita')
  }
}

export async function getTechnicianAppointments(): Promise<AppointmentDto[]> {
  const result = await httpRequest<AppointmentDto[]>('/api/appointments/technician/me', { method: 'GET' })
  return result.data ?? []
}

export async function updateAppointment(id: string, data: AppointmentEditPayload): Promise<void> {
  const statusValues: Record<AppointmentStatus, number> = {
    Pending: 0,
    Confirmed: 1,
    InProgress: 2,
    Completed: 3,
    Cancelled: 4,
  }
  const result = await httpRequest<AppointmentActionResponseDto>(`/api/appointments/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ ...data, status: statusValues[data.status] }),
  })
  if (!result.status) throw new Error(result.message || 'No se pudo actualizar la cita')
}

export async function updateTechnicianAppointmentStatus(id: string, status: AppointmentStatus): Promise<void> {
  const result = await httpRequest<AppointmentActionResponseDto>(`/api/appointments/${id}/technician-status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  })
  if (!result.status) throw new Error(result.message || 'No se pudo actualizar el estado')
}

export async function getTechnicians(): Promise<TechnicianDto[]> {
  const result = await httpRequest<PageDto<TechnicianDto[]>>('/api/technicians?page=1&pageSize=100&includeInactive=false', {
    method: 'GET',
  })
  return result.data?.items ?? []
}

export async function getUsers(): Promise<UserAdminDto[]> {
  const result = await httpRequest<PageDto<UserAdminDto[]>>('/api/users?page=1&pageSize=100', {
    method: 'GET',
  })
  return result.data?.items ?? []
}

export async function updateUserRole(
  userId: string,
  role: 'Customer' | 'Technician' | 'Admin',
  specialty: string,
  profile: { firstName: string; lastName: string; email: string },
): Promise<void> {
  const roles = role === 'Admin' ? ['Admin'] : role === 'Technician' ? ['Technician'] : ['Customer']
  const result = await httpRequest(`/api/users/${userId}`, {
    method: 'PUT',
    body: JSON.stringify({
      firstName: profile.firstName,
      lastName: profile.lastName,
      email: profile.email,
      roles,
      specialty: specialty.trim() || 'General',
      password: 'Temp123!',
      confirmPassword: 'Temp123!',
      changePassword: false,
    }),
  })

  if (!result.status) {
    throw new Error(result.message || 'No se pudo actualizar el usuario')
  }
}

export async function getRoles(): Promise<RoleDto[]> {
  const result = await httpRequest<PageDto<RoleDto[]>>('/api/role?page=1&pageSize=100', { method: 'GET' })
  return result.data?.items ?? []
}

export async function getSchedules(): Promise<ScheduleDto[]> {
  const result = await httpRequest<ScheduleDto[]>('/api/schedules', { method: 'GET' })
  return result.data ?? []
}

export async function createSchedule(data: SchedulePayload): Promise<void> {
  const result = await httpRequest<{ id: string }>('/api/schedules', {
    method: 'POST',
    body: JSON.stringify(data),
  })
  if (!result.status) throw new Error(result.message || 'No se pudo crear el horario')
}

export async function updateSchedule(id: string, data: SchedulePayload): Promise<void> {
  const result = await httpRequest<{ id: string }>(`/api/schedules/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
  if (!result.status) throw new Error(result.message || 'No se pudo actualizar el horario')
}

export async function deleteSchedule(id: string): Promise<void> {
  const result = await httpRequest<void>(`/api/schedules/${id}`, { method: 'DELETE' })
  if (!result.status && result.statusCode !== 204) {
    throw new Error(result.message || 'No se pudo eliminar el horario')
  }
}

export async function createPaymentIntent(orderId: string): Promise<PaymentIntentDto> {
  const result = await httpRequest<PaymentIntentDto>(`/api/payments/orders/${orderId}/intent`, {
    method: 'POST',
  })
  if (!result.status || !result.data) {
    throw new Error(result.message || 'No se pudo preparar el pago con tarjeta')
  }
  return result.data
}
