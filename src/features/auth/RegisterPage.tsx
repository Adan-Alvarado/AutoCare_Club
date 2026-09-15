import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import { useAuth } from '../../contexts/useAuth'
import type { RegisterFormState } from '../../types'
import { FilledButton } from '../../components/Buttons'
import { Alert } from '../../components/ui/alert'
import { Input } from '../../components/ui/input'
import { ThemedPanel } from '../../components/Panel'

const initialForm: RegisterFormState = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
}

export default function RegisterPage() {
  // Tras registro, AuthContext inicia sesión para que el usuario no repita credenciales.
  const navigate = useNavigate()
  const { isAuthenticated, signUp } = useAuth()
  const [form, setForm] = useState<RegisterFormState>(initialForm)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/services', { replace: true })
    }
  }, [isAuthenticated, navigate])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError('')

    if (form.password !== form.confirmPassword) {
      setError('Las contraseñas no coinciden')
      setLoading(false)
      return
    }

    try {
      await signUp(form)
      navigate('/services', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo crear la cuenta')
    }

    // Se ejecuta tras éxito o error sin usar finally, aún no soportado por el compilador Rust.
    setLoading(false)
  }

  return (
    <main className="flex min-h-dvh items-center justify-center px-4 py-8 sm:px-6">
        <ThemedPanel className="grid w-full max-w-4xl gap-8 p-6 shadow-2xl shadow-black/20 md:grid-cols-2 md:p-10">
          <div className="flex flex-col gap-3">
            <p className="eyebrow text-amber-300">Crear cuenta</p>
            <h1 className="font-[var(--ac-font-display)] text-4xl font-bold tracking-tight text-white">Crea tu cuenta de AutoCare</h1>
            <p className="text-sm leading-6 text-gray-400">
              Regístrate para reservar servicios y administrar tus vehículos.
            </p>
          </div>

          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <label className="text-sm font-semibold text-gray-300">
              Nombre
              <Input
                type="text"
                autoComplete="given-name"
                value={form.firstName}
                onChange={(event) => setForm({ ...form, firstName: event.target.value })}
                required
              />
            </label>

            <label className="text-sm font-semibold text-gray-300">
              Apellido
              <Input
                type="text"
                autoComplete="family-name"
                value={form.lastName}
                onChange={(event) => setForm({ ...form, lastName: event.target.value })}
                required
              />
            </label>

            <label className="text-sm font-semibold text-gray-300">
              Correo electrónico
              <Input
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={(event) => setForm({ ...form, email: event.target.value })}
                required
              />
            </label>

            <label className="text-sm font-semibold text-gray-300">
              Contraseña
              <Input
                type="password"
                autoComplete="new-password"
                value={form.password}
                onChange={(event) => setForm({ ...form, password: event.target.value })}
                required
              />
            </label>

            <label className="text-sm font-semibold text-gray-300">
              Confirmar contraseña
              <Input
                type="password"
                autoComplete="new-password"
                value={form.confirmPassword}
                onChange={(event) => setForm({ ...form, confirmPassword: event.target.value })}
                required
              />
            </label>

            <FilledButton type="submit" disabled={loading} className="mt-2 w-full">
              {loading ? 'Creando cuenta...' : 'Registrarme'}
            </FilledButton>

            <p className="text-sm text-gray-400">
              ¿Ya tienes cuenta?{' '}
              <Link to="/login" className="font-semibold text-amber-200 underline underline-offset-4">
                Inicia sesión
              </Link>
            </p>
          </form>

          {error ? <Alert variant="destructive" role="alert" className="md:col-span-2">{error}</Alert> : null}
        </ThemedPanel>
    </main>
  )
}
