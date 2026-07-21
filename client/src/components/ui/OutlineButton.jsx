function OutlineButton({ children, onClick, className = "" }) {
  return (
    <button
      onClick={onClick}
      className={`cursor-pointer rounded-2xl border border-cyan-400/30 bg-cyan-400/10 px-8 py-4 font-semibold text-cyan-300 transition duration-300 hover:bg-cyan-400/20 ${className}`}
    >
      {children}
    </button>
  )
}

export default OutlineButton