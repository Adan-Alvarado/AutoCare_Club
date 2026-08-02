export const ThemedPanel = ({ children , className }: { children: React.ReactNode; className?: string }) => {
  return (
    <div
      className={`p-5 rounded-3xl text-sm font-medium text-gray-200 border border-gray-800 ${className || ''}`}
    >
      {children}
    </div>
  )
}