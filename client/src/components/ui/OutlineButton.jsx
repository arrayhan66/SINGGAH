function OutlineButton({ children, onClick, className = "" }) {
  return (
    <button
      onClick={onClick}
      className={`cursor-pointer rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-5 py-2.5 text-xs font-semibold text-cyan-300 transition duration-300 hover:bg-cyan-400/20 sm:rounded-2xl sm:px-6 sm:py-3 sm:text-sm md:px-7 md:py-3.5 md:text-sm lg:text-base 3xl:px-8 3xl:py-4 3xl:text-base 4xl:px-10 4xl:py-5 4xl:text-lg ${className}`}
    >
      {children}
    </button>
  )
}

export default OutlineButton
