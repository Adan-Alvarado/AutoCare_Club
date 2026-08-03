import { httpRequest } from '../api/httpClient'

export interface LoginResponseData {
  email: string
  token: string
  refreshToken: string
}

export interface RegisterResponseData {
  email: string
  token: string
  refreshToken: string
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
