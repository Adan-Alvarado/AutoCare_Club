export default function EmptyState({ message }: { message: string }) {
  // Evita pantallas silenciosas cuando una consulta devuelve una colección vacía.
  return <p className="ac-empty-state">{message}</p>
}
