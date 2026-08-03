export const BorderButton = ({ onClick, type , children , disabled , className }: { onClick?: () => void; type?: "reset" | "submit" | "button"; children: React.ReactNode; disabled?: boolean; className?: string }) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`p-3 rounded-xl text-sm font-medium text-gray-200 hover:bg-gray-200 hover:text-gray-900 border border-gray-700 flex flex-row items-center justify-center ${className || ''}`}
    >
      {children}
    </button>
  )
}
export const FilledButton = ({ onClick, type , children , disabled , className }: { onClick?: () => void; type?: "reset" | "submit" | "button"; children: React.ReactNode; disabled?: boolean; className?: string }) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`p-3 rounded-xl text-sm bg-amber-300 font-medium hover:bg-gray-200 text-gray-900 flex flex-row items-center justify-center ${className || ''}`}
    >
      {children}
    </button>
  )
}