import GlowBackground from "./GlowBackground"

function AdminHeroBackground({ children, className = "" }) {
  return (
    <div className={`relative overflow-hidden bg-brand-dark ${className}`}>
      <GlowBackground />
      <div className="relative z-10">{children}</div>
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at top center, transparent 0%, rgba(4,29,56,0.2) 50%, rgba(4,29,56,0.85) 100%)",
        }}
      />
    </div>
  )
}

export default AdminHeroBackground
