import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import { useAuth } from '../../contexts/useAuth'
import type { LoginFormState } from '../../types'
import { FilledButton } from '../../components/Buttons'
import { Alert } from '../../components/ui/alert'
import { Input } from '../../components/ui/input'
import { ThemedPanel } from '../../components/Panel'

const initialForm: LoginFormState = {
  email: '',
  password: '',
}

export default function LoginPage() {
  // El formulario delega autenticación al contexto para no conocer tokens ni HTTP.
  const navigate = useNavigate()
  const { isAuthenticated, role, signIn } = useAuth()
  const [form, setForm] = useState<LoginFormState>(initialForm)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isAuthenticated) {
      const destination = role === 'Admin'
        ? '/admin'
        : role === 'Technician'
          ? '/technician/appointments'
          : '/services'
      navigate(destination, { replace: true })
    }
  }, [isAuthenticated, navigate, role])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError('')

    try {
      await signIn(form)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo iniciar sesión')
    }

    // Se ejecuta tras éxito o error sin usar finally, aún no soportado por el compilador Rust.
    setLoading(false)
  }

  return (
    <main className="flex min-h-dvh items-center justify-center px-4 py-8 sm:px-6">
      <ThemedPanel className="grid w-full max-w-4xl gap-8 p-6 shadow-2xl shadow-black/20 md:grid-cols-2 md:p-10">
        <div className="flex flex-col gap-3">
          <p className="eyebrow text-amber-300">Iniciar sesión</p>
          <h1 className="font-[var(--ac-font-display)] text-4xl font-bold tracking-tight text-white">Accede a tu cuenta de AutoCare</h1>
          <p className="text-sm leading-6 text-gray-400">
            Usa tu correo y contraseña para explorar servicios y administrar tus vehículos.
          </p>
        </div>
        
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
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
              autoComplete="current-password"
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
              required
            />
          </label>
          <FilledButton type="submit" disabled={loading} className="mt-2 w-full">
              {loading ? 'Ingresando...' : 'Iniciar sesión'}
          </FilledButton>
          <p className="text-sm text-gray-400">
            ¿No tienes cuenta?{' '}
            <Link to="/register" className="font-semibold text-amber-200 underline underline-offset-4">
              Regístrate
            </Link>
          </p>
        </form> 

        {error ? <Alert variant="destructive" role="alert" className="md:col-span-2">{error}</Alert> : null}
      </ThemedPanel>
    </main>
  )
}
