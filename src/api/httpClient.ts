const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5172'

export interface ApiResponse<T> {
  statusCode: number
  message: string
  status: boolean
  data: T | null
}

export async function httpRequest<T>(path: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  const headers = new Headers(options.headers)
  headers.set('Accept', 'application/json')

  if (!(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }

  const token = localStorage.getItem('auth_token')
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  })

  const rawText = await response.text()
  let payload: unknown = null

  if (rawText) {
    try {
      payload = JSON.parse(rawText)
    } catch {
      payload = rawText
    }
  }

  if (!response.ok) {
    const message =
      typeof payload === 'string'
        ? payload
        : payload && typeof payload === 'object' && 'message' in payload
        ? String((payload as { message?: string }).message)
        : 'La solicitud falló'

    throw new Error(message)
  }

  if (payload && typeof payload === 'object' && 'status' in payload && 'data' in payload) {
    return payload as ApiResponse<T>
  }

  return {
    statusCode: response.status,
    message: 'OK',
    status: true,
    data: (payload as T) ?? null,
  }
}
