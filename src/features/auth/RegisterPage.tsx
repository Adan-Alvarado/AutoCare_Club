import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import { useAuth } from '../../contexts/useAuth'
import type { RegisterFormState } from '../../types'
import { FilledButton } from '../../components/Buttons'

const initialForm: RegisterFormState = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
}

export default function RegisterPage() {
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
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="auth-page items-center justify-center h-100vh">
      <div className="absolute top-0 left-0 w-full h-full justify-center items-center flex">
        <section className="panel auth-panel w-100 md:w-160 grid grid-cols-1 md:grid-cols-2 gap-4 p-8 rounded-4xl shadow-md border border-gray-800">
          <div className="flex flex-col gap-3">
            <p className="eyebrow">Crear cuenta</p>
            <h1 className="text-4xl font-bold text-gray-200">Crea tu cuenta de AutoCare</h1>
            <p className="subtitle text-gray-400">
              Regístrate para reservar servicios y administrar tus vehículos.
            </p>
          </div>

          <form className="auth-form flex flex-col gap-3" onSubmit={handleSubmit}>
            <label>
              Nombre
              <input
                type="text"
                value={form.firstName}
                onChange={(event) => setForm({ ...form, firstName: event.target.value })}
                required
              />
            </label>

            <label>
              Apellido
              <input
                type="text"
                value={form.lastName}
                onChange={(event) => setForm({ ...form, lastName: event.target.value })}
                required
              />
            </label>

            <label>
              Correo electrónico
              <input
                type="email"
                value={form.email}
                onChange={(event) => setForm({ ...form, email: event.target.value })}
                required
              />
            </label>

            <label>
              Contraseña
              <input
                type="password"
                value={form.password}
                onChange={(event) => setForm({ ...form, password: event.target.value })}
                required
              />
            </label>

            <label>
              Confirmar contraseña
              <input
                type="password"
                value={form.confirmPassword}
                onChange={(event) => setForm({ ...form, confirmPassword: event.target.value })}
                required
              />
            </label>

            <div className="h-4"></div>
            <FilledButton type="submit" disabled={loading} className="w-full flex flex-row items-center justify-center gap-2">
              {loading ? 'Creando cuenta...' : 'Registrarme'}
            </FilledButton>

            <p className="text-sm text-gray-400">
              ¿Ya tienes cuenta?{' '}
              <Link to="/login" className="text-gray-200 underline">
                Inicia sesión
              </Link>
            </p>
          </form>

          {error ? <p className="error">{error}</p> : null}
        </section>
      </div>
    </main>
  )
}
