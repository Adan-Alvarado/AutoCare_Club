import { useNavigate } from 'react-router'
import { FilledButton } from '../../components/Buttons'

export default function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <main className="flex min-h-[65vh] items-center justify-center px-6 text-center">
      <section>
        <p className="text-sm font-semibold text-gray-400">Error 404</p>
        <h1 className="mt-2 text-4xl font-bold text-gray-100">Esta página no existe</h1>
        <p className="mx-auto mt-3 max-w-md text-gray-400">
          La dirección puede estar incompleta o la sección ya no está disponible.
        </p>
        <FilledButton className="mx-auto mt-6" onClick={() => navigate('/services', { replace: true })}>
          Volver a servicios
        </FilledButton>
      </section>
    </main>
  )
}
