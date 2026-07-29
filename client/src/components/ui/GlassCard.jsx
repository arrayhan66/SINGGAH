function GlassCard({
  children,
  hover = false,
  light = false,
  className = "",
  onClick,
  ...props
}) {
  const baseStyle = light
    ? "rounded-3xl border border-slate-200 bg-white"
    : "rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl"
  const hoverStyle = hover
    ? "cursor-pointer transition duration-300 hover:-translate-y-3 hover:border-cyan-400/40 hover:bg-white/10"
    : ""

  return (
    <div
      className={`${baseStyle} ${hoverStyle} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  )
}

export default GlassCard
