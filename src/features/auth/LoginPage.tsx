import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import { useAuth } from '../../contexts/useAuth'
import type { LoginFormState } from '../../types'
import { FilledButton } from '../../components/Buttons'

const initialForm: LoginFormState = {
  email: '',
  password: '',
}

export default function LoginPage() {
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
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="auth-page items-center justify-center h-100vh">
      <div className="absolute top-0 left-0 w-full h-full justify-center items-center flex">
      
      <section className="panel auth-panel w-100 md:w-160 grid grid-cols-1 md:grid-cols-2 gap-4 p-8 rounded-4xl shadow-md border border-gray-800">
        <div className="flex flex-col gap-3">
          <p className="eyebrow">Iniciar sesión</p>
          <h1 className="text-4xl font-bold text-gray-200">Accede a tu cuenta de AutoCare</h1>
          <p className="subtitle text-gray-400">
            Usa tu correo y contraseña para explorar servicios y administrar tus vehículos.
          </p>
        </div>
        
       
        <form className="auth-form flex flex-col gap-3" onSubmit={handleSubmit}>
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
          <div className="h-4"></div>
          <FilledButton type="submit" disabled={loading} className="w-full flex flex-row items-center justify-center gap-2">
              {loading ? 'Ingresando...' : 'Iniciar sesión'}
          </FilledButton>
          <p className="text-sm text-gray-400">
            ¿No tienes cuenta?{' '}
            <Link to="/register" className="text-gray-200 underline">
              Regístrate
            </Link>
          </p>
        </form> 
        

        {error ? <p className="error">{error}</p> : null}
      </section>
      </div>
    </main>
  )
}
