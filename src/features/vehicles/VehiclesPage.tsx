import { useEffect, useState, type FormEvent } from 'react'
import { createVehicle, deleteVehicle, getVehicles, updateVehicle } from '../../services/api'
import Loading from '../../components/Loading'
import EmptyState from '../../components/EmptyState'
import type { VehicleDto } from '../../services/api'
import { BorderButton, FilledButton } from '../../components/Buttons'
import { ThemedPanel } from '../../components/Panel'


const initialForm = {
  brand: '',
  year: new Date().getFullYear(),
  licensePlate: '',
  vehicleType: '',
}

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<VehicleDto[]>([])
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleDto | null>(null)
  const [form, setForm] = useState(initialForm)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    void loadVehicles()
  }, [])

  async function loadVehicles() {
    setLoading(true)
    setError('')

    try {
      const data = await getVehicles()
      setVehicles(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron cargar los vehículos')
    } finally {
      setLoading(false)
    }
  }

  function startEdit(vehicle: VehicleDto) {
    setSelectedVehicle(vehicle)
    setForm({
      brand: vehicle.brand,
      year: vehicle.year,
      licensePlate: vehicle.licensePlate,
      vehicleType: vehicle.vehicleType,
    })
  }

  function resetForm() {
    setSelectedVehicle(null)
    setForm(initialForm)
    setError('')
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    setError('')

    try {
      if (selectedVehicle) {
        await updateVehicle(selectedVehicle.id, form)
      } else {
        await createVehicle(form)
      }
      await loadVehicles()
      resetForm()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar el vehículo')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    setSaving(true)
    setError('')

    try {
      await deleteVehicle(id)
      await loadVehicles()
      if (selectedVehicle?.id === id) {
        resetForm()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo eliminar el vehículo')
    } finally {
      setSaving(false)
    }
  }

  return (
    <main className="content-page m-8">
      <div className="page-header">
        <div>
          <p className="eyebrow font-">Vehículos</p>
          <h1 className="text-4xl mb-4 font-bold text-gray-200">Gestiona tus vehículos</h1>
        </div>
      </div>

      <section className="grid md:grid-cols-2 gap-4">
        <article className="panel  w-full">
          <ThemedPanel>
          <h2 className="text-xl font-bold text-gray-200 mb-3">{selectedVehicle ? 'Editar vehículo' : 'Agregar vehículo'}</h2>
          <form className="vehicle-form flex flex-col gap-2" onSubmit={handleSubmit}>
            <label>
              Marca
              <input
                type="text"
                value={form.brand}
                onChange={(event) => setForm({ ...form, brand: event.target.value })}
                required
              />
            </label>
            <label>
              Año
              <input
                type="number"
                min={1900}
                max={2100}
                value={form.year}
                onChange={(event) => setForm({ ...form, year: Number(event.target.value) })}
                required
              />
            </label>
            <label>
              Matrícula
              <input
                type="text"
                value={form.licensePlate}
                onChange={(event) => setForm({ ...form, licensePlate: event.target.value })}
                required
              />
            </label>
            <label>
              Tipo
              <input
                type="text"
                value={form.vehicleType}
                onChange={(event) => setForm({ ...form, vehicleType: event.target.value })}
                required
              />
            </label>
            <div className="form-actions flex flex-row gap-2 justify-end mt-4">
              <FilledButton type="submit" disabled={saving}>
                {saving ? 'Guardando...' : selectedVehicle ? 'Guardar cambios' : 'Crear vehículo'}
              </FilledButton>
              {selectedVehicle ? (
                <BorderButton type="button" onClick={resetForm} disabled={saving}>
                  Cancelar
                </BorderButton>
              ) : null}
            </div>
          </form>
          {error ? <p className="error">{error}</p> : null}
          </ThemedPanel>
        </article>

        <article className="panel vehicle-list-panel w-full">
          <ThemedPanel>
            <h2 className="text-xl font-bold text-gray-200 mb-3">Mis vehículos</h2>
          
          {loading ? (
            <Loading />
          ) : vehicles.length === 0 ? (
            <EmptyState message="No hay vehículos registrados." />
          ) : (
            <div className="vehicle-list">
              {vehicles.map((vehicle) => (
                <div className="mb-4 border border-gray-800 rounded-xl p-4" key={vehicle.id}>
                  <div>
                    <strong>{vehicle.brand}</strong>
                    <p>{vehicle.vehicleType}</p>
                  </div>
                  <div>
                    <p>{vehicle.licensePlate}</p>
                    <p>{vehicle.year}</p>
                  </div>
                  <div className="vehicle-actions flex flex-row gap-2 justify-end">
                    <FilledButton type="button" onClick={() => startEdit(vehicle)}>
                      Editar
                    </FilledButton>
                    <BorderButton type="button" onClick={() => void handleDelete(vehicle.id)}>
                      Eliminar
                    </BorderButton>
                  </div>
                </div> 
              ))}
            </div>
          )}
          </ThemedPanel>
        </article>
      </section>
    </main>
  )
}
